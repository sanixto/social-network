import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload.interface';

export const User = createParamDecorator<keyof JwtPayload>(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
