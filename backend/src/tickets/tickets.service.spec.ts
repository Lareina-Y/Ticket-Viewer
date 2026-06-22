import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { StationCode } from './entities/station-code.entity';

describe('TicketsService', () => {
  let service: TicketsService;

  const mockTicketsRepo = {
    createQueryBuilder: jest.fn(),
  };

  const mockStationRepo = {
    find: jest.fn(),
  };
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockTicketsRepo,
        },
        {
          provide: getRepositoryToken(StationCode),
          useValue: mockStationRepo,
        }
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test for tickets search method
  it('should return tickets', async () => {
    const qbMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          ticket_no: 'T001',
          status: 'OPEN',
          priority: 'HIGH',
          geom: { coordinates: [-79, 43] },
          station: {
            code: 'S1',
            utility_type: 'POWER',
          },
        },
      ]),
    };

    mockTicketsRepo.createQueryBuilder.mockReturnValue(qbMock);

    const result = await service.search({
      bbox: '-80,40,-78,44',
    } as any);

    expect(result.tickets.length).toBe(1);
    expect(result.summary.total).toBe(1);
  });
});
