import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { config } from 'src/config/config';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  canActivate = async (context: ExecutionContext): Promise<boolean> => {
    const req = context.switchToHttp().getRequest();

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new BadRequestException('Token should not be empty');
    }
    try {
      const decodedToken: any = this.jwtService.verify(token, {
        secret: config.JWT_SECRET_KEY,
      });

      if (decodedToken) {
        const user = await this.prisma.user.findFirst({
          where: { id: +decodedToken.id, token: token },
        });

        if (user) {
          req.user = {
            userId: user.id,
            email: user.email,
          };
          return true;
        } else {
          throw new HttpException('Wrong authentication token', 401);
        }
      }
    } catch (error) {
      throw new UnauthorizedException(`Error: ${error.message}`);
    }
  };
}
