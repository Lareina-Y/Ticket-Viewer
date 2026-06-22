export type TicketFilters = {
  bbox: string;
  status: string;
  stationCode: string;
  utilityType: string;
};

export type Ticket = {
  id: number;
  ticketNo: string;
  status: string;
  priority: string;
  stationCode: string;
  utilityType: string;
  longitude: number | null;
  latitude: number | null;
};

export type TicketSummary = {
  total: number;
  byStatus: Record<string, number>;
};

export type TicketSearchResponse = {
  tickets: Ticket[];
  summary: TicketSummary;
};

export type TicketMeta = {
  status: string[];
  stationCodes: string[];
  utilityTypes: string[];
};
