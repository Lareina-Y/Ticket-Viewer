import axios from 'axios';
import type {
  TicketFilters,
  TicketMeta,
  TicketConflictResponse,
} from '../types/tickets';

export const conflictTickets = async (params: TicketFilters) => {
  const res = await axios.get<TicketConflictResponse>('http://localhost:3000/api/tickets/conflicts', {
    params,
  });
  return res.data;
};

export const getTicketMeta = async () => {
  const res = await axios.get<TicketMeta>('http://localhost:3000/api/tickets/meta');
  return res.data;
};
