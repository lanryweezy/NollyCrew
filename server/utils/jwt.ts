import jwt from 'jsonwebtoken';

type JWTPayload = string | object | Buffer;

export function sign(payload: JWTPayload, secret: string, options?: any): string {
  return jwt.sign(payload, secret, options);
}

export function verify(token: string, secret: string, options?: any): any {
  return jwt.verify(token, secret, options);
}


