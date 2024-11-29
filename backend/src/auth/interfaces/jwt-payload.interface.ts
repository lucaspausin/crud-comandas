export interface JwtPayload {
  sub: number;
  username: string;
  role: number;
  exp?: number;
  iat?: number;
} 