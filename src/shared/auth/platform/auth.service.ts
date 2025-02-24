import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JWTService } from '../miscs/jwt';
import { UserTypes } from '@/shared/enums/user-types.enum';
import { BcryptService } from '../miscs/bcrypt';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { OTPService } from '../miscs/otp';
import { CompanyRegisterDto } from './dto/register-company.dto';
import { EmailService } from '@/shared/email/email.service';
import { newId } from '@/shared/utils/unique-id';
import { ProfessionalRegisterDto } from '@/shared/auth/platform/dto/register-professional.dto';

@Injectable()
export class PlatformAuthService {
  constructor(
    private readonly jwtService: JWTService,
    private readonly prisma: PostgresPrismaService,
    private readonly otpService: OTPService,
    private readonly emailService: EmailService,
    private readonly bycrptService: BcryptService,
  ) {}

  async validateCompany(email: string, pass: string) {
    const user = await this.prisma.company.findFirst({ where: { email } });
    if (user) {
      const isCorrect = await this.bycrptService.comparePassword(
        pass,
        user.password,
      );
      if (user && isCorrect) {
        return await this.jwtService.createTokens({
          email: user.email,
          userId: user.id,
          type: UserTypes.Company,
        });
      }
    }
  }

  async companyRegister(registerDto: CompanyRegisterDto) {
    const { password, ...rest } = registerDto;
    const existingUser = await this.prisma.company.findFirst({
      where: {
        email: registerDto.email,
      },
    });

    if (existingUser) {
      throw new UnauthorizedException('Company already exists');
    }
    const hashedPassword = await this.bycrptService.hashPassword(password);
    const otp = await this.otpService.generateOtp(registerDto.email);
    Logger.log(otp);
    await this.emailService.sendOtpEmail({
      to: registerDto.email,
      subject: 'Verify your email',
      html: `
        <h1>Verify your email</h1>
        <p>Your OTP is ${otp}</p>`,
    });
    await this.prisma.company.create({
      data: {
        id: newId('company', 16),
        password: hashedPassword,
        ...rest,
      },
    });
    return null;
  }

  async companyVerify(email: string, otp: string) {
    const isValidOtp = await this.otpService.verifyOtp(email, otp);
    if (!isValidOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }
    const user = await this.prisma.company.findFirst({
      where: {
        email,
      },
    });

    return await this.jwtService.createTokens({
      email: user.email,
      userId: user.id,
      type: UserTypes.Company,
    });
  }

  async registerProfessional(registerDto: ProfessionalRegisterDto) {
    const { password, ...rest } = registerDto;
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: registerDto.email,
      },
    });

    if (existingUser) {
      throw new UnauthorizedException('professional already exists');
    }

    const hashedPassword = await this.bycrptService.hashPassword(password);
    const otp = await this.otpService.generateOtp(registerDto.email);
    Logger.log(otp);
    await this.emailService.sendOtpEmail({
      to: registerDto.email,
      subject: 'Verify your email',
      html: `
        <h1>Verify your email</h1>
        <p>Your OTP is ${otp}</p>`,
    });
    await this.prisma.user.create({
      data: {
        id: newId('professional', 16),
        password: hashedPassword,
        ...rest,
      },
    });
    return null;
  }

  async validateProfessional(email: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isCorrect = await this.bycrptService.comparePassword(
      password,
      user.password,
    );
    if (!isCorrect) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return await this.jwtService.createTokens({
      email: user.email,
      userId: user.id,
      type: UserTypes.Professional,
    });
  }

  async professionalVerify(email: string, otp: string) {
    const isValidOtp = await this.otpService.verifyOtp(email, otp);
    if (!isValidOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verified: true,
      },
    });

    return await this.jwtService.createTokens({
      email: user.email,
      userId: user.id,
      type: UserTypes.Professional,
    });
  }

  async professionalResendOtp(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.verified) {
      throw new UnauthorizedException('User already verified');
    }

    const otp = await this.otpService.generateOtp(email);
    Logger.log(otp);
    await this.emailService.sendOtpEmail({
      to: email,
      subject: 'Verify your email',
      html: `
        <h1>Verify your email</h1>
        <p>Your OTP is ${otp}</p>`,
    });
    return null;
  }
}
