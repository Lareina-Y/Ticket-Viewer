import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('station_codes')
export class StationCode {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  code!: string;

  @Column()
  utility_type!: string;
}