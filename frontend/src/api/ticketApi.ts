import axios from 'axios';
import type {
  TicketFilters,
  TicketMeta,
  TicketSearchResponse,
} from '../types/tickets';

export const searchTickets = async (params: TicketFilters) => {
  const res = await axios.get<TicketSearchResponse>('http://localhost:3000/api/tickets/search', {
    params,
  });
  return res.data;
};

export const getTicketMeta = async () => {
  const res = await axios.get<TicketMeta>('http://localhost:3000/api/tickets/meta');
  return res.data;
};
