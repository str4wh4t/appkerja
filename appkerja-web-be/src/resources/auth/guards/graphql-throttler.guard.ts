import { Injectable, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GraphqlThrottlerGuard extends ThrottlerGuard {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const graphqlContext = ctx.getContext();
    // Support both 'req' and 'request' for compatibility
    return graphqlContext.req || graphqlContext.request;
  }

  getRequestResponse(context: ExecutionContext) {
    // Override untuk GraphQL: return request dan response yang kompatibel dengan Fastify
    const ctx = GqlExecutionContext.create(context);
    const graphqlContext = ctx.getContext();
    const request = graphqlContext.req || graphqlContext.request;
    const reply = graphqlContext.reply;

    // Buat response object yang kompatibel dengan ThrottlerGuard
    // Di GraphQL, kita tidak perlu set headers, jadi return dummy object
    const response = reply
      ? {
          // Fastify reply wrapper
          header: (name: string, value: string | number) => {
            if (reply && typeof reply.header === 'function') {
              reply.header(name, String(value));
            }
          },
          setHeader: (name: string, value: string | number) => {
            if (reply && typeof reply.header === 'function') {
              reply.header(name, String(value));
            }
          },
        }
      : graphqlContext.res ||
        graphqlContext.response || {
          // Dummy object untuk GraphQL (headers tidak diperlukan)
          header: () => {},
          setHeader: () => {},
        };

    return { req: request, res: response };
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Prioritas fairness: request authenticated dibatasi per user, bukan per IP bersama.
    if (req?.user?.id) {
      return `user:${req.user.id}`;
    }

    // Request public / belum authenticated: fallback ke IP dengan beberapa sumber.
    if (req?.ip) {
      return req.ip;
    }

    // Fallback: coba ambil dari headers (untuk proxy/load balancer)
    if (req?.headers) {
      const forwardedFor = req.headers['x-forwarded-for'];
      if (forwardedFor) {
        // Ambil IP pertama dari X-Forwarded-For header
        const ip = Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor.split(',')[0].trim();
        if (ip) {
          return ip;
        }
      }

      const realIp = req.headers['x-real-ip'];
      if (realIp) {
        return Array.isArray(realIp) ? realIp[0] : realIp;
      }
    }

    // Fallback: gunakan socket remote address jika tersedia
    if (req?.socket?.remoteAddress) {
      return req.socket.remoteAddress;
    }

    // Fallback: gunakan default key jika tidak ada yang tersedia
    return 'unknown';
  }
}
