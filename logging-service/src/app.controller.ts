import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileChangeLog } from './entities/profile-log.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(ProfileChangeLog)
    private readonly logRepository: Repository<ProfileChangeLog>,
  ) { }

  @EventPattern('profile_updated')
  async handleProfileUpdated(@Payload() data: any) {
    console.log('📩 Log Event Received:', data);

    const log = this.logRepository.create({
      userId: data.userId,
      oldData: data.oldData,
      newData: data.newData,
    });

    await this.logRepository.save(log);
  }
}