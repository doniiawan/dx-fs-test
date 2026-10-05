import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum AttendanceStatus {
    CHECK_IN = 'CHECK_IN',
    CHECK_OUT = 'CHECK_OUT',
}

@Entity('attendances')
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, (user) => user.attendances, { onDelete: 'CASCADE' })
    user: User;

    @Column({ type: 'enum', enum: AttendanceStatus })
    type: AttendanceStatus;

    @Column()
    date: string; // Format: YYYY-MM-DD

    @CreateDateColumn()
    timestamp: Date;
}