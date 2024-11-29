// jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayload) {
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    
    // Si el token expira en menos de 1 hora (3600 segundos)
    if (exp && exp - now < 3600) {
      // Añadir header para indicar que el token necesita renovación
      req.res.setHeader('X-Token-Expired', 'true');
    }

    if (!payload.sub || !payload.username || payload.role === undefined) {
      throw new UnauthorizedException('Token inválido');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      exp: payload.exp,
    };
  }
}
