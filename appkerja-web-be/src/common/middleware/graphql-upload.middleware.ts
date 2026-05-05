import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { processRequest } from 'graphql-upload-ts';
import {
  shouldDrainOrphanedMultipartStreams,
  type GraphqlResponseErrorLike,
} from '../graphql/graphql-upload-drain.js';
import type { UploadService } from '../../storage/upload.service.js';

export function graphqlRequestPathname(url: string): string {
  const path = url.split('?')[0] ?? '';
  return path === '' ? '/' : path;
}

/**
 * Daftarkan parser multipart noop + hook preValidation. Panggil **sebelum** `NestFactory.create`
 * pada instance `FastifyAdapter` yang sama agar route `/graphql` ikut aturan ini.
 * Jangan register `@fastify/multipart` global (bentrok busboy / stream).
 */
export function registerGraphqlUpload(
  fastify: FastifyInstance,
  graphqlPath: string,
): void {
  fastify.addContentTypeParser(
    'multipart/form-data',
    (_request, _payload, done) => {
      // Jangan panggil payload.resume() di sini — bisa membuang byte body sebelum busboy membaca.
      done(null, undefined);
    },
  );

  fastify.addHook('preValidation', createGraphqlUploadMiddleware(graphqlPath));
}

/**
 * Hook Fastify: parse multipart GraphQL hanya untuk path yang sama dengan `GraphQLModule.path`.
 */
export function createGraphqlUploadMiddleware(graphqlPath: string) {
  return async function graphqlUploadFastify(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const contentType = request.headers['content-type'];
    const isMultipart =
      typeof contentType === 'string' &&
      contentType.startsWith('multipart/form-data');
    const pathname = graphqlRequestPathname(request.url);
    const isGraphqlPath =
      pathname === graphqlPath || pathname.startsWith(`${graphqlPath}/`);

    if (!isMultipart || !isGraphqlPath) {
      return;
    }

    const body = await processRequest(
      request.raw as unknown as Parameters<typeof processRequest>[0],
      reply.raw as unknown as Parameters<typeof processRequest>[1],
      {
        maxFileSize: 10 * 1024 * 1024,
        maxFiles: 10,
      },
    );

    (request as FastifyRequest & { body: unknown }).body = body;
  };
}

/**
 * Setelah respons GraphQL dikirim: jika request multipart ke GraphQL mengembalikan error
 * variabel/skema (resolver tidak jalan), kosongkan stream upload agar keep-alive tidak macet.
 * Panggil setelah `NestFactory.create` (butuh `UploadService` dari DI).
 */
export function registerGraphqlMultipartUploadDrainOnSend(
  fastify: FastifyInstance,
  graphqlPath: string,
  getUploadService: () => UploadService,
): void {
  fastify.addHook('onSend', async (request, reply, payload) => {
    const req = request as FastifyRequest & { body?: unknown };
    const contentType = req.headers['content-type'];
    const wasMultipartRequest =
      typeof contentType === 'string' &&
      contentType.startsWith('multipart/form-data');
    if (!wasMultipartRequest) {
      return payload;
    }
    const pathname = graphqlRequestPathname(req.url);
    const isGraphqlPath =
      pathname === graphqlPath || pathname.startsWith(`${graphqlPath}/`);
    if (!isGraphqlPath) {
      return payload;
    }
    const replyCt = reply.getHeader('content-type');
    if (
      typeof replyCt === 'string' &&
      replyCt.length > 0 &&
      !replyCt.includes('application/json') &&
      !replyCt.includes('application/graphql-response+json')
    ) {
      return payload;
    }

    let parsed: { errors?: unknown };
    try {
      if (Buffer.isBuffer(payload)) {
        parsed = JSON.parse(payload.toString('utf8')) as { errors?: unknown };
      } else if (typeof payload === 'string') {
        parsed = JSON.parse(payload) as { errors?: unknown };
      } else {
        return payload;
      }
    } catch {
      return payload;
    }

    const errors = parsed.errors;
    if (
      !Array.isArray(errors) ||
      !shouldDrainOrphanedMultipartStreams(
        errors as readonly GraphqlResponseErrorLike[],
      )
    ) {
      return payload;
    }

    const uploadService = getUploadService();
    await uploadService.drainPossibleUploadValuesDeep(req.body);

    return payload;
  });
}
