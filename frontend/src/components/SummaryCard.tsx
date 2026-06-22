import { Card, CardContent, Typography } from '@mui/material';
import type { TicketSummary } from '../types/tickets';

interface SummaryCardProps {
  summary: TicketSummary;
};

export default function SummaryCard({ summary }: SummaryCardProps) {
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