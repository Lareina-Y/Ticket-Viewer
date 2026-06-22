import { Card, CardContent, Typography } from '@mui/material';
import type { TicketConflictSummary } from '../types/tickets';

interface SummaryCardProps {
  summary: TicketConflictSummary;
};

export default function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>

        <Typography variant="h6">
          Total: {summary.total}
        </Typography>

        <Typography variant="body2">
          HighRisk: {summary.highRisk}
        </Typography>

        <Typography variant="body2">
          MediumRisk: {summary.mediumRisk}
        </Typography>

        <Typography variant="body2">
          LowRisk: {summary.lowRisk}
        </Typography>

        <Typography variant="body2">
          {JSON.stringify(summary.byUtilityType, null, 2)}
        </Typography>

      </CardContent>
    </Card>
  );
}