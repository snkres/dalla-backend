import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { PlatformAuthService } from './auth.service';
import { Public } from '@/shared/decorators/isPublic.decorator';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { ResponseUtil } from '@/shared/utils/response.util';
import { CustomHttpException } from '@/shared/exceptions/custom-http-exception';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { RegisterValidation } from './dto/register.validation';
import { RefreshTokenDto } from './dto/refresh-token.dto';
@Controller('auth')
export class PlatformAuthController {
  constructor(private readonly authService: PlatformAuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async companyLogin(@Body() loginDto: LoginDto) {
    try {
      const payload = await this.authService.validateLogin(
        loginDto.email,
        loginDto.password,
        loginDto.userType,
      );

      return ResponseUtil.success(payload, 'Tokens');
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

  @Post('refresh-token')
  @Public()
  async refresh_token(@Body() refreshBody: RefreshTokenDto) {
    const { refresh_token, access_token } = refreshBody;
    try {
      const payload = await this.authService.refreshToken(
        refresh_token,
        access_token,
      );

      return ResponseUtil.success(payload, 'Tokens refreshed successfully');
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
      const payload = await this.authService.verify(
        verifyOtp.email,
        verifyOtp.otp,
        verifyOtp.userType,
      );

      return ResponseUtil.success(payload, 'Otp verified successfully');
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
