import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { newPassDto } from './dto/new-pass.dto';
import { AddressDto } from './dto/send-mail.dto';
import { MailerService } from './mailer.service';
@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('/recover-pass')
  recoverPass(@Body() Address: AddressDto) {
    return this.mailerService.sendMail(Address);
  }

  @Post('/newPassRequest/:token')
  newPassRequest(
    @Param('token') token: string,
    @Body() newPassword: newPassDto,
  ) {
    return this.mailerService.newPassRequest(token, newPassword);
  }
}
