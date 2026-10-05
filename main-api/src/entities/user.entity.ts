import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Attendance } from './attendance.entity'

export enum Role {
    EMPLOYEE = 'EMPLOYEE',
    HRD_ADMIN = 'HRD_ADMIN',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column()
    position: string;

    @Column()
    phoneNumber: string;

    @Column({ nullable: true })
    photoUrl: string;

    @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE })
    role: Role;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Attendance, (attendance) => attendance.user)
    attendances: Attendance[];
}