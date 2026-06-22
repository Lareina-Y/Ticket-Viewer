import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  TextField,
  Button,
  Stack,
  MenuItem,
} from '@mui/material';

import { getTicketMeta } from '../api/ticketApi';
import type { TicketFilters, TicketMeta } from '../types/tickets';

interface FilterPanelProps {
  filters: TicketFilters;
  setFilters: Dispatch<SetStateAction<TicketFilters>>;
  onSearch: () => void;
};

export default function FilterPanel({ filters, setFilters, onSearch }: FilterPanelProps) {

  const [meta, setMeta] = useState<TicketMeta>({
    status: [],
    stationCodes: [],
    utilityTypes: [],
  });

  const [loadingMeta, setLoadingMeta] = useState(false);
  const [bboxError, setBboxError] = useState<string | null>(null);

  function validateBBox(value: string): string | null {
    if (!value || value.trim() === '') {
      return 'BBox is required';
    }

    const parts = value.split(',').map(v => v.trim());

    if (parts.length !== 4) {
      return 'BBox must be: minLng,minLat,maxLng,maxLat';
    }

    const nums = parts.map(Number);

    if (nums.some(v => Number.isNaN(v))) {
      return 'BBox must contain valid numbers';
    }

    const [minLng, minLat, maxLng, maxLat] = nums;

    if (minLng >= maxLng || minLat >= maxLat) {
      return 'Invalid bbox range';
    }

    if (
      minLng < -180 || maxLng > 180 ||
      minLat < -90 || maxLat > 90
    ) {
      return 'BBox out of bounds';
    }

    return null;
  }

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
        error={!!bboxError}
        helperText={bboxError || ' '}
        onChange={(e) => {
          const value = e.target.value;
          setFilters({ ...filters, bbox: value });
          setBboxError(validateBBox(value));
        }}
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
        disabled={loadingMeta || !!bboxError}
        sx={{ height: 58 }}
      >
        Search
      </Button>

    </Stack>
  );
}
