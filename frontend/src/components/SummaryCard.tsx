import { Card, CardContent, Typography } from '@mui/material';

export default function SummaryCard({ summary }: any) {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>

        <Typography variant="h6">
          Total: {summary.total}
        </Typography>

        <Typography variant="body2">
          {JSON.stringify(summary.byStatus, null, 2)}
        </Typography>

      </CardContent>
    </Card>
  );
}