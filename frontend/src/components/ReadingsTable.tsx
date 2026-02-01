import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Thermometer } from 'lucide-react';
import type { SensorReading } from '@/lib/api';

interface ReadingsTableProps {
  readings: SensorReading[];
  isLoading: boolean;
}

export function ReadingsTable({ readings, isLoading }: ReadingsTableProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-400/10">
            <Thermometer className="w-5 h-5 text-cyan-400" />
          </div>
          <span>Sensor Readings</span>
          <Badge variant="secondary" className="ml-auto">
            {readings.length} records
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {readings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No readings recorded yet
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Temp (°C)</TableHead>
                  <TableHead>Humidity (%)</TableHead>
                  <TableHead>Distance (cm)</TableHead>
                  <TableHead>Water (%)</TableHead>
                  <TableHead>Rain Pred (%)</TableHead>
                  <TableHead>Vibration</TableHead>
                  <TableHead>Human</TableHead>
                  <TableHead>Valve</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readings.map((reading, index) => (
                  <TableRow 
                    key={reading._id || String(index)}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-mono text-sm">
                      {reading.timestamp}
                    </TableCell>
                    <TableCell>{reading.temp?.toFixed(1) ?? '-'}</TableCell>
                    <TableCell>{reading.humidity?.toFixed(1) ?? '-'}</TableCell>
                    <TableCell>{reading.distance?.toFixed(1) ?? '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={(reading.percent ?? 0) > 75 ? 'destructive' : (reading.percent ?? 0) > 50 ? 'default' : 'secondary'}
                      >
                        {reading.percent?.toFixed(1) ?? '-'}%
                      </Badge>
                    </TableCell>
                    <TableCell>{reading.rain_prediction?.toFixed(1) ?? '-'}%</TableCell>
                    <TableCell>
                      <Badge variant={reading.vibration ? 'destructive' : 'secondary'}>
                        {reading.vibration ? 'YES' : 'NO'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={reading.human_detected ? 'destructive' : 'secondary'}>
                        {reading.human_detected ? 'YES' : 'NO'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={reading.valve_state === 'OPEN' ? 'default' : 'secondary'}>
                        {reading.valve_state || '-'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}