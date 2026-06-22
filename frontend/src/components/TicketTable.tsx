
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import type { Ticket } from '../types/tickets';

interface TicketTableProps {
  tickets: Ticket[];
};

export default function TicketTable({ tickets }: TicketTableProps) {
  const rows = tickets.map((t) => ({
    id: t.id,
    ticketNo: t.ticketNo,
    status: t.status,
    priority: t.priority,
    stationCode: t.stationCode,
    utilityType: t.utilityType,
    longitude: t.longitude,
    latitude: t.latitude,
    riskLevel: t.riskLevel,
  }));

  const columns: GridColDef[] = [
    { field: 'ticketNo', headerName: 'Ticket No', width: 110 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'priority', headerName: 'Priority', width: 100 },
    { field: 'stationCode', headerName: 'Station Code', width: 105 },
    { field: 'utilityType', headerName: 'Utility Type', width: 100 },
    { field: 'longitude', headerName: 'Lng', width: 80 },
    { field: 'latitude', headerName: 'Lat', width: 80 },
    { field: 'riskLevel', headerName: 'Risk Level', width: 90 },
  ];

  return (
    <Box sx={{ height: 400, mt: 3 }}>
      <DataGrid rows={rows} columns={columns} />
    </Box>
  );
}
