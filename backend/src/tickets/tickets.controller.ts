import { Controller, Get, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { SearchTicketsDto } from './dto/search.dto';
import { ConflictsTicketsDto } from './dto/conflicts.dto';

@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('search')
  search(@Query() query: SearchTicketsDto) {
    return this.ticketsService.search(query);
  }

  @Get('meta')
  getMeta() {
    return this.ticketsService.getMeta();
  }

  @Get('conflicts')
  conflict(@Query() query: ConflictsTicketsDto) {
    return this.ticketsService.conflict(query);
  }

}