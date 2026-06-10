import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Stack,
  MenuItem,
} from '@mui/material';

import { getTicketMeta } from '../api/ticketApi';

export default function FilterPanel({ filters, setFilters, onSearch }: any) {

  const [meta, setMeta] = useState<any>({
    status: [],
    stationCodes: [],
    utilityTypes: [],
  });

  const [loadingMeta, setLoadingMeta] = useState(false);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setLoadingMeta(true);
        const data = await getTicketMeta();
        setMeta(data);
      } catch (err) {
        console.error('Failed to load meta', err);
      } finally {
        setLoadingMeta(false);
      }
    };

    fetchMeta();
  }, []);

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>

      {/* BBOX */}
      <TextField
        label="BBox"
        value={filters.bbox}
        onChange={(e) =>
          setFilters({ ...filters, bbox: e.target.value })
        }
      />

      {/* STATUS (DYNAMIC) */}
      <TextField
        select
        label="Status"
        value={filters.status}
        onChange={(e) =>
          setFilters({ ...filters, status: e.target.value })
        }
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">All</MenuItem>

        {meta.status.map((s: string) => (
          <MenuItem key={s} value={s}>
            {s}
          </MenuItem>
        ))}
      </TextField>

      {/* STATION CODE (DYNAMIC) */}
      <TextField
        select
        label="Station Code"
        value={filters.stationCode}
        onChange={(e) =>
          setFilters({ ...filters, stationCode: e.target.value })
        }
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">All</MenuItem>

        {meta.stationCodes.map((s: string) => (
          <MenuItem key={s} value={s}>
            {s}
          </MenuItem>
        ))}
      </TextField>

      {/* UTILITY TYPE (DYNAMIC) */}
      <TextField
        select
        label="Utility Type"
        value={filters.utilityType}
        onChange={(e) =>
          setFilters({ ...filters, utilityType: e.target.value })
        }
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">All</MenuItem>

        {meta.utilityTypes.map((u: string) => (
          <MenuItem key={u} value={u}>
            {u}
          </MenuItem>
        ))}
      </TextField>

      {/* SEARCH */}
      <Button
        variant="contained"
        onClick={onSearch}
        disabled={loadingMeta}
      >
        Search
      </Button>

    </Stack>
  );
}