import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private transporter;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {
    // ⚠️ Transporter created once (NOT inside signup)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  generateJwt(user: any) {
    return this.jwtService.sign({
      userId: user._id,
      email: user.email,
    });
  }

  // ================= SIGNUP =================
  async signup(body: { name: string; email: string; password: string }) {
    const { name, email, password } = body;

    // ✅ VALIDATION (VERY IMPORTANT)
    if (!name || !email || !password) {
      throw new BadRequestException('All fields are required');
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      provider: 'local',
    });

    // 🔥 EMAIL SHOULD NEVER BLOCK SIGNUP
    try {
      const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      await this.transporter.sendMail({
        to: user.email,
        subject: 'Verify your email',
        html: `
          <h3>Verify your email</h3>
          <p>Click the link below to verify your account:</p>
          <a href="${verifyLink}">${verifyLink}</a>
        `,
      });
    } catch (error) {
      console.log(
        '⚠️ Email sending failed (ignored to avoid blocking signup)',
      );
    }

    // ✅ ALWAYS RETURN RESPONSE
    return {
      message:
        'Signup successful. Please check your email to verify your account.',
    };
  }

  // ================= VERIFY EMAIL =================
  async verifyEmail(token: string) {
    if (!token) {
      throw new BadRequestException('Verification token is required');
    }

    const user = await this.userModel.findOne({
      verificationToken: token,
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    return {
      message: 'Email verified successfully',
    };
  }

  // ================= LOGIN =================
  async login(body: { email: string; password: string }) {
    const { email, password } = body;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateJwt(user);

    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
