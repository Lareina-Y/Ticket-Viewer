
import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';

export default function TicketTable({ tickets }: any) {
  const rows = tickets.map((t: any) => ({
    id: t.id,
    ticketNo: t.ticketNo,
    status: t.status,
    priority: t.priority,
    stationCode: t.stationCode,
    utilityType: t.utilityType,
    longitude: t.longitude,
    latitude: t.latitude,
  }));

  const columns: GridColDef[] = [
    { field: 'ticketNo', headerName: 'Ticket No', width: 150 },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'priority', headerName: 'Priority', width: 130 },
    { field: 'stationCode', headerName: 'Station', width: 130 },
    { field: 'utilityType', headerName: 'Utility', width: 130 },
    { field: 'longitude', headerName: 'Lng', width: 120 },
    { field: 'latitude', headerName: 'Lat', width: 120 },
  ];

  return (
    <Box sx={{ height: 400, mt: 3 }}>
      <DataGrid rows={rows} columns={columns} />
    </Box>
  );
}