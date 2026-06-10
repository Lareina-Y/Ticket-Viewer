import { TextField, Button, Stack } from '@mui/material';

export default function FilterPanel({ filters, setFilters, onSearch }: any) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>

      <TextField
        label="BBox"
        value={filters.bbox}
        onChange={(e) =>
          setFilters({ ...filters, bbox: e.target.value })
        }
      />

      <TextField
        label="Status"
        value={filters.status}
        onChange={(e) =>
          setFilters({ ...filters, status: e.target.value })
        }
      />

      <TextField
        label="Station Code"
        value={filters.stationCode}
        onChange={(e) =>
          setFilters({ ...filters, stationCode: e.target.value })
        }
      />

      <TextField
        label="Utility Type"
        value={filters.utilityType}
        onChange={(e) =>
          setFilters({ ...filters, utilityType: e.target.value })
        }
      />

      <Button variant="contained" onClick={onSearch}>
        Search
      </Button>

    </Stack>
  );
}