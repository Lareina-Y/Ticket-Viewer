import axios from 'axios';

export const searchTickets = async (params: any) => {
  const res = await axios.get('http://localhost:3000/api/tickets/search', {
    params,
  });
  return res.data;
};