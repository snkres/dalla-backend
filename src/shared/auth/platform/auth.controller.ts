import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Res,
  UseGuards,
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
import setResponseCookies from './utils/set-response-cookies';
import { AuthGuard } from './guards/auth.guard';
import { UserTypes } from '@/shared/enums/user-types.enum';
import {
  CurrentCompany,
  CurrentUser,
} from '@/shared/decorators/current-auth.decorator';
import { Company, User } from '@/prisma/postgres';
import { ResetOldPasswordDto } from './dto/reset-old-password.dt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInWithGoogle } from './dto/SignInWithGoogle.dto';
import { SignInWithLinkedInDto } from './dto/SignInWithLinkedIn.dto';
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

      setResponseCookies(res, payload);
      return ResponseUtil.success('Logged in successfully');
    } catch (err) {
      throw new CustomHttpException(
        err?.message,
        err,
        err.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Public()
  @Post('/google')
  async signInWithGoogle(@Body() body: SignInWithGoogle, @Res() res: Response) {
    try {
      const result = await this.authService.signInWithGoogle(body);
      setResponseCookies(res, result);
      return ResponseUtil.success(
        null,
        'Logged in successfully',
        HttpStatus.OK,
      );
    } catch (err) {
      throw new CustomHttpException(
        err?.message,
        err,
        err.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Public()
  @Post('/linkedin')
  async signInWithLinkedIn(
    @Body() body: SignInWithLinkedInDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.signinWithLinkedIn(body);
      setResponseCookies(res, result);
      return ResponseUtil.success(
        null,
        'Logged in successfully',
        HttpStatus.OK,
      );
    } catch (err) {
      throw new CustomHttpException(
        err?.message,
        err,
        err.status || HttpStatus.UNPROCESSABLE_ENTITY,
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
  async companyRegisterVerify(
    @Body() verifyOtp: VerifyDto,
    @Res() res: Response,
  ) {
    try {
      const payload = await this.authService.verify(
        verifyOtp.email,
        verifyOtp.otp,
        verifyOtp.userType,
      );

      setResponseCookies(res, payload);
      return ResponseUtil.success('Otp verified successfully');
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

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return ResponseUtil.success('Logged out successfully');
  }

  @UseGuards(AuthGuard())
  @Post('reset-old-password')
  async resetOldPassword(
    @CurrentCompany() company: Company,
    @CurrentUser() user: User,
    @Body() body: ResetOldPasswordDto,
  ) {
    try {
      const result = await this.authService.resetOldPassword(
        user?.id || company?.id,
        user?.id ? UserTypes.User : UserTypes.Company,
        body.oldPassword,
        body.newPassword,
      );

      return ResponseUtil.success(
        result,
        'Password reset successfully',
        HttpStatus.OK,
      );
    } catch (err) {
      throw new CustomHttpException(
        err?.message,
        err.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    try {
      const result = await this.authService.forgotPassword(body);

      return ResponseUtil.success(
        result,
        'Password reset link sent successfully',
        HttpStatus.OK,
      );
    } catch (err) {
      throw new CustomHttpException(
        err?.message,
        err.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    try {
      const result = await this.authService.resetPassword(body);

      return ResponseUtil.success(
        result,
        'Password reset successfully',
        HttpStatus.OK,
      );
    } catch (err) {
      throw new CustomHttpException(
        err?.message,
        err.status || HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
