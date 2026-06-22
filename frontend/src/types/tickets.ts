export type TicketFilters = {
  bbox: string;
  stationCode: string;
  utilityType: string;
  radiusMeters: number;
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
  insideServiceArea: Boolean;
  nearestEmergencyTicketNo: string | null,
  distanceToNearestEmergencyMeters: number | null,
  riskLevel: string;
};

export type TicketConflictSummary = {
  total: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  outsideServiceArea: number;
  byUtilityType: Record<string, number>;
};

export type TicketConflictResponse= {
  tickets: Ticket[];
  summary: TicketConflictSummary;
};

export type TicketMeta = {
  status: string[];
  stationCodes: string[];
  utilityTypes: string[];
};
