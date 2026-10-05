import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileChangeLog } from './entities/profile-log.entity';
import { AppController } from './app.controller';

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
        database: configService.get<string>('LOG_DB_NAME', 'dexa_audit_log_db'),
        entities: [ProfileChangeLog],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([ProfileChangeLog]),
  ],
  controllers: [AppController],
})
export class AppModule { }