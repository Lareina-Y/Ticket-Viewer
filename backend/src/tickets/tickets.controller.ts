import { Controller, Get, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { SearchTicketsDto } from './dto/search.dto';

@Controller('api/tickets')
export class TicketsController {
  constructor(private service: TicketsService) {}

  @Get('search')
  search(@Query() query: SearchTicketsDto) {
    return this.service.search(query);
  }

  @Get('meta')
  getMeta() {
    return this.service.getMeta();
  }
}