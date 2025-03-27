import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
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
import { Company, User } from '@/prisma/postgres';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import Redis from 'ioredis';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class PlatformAuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
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
        this.validateAccount(user);
        return await this.jwtService.createTokens({
          email: user.email,
          userId: user.id,
          type: UserTypes.Company,
        });
      } else {
        throw new UnauthorizedException('Invalid email or password');
      }
    }
  }

  private validateAccount(account: User | Company) {
    if (!account.verified) throw new ForbiddenException('Account not verified');
    if (account.suspended) throw new ForbiddenException('Account is suspended');
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
        OR: [{ email: registerDto.email }, { username: registerDto.username }],
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

    this.validateAccount(user);
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

  async resetOldPassword(
    id: string,
    model: UserTypes,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma[model as string].findFirst({
      where: {
        id,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCorrect = await this.bycrptService.comparePassword(
      oldPassword,
      user.password,
    );
    if (!isCorrect) {
      throw new UnauthorizedException('Invalid password');
    }

    const hashedPassword = await this.bycrptService.hashPassword(newPassword);
    await this.prisma[model as string].update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  async forgotPassword(payload: ForgotPasswordDto) {
    const { email, userType, redirectTo } = payload;

    const user = await this.prisma[userType as string].findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const code = crypto.randomUUID();
    await this.redisClient.set(`reset:${email}:code`, code, 'EX', 5 * 60);

    await this.emailService.sendOtpEmail({
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Reset your password</h1>
        <p>Click 
          <a href="${redirectTo}?email=${email}&code=${code}">
          here</a> to reset your password
        </p> 
        `,
    });
  }

  async resetPassword(payload: ResetPasswordDto) {
    const { email, userType, code, newPassword } = payload;

    const user = await this.prisma[userType as string].findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const storedCode = await this.redisClient.getdel(`reset:${email}:code`);
    if (storedCode !== code) {
      throw new UnauthorizedException('Invalid code');
    }

    const hashedPassword = await this.bycrptService.hashPassword(newPassword);
    await this.prisma[userType as string].update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
  }
}
