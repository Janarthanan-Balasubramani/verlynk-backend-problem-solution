import {
    Injectable,
    CanActivate,
    ExecutionContext,
    BadRequestException,
    UnauthorizedException,
  } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { PrismaService } from 'src/prisma.service';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}
  
    canActivate = async (context: ExecutionContext): Promise<boolean> => {
        const req = context.switchToHttp().getRequest();

      const token = req.headers.authorization?.split(' ')[1];
  
      if (!token) {
        throw new BadRequestException('Token should not be empty');
      }
  
      try {
        const decodedToken :any = verify(token,"212329828ASHOKJKSJIJIUHININKDNIDNSN928938192829019209202i02i093u0");
  
        if (decodedToken) {
          const user = await this.prisma.user.findFirst({
            where: { id: +decodedToken.id, 
             },
           
          });
  
        if(user){
            req.user = {
              userId : user.id,
              email:user.email
            }
            return true
        }
        
         else if(!user)  {
          throw new UnauthorizedException("User not found")
         }
         else if (user.token!==token){
          return false
         }
        } 
       
      } catch (error) {
        throw new UnauthorizedException(`Error: ${error.message}`);
      }
    };
  }
  