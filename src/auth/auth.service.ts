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
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  generateJwt(user: any) {
    return this.jwtService.sign({
      userId: user._id,
      email: user.email,
    });
  }

  // ================= SIGNUP =================
  async signup(body: { name: string; email: string; password: string }) {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: body.email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = new this.userModel({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      provider: 'local',
    });

    await user.save();

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verification link (frontend)
    const verifyLink = `https://pragra-frontend.vercel.app/verify-email?token=${verificationToken}`;

    // Send verification email
    try {
      await transporter.sendMail({
        to: user.email,
        subject: 'Verify your email',
        html: `<a href="${verifyLink}">Verify Email</a>`,
      });
    } catch (error) {
      console.log('Email sending failed, skipping in production');
    }

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
    user.verificationToken = null;

    await user.save();

    return {
      message: 'Email verified successfully',
    };
  }

  // ================= LOGIN =================
  async login(body: { email: string; password: string }) {
    const user = await this.userModel.findOne({ email: body.email });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Block login if email not verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const isPasswordMatch = await bcrypt.compare(body.password, user.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      userId: user._id,
      email: user.email,
    });

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
