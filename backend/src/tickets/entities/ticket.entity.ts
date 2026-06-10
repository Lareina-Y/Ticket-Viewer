import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StationCode } from './station-code.entity';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  ticket_no!: string;

  @Column()
  status!: string;

  @Column()
  priority!: string;

  @Column()
  station_code_id!: number;

  @ManyToOne(() => StationCode)
  @JoinColumn({ name: 'station_code_id' })
  station!: StationCode;

  @Column({ type: 'timestamp', nullable: true })
  pre_completed_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  office_clear_at!: Date;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  geom: any;
}