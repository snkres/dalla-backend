import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PlatformAuthService } from './auth.service';
import { Response } from 'express';
import { Public } from '@/shared/decorators/isPublic.decorator';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { ResponseUtil } from '@/shared/utils/response.util';
import { CustomHttpException } from '@/shared/exceptions/custom-http-exception';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { RegisterValidation } from './dto/register.validation';
@Controller('auth')
export class PlatformAuthController {
  constructor(private readonly authService: PlatformAuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async companyLogin(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const payload = await this.authService.validateLogin(
        loginDto.email,
        loginDto.password,
        loginDto.userType,
      );

      if (payload.access_token) {
        res.cookie('refreshToken', payload.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          domain:
            process.env.NODE_ENV !== 'development'
              ? process.env.domain
              : 'localhost',
        });
        return ResponseUtil.success(
          { access_token: payload.access_token },
          'Tokens',
        );
      }
      return ResponseUtil.error(
        "Couldn't find the user",
        'something went wrong',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw new CustomHttpException(
        err?.message,
        {
          cause: err,
          description: err,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('register')
  @Public()
  async companyRegister(@Body() registerDto: RegisterValidation) {
    try {
      const result = await this.authService.unifiedRegister(registerDto);
      return ResponseUtil.success(
        result,
        'registered successfully',
        HttpStatus.ACCEPTED,
      );
    } catch (err) {
      throw new CustomHttpException(
        err?.message,
        {
          cause: err,
          description: err,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('verify')
  @Public()
  async companyRegisterVerify(@Body() verifyOtp: VerifyDto) {
    try {
      const result = await this.authService.verify(
        verifyOtp.email,
        verifyOtp.otp,
        verifyOtp.userType,
      );
      return ResponseUtil.success(
        result,
        'Company verified successfully',
        HttpStatus.OK,
      );
    } catch (err) {
      throw new CustomHttpException(
        err?.message,
        {
          cause: err,
          description: err,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('resend-otp')
  @Public()
  async resendOtp(@Body() body: ResendOtpDto) {
    try {
      const result = await this.authService.resendOtp(
        body.email,
        body.userType,
      );
      return ResponseUtil.success(
        result,
        'Otp resent successfully',
        HttpStatus.OK,
      );
    } catch (err) {
      throw new CustomHttpException(
        err?.message,
        {
          cause: err,
          description: err,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
