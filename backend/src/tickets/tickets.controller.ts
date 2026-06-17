import { Controller, Get, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { SearchTicketsDto } from './dto/search.dto';

@Controller('api/tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get('search')
  search(@Query() query: SearchTicketsDto) {
    return this.ticketsService.search(query);
  }

  @Get('meta')
  getMeta() {
    return this.ticketsService.getMeta();
  }
}