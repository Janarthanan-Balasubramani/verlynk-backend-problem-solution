import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async create(authDto: AuthDto) {
  const userDetails = await this.prisma.user.findUnique({
    where:{
      email:authDto.email
    },
    select:{
      password:true
    },
  })
  if (!userDetails){
    throw new UnauthorizedException("Email not found")
  }

  const isPasswordMatch = await bcrypt.compare(authDto.password,userDetails.password)
if (!isPasswordMatch){
  throw new UnauthorizedException("Password is incorrect")
}
  }

 
}
