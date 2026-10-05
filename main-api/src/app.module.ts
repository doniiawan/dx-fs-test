import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Attendance } from './entities/attendance.entity';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'dexa_user'),
        password: configService.get<string>('DB_PASSWORD', 'dexa_password'),
        database: configService.get<string>('DB_NAME', 'dexa_attendance_db'),
        entities: [User, Attendance],
        synchronize: true, // Auto sync schema saat development
      }),
    }),

    TypeOrmModule.forFeature([User, Attendance]),
    AuthModule,
    AttendanceModule,
    UserModule,
  ],
})
export class AppModule { }