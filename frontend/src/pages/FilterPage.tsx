import { useState } from 'react';
import { conflictTickets } from '../api/ticketApi';
import { Container, Typography, CircularProgress, Alert } from '@mui/material';

import FilterPanel from '../components/FilterPanel';
import TicketTable from '../components/TicketTable';
import SummaryCard from '../components/SummaryCard';
import TicketMap from '../components/TicketMap';
import type { TicketFilters, TicketConflictResponse } from '../types/tickets';

export default function FilterPage () {
  const [filters, setFilters] = useState<TicketFilters>({
    bbox: '-80,43,-79,44',
    stationCode: '',
    utilityType: '',
    radiusMeters: 250,
  });

  const [data, setData] = useState<TicketConflictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConflicts = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await conflictTickets(filters);
      setData(res);

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to conflict tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        mb: 4,
        px: { xs: 2, sm: 3, md: 6 },
      }}
    >
      
      <Typography variant="h4" gutterBottom>
        GIS Ticket Viewer
      </Typography>

      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        onSearch={handleConflicts}
      />

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <TicketMap
        tickets={data?.tickets || []}
        onBBoxChange={(bbox: string) =>
          setFilters((prev) => ({ ...prev, bbox }))
        }
      />
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {data && (
        <>
          <SummaryCard summary={data.summary} />
          <TicketTable tickets={data.tickets} />
        </>
      )}
    </Container>
  );
}
