import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from '../entities/attendance.entity';
import { User, Role } from '../entities/user.entity';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) { }

  private getTodayDateString(): string {
    return new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Jakarta',
    });
  }

  async getTodayAttendanceByUser(userId: string) {

    const exist = await this.attendanceRepository.find({
      where: {
        userId: userId,
        date: this.getTodayDateString(),
      },
    });
    return exist;
  }

  async checkIn(userId: string) {
    const today = this.getTodayDateString();

    const existingCheckIn = await this.attendanceRepository.findOne({
      where: { userId, date: today, type: AttendanceStatus.CHECK_IN },
    });

    if (existingCheckIn) {
      throw new BadRequestException('Anda sudah melakukan Check-In hari ini');
    }

    const attendance = this.attendanceRepository.create({
      userId,
      type: AttendanceStatus.CHECK_IN,
      date: today,
    });

    return await this.attendanceRepository.save(attendance);
  }

  async checkOut(userId: string) {
    const today = this.getTodayDateString();

    const existingCheckIn = await this.attendanceRepository.findOne({
      where: { userId, date: today, type: AttendanceStatus.CHECK_IN },
    });

    if (!existingCheckIn) {
      throw new BadRequestException('Anda belum melakukan Check-In hari ini');
    }

    const existingCheckOut = await this.attendanceRepository.findOne({
      where: { userId, date: today, type: AttendanceStatus.CHECK_OUT },
    });

    if (existingCheckOut) {
      throw new BadRequestException('Anda sudah melakukan Check-Out hari ini');
    }

    const attendance = this.attendanceRepository.create({
      userId,
      type: AttendanceStatus.CHECK_OUT,
      date: today,
    });

    return await this.attendanceRepository.save(attendance);
  }

  async getMyAttendanceHistory(userId: string, filter: AttendanceFilterDto) {
    const now = new Date();
    // Default: awal bulan s/d hari ini
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const defaultEnd = now.toISOString().split('T')[0];

    const start = filter.startDate || defaultStart;
    const end = filter.endDate || defaultEnd;

    const attendances = await this.attendanceRepository.find({
      where: {
        userId,
        date: Between(start, end),
      },
      order: { date: 'DESC', timestamp: 'ASC' },
    });

    const grouped = new Map<string, any>();
    for (const att of attendances) {
      const key = att.date;
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: att.id,
          userId: att.userId,
          date: att.date,
          clockIn: null,
          clockOut: null,
        });
      }
      const item = grouped.get(key);
      if (att.type === AttendanceStatus.CHECK_IN) {
        item.clockIn = att.timestamp;
      } else if (att.type === AttendanceStatus.CHECK_OUT) {
        item.clockOut = att.timestamp;
      }
    }

    return Array.from(grouped.values()).sort((a, b) => b.date.localeCompare(a.date));
  }

  async getAllAttendancesForHRD(filter: AttendanceFilterDto) {
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const defaultEnd = now.toISOString().split('T')[0];

    const start = filter.startDate || defaultStart;
    const end = filter.endDate || defaultEnd;

    const attendances = await this.attendanceRepository.find({
      where: {
        date: Between(start, end),
      },
      relations: { user: true },
      order: { date: 'DESC', timestamp: 'ASC' },
    });

    const grouped = new Map<string, any>();
    for (const att of attendances) {
      const key = `${att.userId}_${att.date}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: att.id,
          userId: att.userId,
          date: att.date,
          clockIn: null,
          clockOut: null,
          user: att.user
            ? {
                id: att.user.id,
                name: att.user.name,
                email: att.user.email,
                position: att.user.position,
                phoneNumber: att.user.phoneNumber,
                role: att.user.role,
                photoUrl: att.user.photoUrl,
              }
            : null,
        });
      }
      const item = grouped.get(key);
      if (att.type === AttendanceStatus.CHECK_IN) {
        item.clockIn = att.timestamp;
      } else if (att.type === AttendanceStatus.CHECK_OUT) {
        item.clockOut = att.timestamp;
      }
    }

    return Array.from(grouped.values()).sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return new Date(b.clockIn || 0).getTime() - new Date(a.clockIn || 0).getTime();
    });
  }
}