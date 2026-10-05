import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('profile_change_logs')
export class ProfileChangeLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column({ type: 'jsonb' })
    oldData: Record<string, any>;

    @Column({ type: 'jsonb' })
    newData: Record<string, any>;

    @CreateDateColumn()
    changedAt: Date;
}