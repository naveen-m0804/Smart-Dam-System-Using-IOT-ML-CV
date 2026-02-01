import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Droplets, Activity, UserX } from 'lucide-react';
import type { AlertLog } from '@/lib/api';

interface LogTableProps {
  logs: AlertLog[];
  type: 'waterlevel' | 'vibration' | 'human';
  isLoading: boolean;
}

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; title: string; colorClass: string; bgClass: string }> = {
  waterlevel: {
    icon: Droplets,
    title: 'Water Level Alerts',
    colorClass: 'text-sky-400',
    bgClass: 'bg-sky-400/10',
  },
  vibration: {
    icon: Activity,
    title: 'Vibration Alerts',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-400/10',
  },
  human: {
    icon: UserX,
    title: 'Human Detection Alerts',
    colorClass: 'text-red-400',
    bgClass: 'bg-red-400/10',
  },
};

export function LogTable({ logs, type, isLoading }: LogTableProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

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
          <div className={`p-2 rounded-lg ${config.bgClass}`}>
            <Icon className={`w-5 h-5 ${config.colorClass}`} />
          </div>
          <span>{config.title}</span>
          <Badge variant="secondary" className="ml-auto">
            {logs.length} records
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No alerts recorded yet
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Level</TableHead>
                  {type === 'waterlevel' && (
                    <>
                      <TableHead>Distance (cm)</TableHead>
                      <TableHead>Percent (%)</TableHead>
                    </>
                  )}
                  {type === 'human' && <TableHead>Status</TableHead>}
                  <TableHead>Node</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow 
                    key={log._id || String(index)}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-mono text-sm">
                      {log.timestamp}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={log.level === 'HIGH' || log.level === 'HIGH_WATER' ? 'destructive' : 'secondary'}
                      >
                        {log.level}
                      </Badge>
                    </TableCell>
                    {type === 'waterlevel' && (
                      <>
                        <TableCell>{log.distanceCm?.toFixed(1) ?? '-'}</TableCell>
                        <TableCell>{log.percent?.toFixed(1) ?? '-'}%</TableCell>
                      </>
                    )}
                    {type === 'human' && (
                      <TableCell>
                        <Badge variant="destructive">Detected</Badge>
                      </TableCell>
                    )}
                    <TableCell className="text-muted-foreground">
                      {log.nodeId || 'main'}
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