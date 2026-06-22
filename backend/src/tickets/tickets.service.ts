import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { SearchTicketsDto } from './dto/search.dto';
import { StationCode } from './entities/station-code.entity';
import { ConflictsTicketsDto } from './dto/conflicts.dto';

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

type EmergencyTicket = {
  ticketNo: string;
  distanceMeters: number | string;
};

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
      stationCodes: stations.map((s) => s.code),
      utilityTypes: [...new Set(stations.map((s) => s.utility_type))],
    };
  }

  async conflict(query: ConflictsTicketsDto) {
    const { bbox, stationCode, utilityType, radiusMeters = 250 } = query;

    const [minLng, minLat, maxLng, maxLat] = this.parseBbox(bbox);

    if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
      throw new BadRequestException('radiusMeters must be a positive number');
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
      )
      .addSelect(
        `EXISTS (
          SELECT 1
          FROM service_areas sa
          WHERE sa.station_code_id = s.id
            AND ST_Covers(sa.geom, t.geom)
        )`,
        'insideServiceArea',
      )
      .orderBy('t.id', 'ASC');

    if (stationCode) {
      qb.andWhere('s.code = :stationCode', { stationCode });
    }

    if (utilityType) {
      qb.andWhere('s.utility_type = :utilityType', { utilityType });
    }

    const { entities, raw } = await qb.getRawAndEntities();

    const tickets = await Promise.all(
      entities.map(async (t, index) => {
        const coords = t.geom.coordinates;
        const insideServiceArea = Boolean(raw[index].insideServiceArea);
        const emergency = await this.emergecyCheck(t, radiusMeters);
        const distance = emergency
          ? Math.round(Number(emergency.distanceMeters))
          : null;
        const riskLevel = this.getRiskLevel({
          priority: t.priority,
          status: t.status,
          dueAt: t.due_at,
          insideServiceArea,
          hasNearbyEmergency: Boolean(emergency),
        });

        return {
          id: t.id,
          ticketNo: t.ticket_no,
          status: t.status,
          priority: t.priority,
  
          stationCode: t.station.code,
          utilityType: t.station.utility_type,

          longitude: coords[0],
          latitude: coords[1],
          insideServiceArea: insideServiceArea,
          nearestEmergencyTicketNo: emergency?.ticketNo || null,
          distanceToNearestEmergencyMeters: distance,
          riskLevel: riskLevel,
        };
      }),
    );

    const summary = tickets.reduce(
      (acc, ticket) => {
        acc.total += 1;
        acc.byUtilityType[ticket.utilityType] =
          (acc.byUtilityType[ticket.utilityType] || 0) + 1;

        if (ticket.riskLevel === 'HIGH') acc.highRisk += 1;
        if (ticket.riskLevel === 'MEDIUM') acc.mediumRisk += 1;
        if (ticket.riskLevel === 'LOW') acc.lowRisk += 1;
        if (!ticket.insideServiceArea) acc.outsideServiceArea += 1;

        return acc;
      },
      {
        total: 0,
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        outsideServiceArea: 0,
        byUtilityType: {} as Record<string, number>,
      },
    );

    return { tickets, summary };
  }

  async emergecyCheck(ticket: Ticket, radiusMeters: number): Promise<EmergencyTicket | null> {
    const distanceSql = `ST_Distance(
      t.geom::geography,
      ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
    )`;

    const emergencyTicket = await this.ticketsRepo
      .createQueryBuilder('t')
      .select('t.ticket_no', 'ticketNo')
      .addSelect(distanceSql, 'distanceMeters')
      .where('t.id <> :id', { id: ticket.id })
      .andWhere('t.priority = :priority', { priority: 'EMERGENCY' })
      .andWhere(
        `ST_DWithin(
          t.geom::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radiusMeters
        )`,
        {
          lng: ticket.geom.coordinates[0],
          lat: ticket.geom.coordinates[1],
          radiusMeters,
        },
      )
      .orderBy(distanceSql, 'ASC')
      .limit(1)
      .getRawOne<EmergencyTicket>();

    return emergencyTicket ?? null;
  }

  private parseBbox(bbox: string): [number, number, number, number] {
    const values = bbox.split(',').map(Number);

    if (
      values.length !== 4 ||
      values.some((value) => !Number.isFinite(value))
    ) {
      throw new BadRequestException(
        'bbox must be: minLng,minLat,maxLng,maxLat',
      );
    }

    const [minLng, minLat, maxLng, maxLat] = values;

    if (minLng >= maxLng || minLat >= maxLat) {
      throw new BadRequestException(
        'bbox min values must be less than max values',
      );
    }

    if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) {
      throw new BadRequestException('bbox coordinates are out of range');
    }

    return [minLng, minLat, maxLng, maxLat];
  }

  private getRiskLevel(ticket: {
    priority: string;
    status: string;
    dueAt: Date | string | null;
    insideServiceArea: boolean;
    hasNearbyEmergency: boolean;
  }): RiskLevel {
    if (ticket.priority === 'EMERGENCY' || ticket.hasNearbyEmergency) {
      return 'HIGH';
    }

    const overduePreCompleted =
      ticket.status === 'PRE_COMPLETED' &&
      ticket.dueAt !== null &&
      new Date(ticket.dueAt).getTime() < Date.now();

    if (!ticket.insideServiceArea || overduePreCompleted) {
      return 'MEDIUM';
    }

    return 'LOW';
  }
}
