import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
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
  async handleProfileUpdated(
    @Payload() data: any,
    @Ctx() context: any, // <--- jika error persis di baris ini, ganti ke tipe `any` atau cast di dalam handler
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      console.log('📩 Log Event Received:', data);

      const log = this.logRepository.create({
        userId: data.userId,
        oldData: data.oldData,
        newData: data.newData,
      });

      await this.logRepository.save(log);
      // channel.ack(originalMsg);
    } catch (error) {
      console.error('❌ Gagal olah log:', error);
      channel.nack(originalMsg, false, false);
    }
  }
}