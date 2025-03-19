import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { UserRole } from '../enum/user.role';
import { CommonEntity } from '../../core/common/entities/common.entity';

@Entity({ name: 'user' })
export class UserEntity extends CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, nullable: false })
  name: string;

  @Index()
  @Column('varchar', { nullable: false, unique: true })
  email: string;

  @Column({ nullable: true })
  email_confirmed_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.VIEW],
  })
  roles: UserRole[];

  @Column('varchar', { nullable: false })
  password: string;
}
