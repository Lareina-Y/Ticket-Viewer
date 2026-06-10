import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { SearchTicketsDto } from './dto/search.dto';
import { StationCode } from './entities/station-code.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepo: Repository<Ticket>,
    @InjectRepository(StationCode)
    private stationRepo: Repository<StationCode>,
  ) {}

  async search(query: SearchTicketsDto) {
    const { bbox, status, stationCode, utilityType } = query;

    const [minLng, minLat, maxLng, maxLat] = bbox
      .split(',')
      .map(Number);

    if ([minLng, minLat, maxLng, maxLat].some(isNaN)) {
      throw new BadRequestException('Invalid bbox');
    }

    const qb = this.ticketsRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.station', 's')
      .where(
        `ST_Intersects(
          t.geom,
          ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326)
        )`,
        { minLng, minLat, maxLng, maxLat },
      );

    if (status) {
      qb.andWhere('t.status = :status', { status });
    }

    if (stationCode) {
      qb.andWhere('s.code = :stationCode', { stationCode });
    }

    if (utilityType) {
      qb.andWhere('s.utility_type = :utilityType', { utilityType });
    }

    const tickets = await qb.getMany();

    const result = tickets.map((t) => {
      const coords = (t.geom as any).coordinates;

      return {
        id: t.id,
        ticketNo: t.ticket_no,
        status: t.status,
        priority: t.priority,

        stationCode: t.station.code,
        utilityType: t.station.utility_type,

        longitude: coords[0],
        latitude: coords[1],
      };
    });

    const summary = {
      total: result.length,
      byStatus: result.reduce((acc, cur) => {
        acc[cur.status] = (acc[cur.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return { tickets: result, summary };
  }

  async getMeta() {
    const statuses = await this.ticketsRepo
      .createQueryBuilder('t')
      .select('DISTINCT t.status', 'status')
      .getRawMany();

    const stations = await this.stationRepo.find({
      select: ['code', 'utility_type'],
    });

    return {
      status: statuses.map((s) => s.status),
      stationCodes: stations.map(s => s.code),
      utilityTypes: [...new Set(stations.map(s => s.utility_type))],
    };
  }
}