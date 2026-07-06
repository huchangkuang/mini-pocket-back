import { User } from '@prisma/client';

export type AuthUser = User;

export type JwtPayload = {
  sub: number;
  openid: string;
};
