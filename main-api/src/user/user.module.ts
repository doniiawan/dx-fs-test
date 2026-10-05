import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../entities/user.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { NotificationGateway } from '../notification/notification.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RabbitMQModule,
  ],
  controllers: [UserController],
  providers: [UserService, NotificationGateway],
  exports: [UserService],
})
export class UserModule { }