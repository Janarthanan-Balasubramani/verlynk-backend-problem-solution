import { IsEmail, IsNotEmpty, IsNumber, IsString, Matches, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName : string;

  @IsString()
  @IsNotEmpty()
  lastName : string;

 @IsEmail()
 @IsString()
 @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/, {
    message: 'Password must contain at least 1 lowercase alphabetical character, 1 uppercase alphabetical character, 1 numeric character, one special character and must be eight characters or longer.'
  })
  password: string;
}


export class UpdateUserDto extends CreateUserDto{
    @IsNotEmpty()
  @IsNumber()
  @Min(1)
    id:number
}