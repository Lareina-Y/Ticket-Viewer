import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private repo: Repository<Ticket>,
  ) {}

  async search(query: any) {
    const { bbox, status, stationCode, utilityType } = query;

    // parse bbox
    const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);

    if ([minLng, minLat, maxLng, maxLat].some(isNaN)) {
      throw new BadRequestException('Invalid bbox');
    }

    const qb = this.repo
      .createQueryBuilder('t')
      .leftJoin('station_codes', 's', 's.id = t.station_code_id')
      .where(
        `ST_Intersects(
          t.geom,
          ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326)
        )`,
        { minLng, minLat, maxLng, maxLat },
      );

    // status filter
    if (status) qb.andWhere('t.status = :status', { status });

    // stationCode filter
    if (stationCode) qb.andWhere('s.code = :stationCode', { stationCode });

    // utilityType filter
    if (utilityType) qb.andWhere('s.utility_type = :utilityType', { utilityType });

    const tickets = await qb.getMany();

    const result = tickets.map((t) => {
      const coords = (t.geom as any).coordinates;

      return {
        id: t.id,
        ticketNo: t.ticket_no,
        status: t.status,
        priority: t.priority,
        stationCode: t.station_code_id,
        utilityType: 'UNKNOWN',
        longitude: coords[0],
        latitude: coords[1],
      };
    });

    const summary = {
      total: result.length,
      byStatus: result.reduce((acc, cur) => {
        acc[cur.status] = (acc[cur.status] || 0) + 1;
        return acc;
      }, {}),
    };

    return { tickets: result, summary };
  }
}