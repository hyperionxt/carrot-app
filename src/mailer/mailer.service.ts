import { MailerService as Mailer } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { JWT_SECRET_KEY, MAIL_USERNAME } from '../config/vars.config';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { newPassDto } from './dto/new-pass.dto';
import { AddressDto } from './dto/send-mail.dto';

@Injectable()
export class MailerService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly mailService: Mailer,
    private readonly userService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async sendMail(mail: AddressDto) {
    try {
      const userFound = await this.userService.findOneByEmail(mail.to);
      const payload = {
        id: userFound.id,
        email: mail.to,
      };

      const token = this.jwt.sign(payload);
      const url = 'http://localhost:3000/sendmailer/newPassRequest';

      this.mailService.sendMail({
        to: mail.to,
        from: `"Forgot password" <${MAIL_USERNAME}>`,
        subject: 'Recovery password request',
        html: `<b>${url}/${token}</b>`,
      });
      return new HttpException(
        `Mail sent to ${mail.to}. Please, to recover your password, check your inbox or spam folder and follow the intructions.`,
        HttpStatus.OK,
      );
    } catch (error) {
      throw new error();
    }
  }

  async newPassRequest(token: string, newPassword: newPassDto) {
    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: JWT_SECRET_KEY,
      });
      const userFound = await this.userService.findOne(payload.id);

      const passwordHash = await hash(newPassword, 10);
      userFound.password = passwordHash;
      await this.userRepository.save(userFound);
      return new HttpException('Password changed', HttpStatus.OK);
    } catch {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
