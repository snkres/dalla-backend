import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JWTService } from '../miscs/jwt';
import { UserTypes } from '@/shared/enums/user-types.enum';
import { BcryptService } from '../miscs/bcrypt';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { OTPService } from '../miscs/otp';
import { CompanyRegisterDto } from './dto/register-company.dto';
import { EmailService } from '@/shared/email/email.service';
import { newId } from '@/shared/utils/unique-id';
import { RegisterValidation } from './dto/register.validation';
import { ProfessionalRegisterDto } from './dto/register-professional.dto';

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

  async validateLogin(email: string, pass: string, type: UserTypes) {
    if (type === UserTypes.Company) {
      return await this.validateCompany(email, pass);
    } else {
      return await this.validateProfessional(email, pass);
    }
  }

  async unifiedRegister(registerDto: RegisterValidation) {
    const { userType, ...rest } = registerDto;
    if (userType === UserTypes.Company) {
      return await this.companyRegister({
        email: rest.email,
        password: rest.password,
        name: rest.name,
      });
    } else {
      return await this.registerProfessional(rest);
    }
  }

  async verify(email: string, otp: string, type: UserTypes) {
    if (type === UserTypes.Company) {
      return await this.companyVerify(email, otp);
    }
    return await this.professionalVerify(email, otp);
  }

  async refreshToken(refresh_token: string, access_token: string) {
    const decoded = await this.jwtService.validateRefreshToken(
      refresh_token,
      access_token,
    );

    return await this.jwtService.createTokens({
      email: decoded.email,
      userId: decoded.userId,
      type: decoded.type,
    });
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
    const company = await this.prisma.company.findFirst({
      where: {
        email,
      },
    });

    if (!company) {
      throw new UnauthorizedException('Company not found');
    }

    await this.prisma.company.update({
      where: {
        id: company.id,
      },
      data: {
        verified: true,
      },
    });

    return await this.jwtService.createTokens({
      email: company.email,
      userId: company.id,
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
      type: UserTypes.User,
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
      type: UserTypes.User,
    });
  }

  async resendOtp(email: string, model: UserTypes) {
    const user = await this.prisma[model as string].findFirst({
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
