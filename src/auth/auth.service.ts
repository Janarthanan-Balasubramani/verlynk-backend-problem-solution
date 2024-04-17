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

  /**
   *@function :Login
   *
   * @description : allows users to login in the application
   *
   * @param type(createAuthDto) email and password in body
   * @returns
   *  user details with token
   */
  async Login(authDto: AuthDto) {
    const userDetails = await this.prisma.user.findUnique({
      where: {
        email: authDto.email,
      },
      select: {
        id: true,
        password: true,
      },
    });
    // checking if email already registered or else Email not found
    if (!userDetails) {
      throw new UnauthorizedException('Email not found');
    }

    //checking if password matches else Password is incorrect error is thrown
    const isPasswordMatch = await bcrypt.compare(
      authDto.password,
      userDetails.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Password is incorrect');
    }
    // data to be stored in token
    const dataIntoken: any = {
      id: userDetails.id,
    };

    // generating token by utilizing jwt service
    const token = this.jwtService.sign(dataIntoken, {
      secret: config.JWT_SECRET_KEY,
      expiresIn: '1d',
    });

    // updating the token in the user table since by using it we can ensure that user uses only one session
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
    // returning the data  of the user
    return { data: userUpdateToken };
  }
}
