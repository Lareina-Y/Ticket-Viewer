import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { SearchTicketsDto } from './dto/search.dto';
import { StationCode } from './entities/station-code.entity';
import { ServiceAreas } from './entities/service_areas.entity';
import { ConflictsTicketsDto } from './dto/conflicts.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepo: Repository<Ticket>,
    @InjectRepository(StationCode)
    private stationRepo: Repository<StationCode>,
    // @InjectRepository(ServiceAreas)
    // private serviceAreasRepo: Repository<ServiceAreas>,
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
      const coords = t.geom.coordinates;

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
      utilityTypes: stations.map(s => s.utility_type),
    };
  }

  async conflict(query: ConflictsTicketsDto) {
    const { bbox, stationCode, utilityType, radiusMeters = 500 } = query;

    const [minLng, minLat, maxLng, maxLat] = bbox
      .split(',')
      .map(Number);

    if ([minLng, minLat, maxLng, maxLat].some(isNaN)) {
      throw new BadRequestException('Invalid bbox');
    }

    const qb = this.ticketsRepo
      .createQueryBuilder('t')
      .leftJoin('station_codes', 's', 't.station_code_id = s.id')
      .where(
        `ST_Intersects(
          t.geom,
          ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326)
        )`,
        { minLng, minLat, maxLng, maxLat },
      );

    if (stationCode) {
      qb.andWhere('s.code = :stationCode', { stationCode });
    }

    if (utilityType) {
      qb.andWhere('s.utility_type = :utilityType', { utilityType });
    }

    const tickets = await qb.addSelect(
      'EXISTS (SELECT 1 FROM service_areas sa WHERE sa.station_code_id = s.id AND ST_Within(t.geom, sa.geom))',
      'insideServiceArea'
    ).getMany();

    const result = await Promise.all(tickets.map(async (t) => {
      const coords = t.geom.coordinates;

      const emergency = await this.emergecyCheck(t);
      const distance = emergency ? emergency.distanceMeters : null;

      return {
        id: t.id,
        ticketNo: t.ticket_no,
        status: t.status,
        priority: t.priority,

        stationCode: t.station.code,
        utilityType: t.station.utility_type,

        longitude: coords[0],
        latitude: coords[1],

        insideServiceArea: t.insideServiceArea,
        nearestEmergencyTicketNo: emergency?.ticketNo || null,
        distanceToNearestEmergencyMeters: distance,
        riskLevel: "HIGH"
      };
    }));

    const summary = {
      total: result.length,
      byUtilityType: result.reduce((acc, cur) => {
        acc[cur.utilityType] = (acc[cur.utilityType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return { tickets: result, summary };
  }


  async emergecyCheck(ticket: Ticket) {
    const qb = this.ticketsRepo
      .createQueryBuilder('t')
      .select([
        't.ticket_no AS ticketNo',
        `
        'ST_Distance(
          t.geom::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
        ) AS distanceMeters'
        `
      ])
      .where("t.proiority = 'Emergency'")
      .setParameters({
        lng: ticket.geom.coordinates[0],
        lat: ticket.geom.coordinates[1],
      })
      .orderBy('distanceMeters')
      ;

    const emergecyTicket = await qb.limit(1).getRawOne();

    return emergecyTicket;
  }

}