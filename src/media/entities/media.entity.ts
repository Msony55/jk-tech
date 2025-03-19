import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import Any = jasmine.Any;
import { CommonEntity } from '../../core/common/entities/common.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 'media' })
export class Media extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: bigint;

  @Column('varchar', { nullable: false })
  file_name: string;

  @Column('varchar', { nullable: false })
  unique_file_name: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: true,
  })
  meta_data: Any;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  user: UserEntity;
}
