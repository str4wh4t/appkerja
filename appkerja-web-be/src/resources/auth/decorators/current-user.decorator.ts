import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity.js';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    const ctx = GqlExecutionContext.create(context);
    const graphqlContext = ctx.getContext();
    // Support both 'req' and 'request' for compatibility
    const request = graphqlContext.req || graphqlContext.request;
    return request?.user;
  },
);
