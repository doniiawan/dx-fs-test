import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/admin-user.dto';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('AUDIT_LOG_SERVICE')
    private readonly auditLogClient: ClientProxy,
    private readonly notificationGateway: NotificationGateway,
  ) { }

  // Update Profile Karyawan (Self)
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const oldData = {
      name: user.name,
      position: user.position,
      phoneNumber: user.phoneNumber,
      photoUrl: user.photoUrl,
    };

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
      delete dto.password;
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.position !== undefined) user.position = dto.position;
    if (dto.phoneNumber !== undefined) user.phoneNumber = dto.phoneNumber;
    if (dto.photoUrl !== undefined) user.photoUrl = dto.photoUrl;

    const updatedUser = await this.userRepository.save(user);

    const newData = {
      name: updatedUser.name,
      position: updatedUser.position,
      phoneNumber: updatedUser.phoneNumber,
      photoUrl: updatedUser.photoUrl,
    };

    // 1. Message Queue to Logging Service (RabbitMQ)
    this.auditLogClient.emit('profile_updated', {
      userId: updatedUser.id,
      oldData,
      newData,
      timestamp: new Date(),
    });

    // 2. Realtime WebSocket Alert for Admin UI
    this.notificationGateway.sendAdminNotification({
      userId: updatedUser.id,
      userName: updatedUser.name,
      phoneNumber: updatedUser.phoneNumber,
      message: `Karyawan ${updatedUser.name} memperbarui data profilnya.`,
      timestamp: new Date(),
    });

    const { password, ...result } = updatedUser;
    return { message: 'Profile updated successfully', user: result };
  }

  // --- HRD ADMIN CRUD ENDPOINTS ---
  async getAllEmployees() {
    return this.userRepository.find({
      select: {
        id: true,
        email: true,
        name: true,
        position: true,
        phoneNumber: true,
        photoUrl: true,
        role: true,
        createdAt: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async createEmployee(dto: CreateEmployeeDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    } as DeepPartial<User>);

    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async updateEmployeeByAdmin(id: string, dto: UpdateEmployeeDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Email already registered');
      }
      user.email = dto.email;
    }

    if (dto.password && dto.password.trim().length >= 6) {
      user.password = await bcrypt.hash(dto.password, 10);
    }
    delete (dto as any).password;
    delete (dto as any).email;

    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async deleteEmployee(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.remove(user);
    return { message: 'Karyawan berhasil dihapus' };
  }
}