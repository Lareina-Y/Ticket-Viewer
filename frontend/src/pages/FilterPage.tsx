import { useState } from 'react';
import { searchTickets } from '../api/ticketApi';
import { Container, Typography, CircularProgress, Alert } from '@mui/material';

import FilterPanel from '../components/FilterPanel';
import TicketTable from '../components/TicketTable';
import SummaryCard from '../components/SummaryCard';
import TicketMap from '../components/TicketMap';

export default function FilterPage () {
  const [filters, setFilters] = useState({
    bbox: '-80,43,-79,44',
    status: '',
    stationCode: '',
    utilityType: '',
  });

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await searchTickets(filters);
      setData(res);

    } catch (e) {
      setError('Failed to fetch tickets');
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
        onSearch={handleSearch}
      />

      {loading && <CircularProgress sx={{ mt: 2 }} />}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <TicketMap tickets={data?.tickets || []}/>
      {data && (
        <>
          <SummaryCard summary={data.summary} />
          <TicketTable tickets={data.tickets} />
          {/* <TicketMap tickets={data.tickets}/> */}
        </>
      )}
    </Container>
  );
}