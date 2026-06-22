import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StationCode } from './station-code.entity';

@Entity('service_areas')
export class ServiceAreas {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
    station_code_id!: number;
  
  @ManyToOne(() => StationCode)
  @JoinColumn({ name: 'station_code_id' })
   station!: StationCode;

  @Column()
  utility_type!: string;
}