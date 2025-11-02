import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private moveoCore: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.moveoCore = this.configService.get<string>('moveoCore.apiUrl') || 'http://localhost:3000';
  }

  async driverLogin(email: string, password: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.moveoCore}/api/auth/driver-login`, {
          email,
          password,
        }),
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Failed to login to moveo-core',
      );
    }
  }
}
