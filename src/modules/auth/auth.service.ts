import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { SignupResponseDto } from './dto/signup.response.dto';
import { SignupRequestDto } from './dto/signup.request.dto';
import { SigninResponseDto } from './dto/signin.response.dto';
import { SigninRequestDto } from './dto/signin.request.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(request: SignupRequestDto): Promise<SignupResponseDto> {
    await this.userService.validateIfEmailIsUnique(request.email);

    const encryptedPassword = await this._hashPassword(request.password);

    const savedUser = await this.userService.create(
      request.email,
      encryptedPassword,
      request.name,
    );
    //그 외 유저 초기화 (권한, 토큰버전 등)
    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      createdAt: savedUser.createdAt,
    };
  }

  private async _hashPassword(password: string) {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  async signin(request: SigninRequestDto): Promise<SigninResponseDto> {
    const user: User = await this.userService.findByEmailAndPassword(request.email, request.password);

    if (!user) {
      throw new UnauthorizedException('Your email or password does not match.');
    }

    const accessToken: string = this._generateAccessToken(user);
    const refreshToken: string = this._generateRefreshToken();

    return {
      accessToken,
      refreshToken,
    };
  }

  // issue
  private _generateAccessToken(user: User): string {
    // token version 찾아오기
    const payload = {
      tokenVersion: '1',
    };

    return this.jwtService.sign(payload, {
      secret: process.env.AUTH_JWT_SECRET,
      algorithm: 'HS256',
      issuer: process.env.AUTH_JWT_ISSUER,
      keyid: '1',
      expiresIn: process.env.AUTH_ACCESS_EXPIRES,
      subject: user.id.toString(),
    });
  }

  // issue
  private _generateRefreshToken(): string {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const issuedAt = Date.now();

    return `${randomBytes}${issuedAt}`;
  }
}
