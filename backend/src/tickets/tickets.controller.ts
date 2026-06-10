import { Controller, Get, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('api/tickets')
export class TicketsController {
  constructor(private service: TicketsService) {}

  @Get('search')
  search(@Query() query: any) {
    return this.service.search(query);
  }
}