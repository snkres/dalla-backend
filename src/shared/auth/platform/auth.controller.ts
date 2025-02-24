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
import { CompanyRegisterDto } from './dto/register-company.dto';
import { VerifyDto } from './dto/verify.dto';
import { ResponseUtil } from '@/shared/utils/response.util';
import { CustomHttpException } from '@/shared/exceptions/custom-http-exception';
import { ProfessionalRegisterDto } from '@/shared/auth/platform/dto/register-professional.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
@Controller('auth')
export class PlatformAuthController {
  constructor(private readonly authService: PlatformAuthService) {}

  @Public()
  @Post('company/login')
  @HttpCode(HttpStatus.OK)
  async companyLogin(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const payload = await this.authService.validateCompany(
        loginDto.email,
        loginDto.password,
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

  @Post('company/register')
  @Public()
  async companyRegister(@Body() registerDto: CompanyRegisterDto) {
    try {
      const result = await this.authService.companyRegister(registerDto);
      return ResponseUtil.success(
        result,
        'Company registered successfully',
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

  @Post('company/verify')
  @Public()
  async companyRegisterVerify(@Body() verifyOtp: VerifyDto) {
    try {
      const result = await this.authService.companyVerify(
        verifyOtp.email,
        verifyOtp.otp,
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

  @Post('professional/register')
  @Public()
  async RegisterProfessional(@Body() registerDto: ProfessionalRegisterDto) {
    try {
      const result = await this.authService.registerProfessional(registerDto);
      return ResponseUtil.success(
        result,
        'professional registered successfully',
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

  @Public()
  @Post('professional/login')
  @HttpCode(HttpStatus.OK)
  async LoginProfessional(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const payload = await this.authService.validateProfessional(
        loginDto.email,
        loginDto.password,
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

  @Post('professional/verify')
  @Public()
  async professionalRegisterVerify(@Body() verifyOtp: VerifyDto) {
    try {
      const result = await this.authService.professionalVerify(
        verifyOtp.email,
        verifyOtp.otp,
      );
      return ResponseUtil.success(
        result,
        'Professional verified successfully',
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

  @Post('professional/resend-otp')
  @Public()
  async professionalResendOtp(@Body() body: ResendOtpDto) {
    try {
      const result = await this.authService.professionalResendOtp(body.email);
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
