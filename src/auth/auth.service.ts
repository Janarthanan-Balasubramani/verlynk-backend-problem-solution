import { config } from './../config/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(authDto: AuthDto) {
    const userDetails = await this.prisma.user.findUnique({
      where: {
        email: authDto.email,
      },
      select: {
        id: true,
        password: true,
      },
    });
    if (!userDetails) {
      throw new UnauthorizedException('Email not found');
    }

    const isPasswordMatch = await bcrypt.compare(
      authDto.password,
      userDetails.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Password is incorrect');
    }
    const dataIntoken: any = {
      id: userDetails.id,
    };

    const token = this.jwtService.sign(dataIntoken, {
      secret: config.JWT_SECRET_KEY,
      expiresIn: '1d',
    });
    const userUpdateToken = await this.prisma.user.update({
      where: {
        id: userDetails.id,
      },
      data: {
        token: token,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        token: true,
      },
    });
    return { data: userUpdateToken };
  }
}
