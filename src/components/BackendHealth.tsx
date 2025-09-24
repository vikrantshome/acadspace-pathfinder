// Backend Health Check Component
// Shows the status of the Spring Boot backend connection

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Server } from 'lucide-react';
import { apiService } from '@/lib/api';
import { API_CONFIG } from '@/lib/config';

interface BackendHealthProps {
  className?: string;
}

export const BackendHealth: React.FC<BackendHealthProps> = ({ className }) => {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'unhealthy' | 'unknown'>('unknown');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    setStatus('checking');
    
    try {
      await apiService.healthCheck();
      setStatus('healthy');
      setLastCheck(new Date());
    } catch (error) {
      console.error('Backend health check failed:', error);
      setStatus('unhealthy');
      setLastCheck(new Date());
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = () => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle,
          label: 'Backend Connected',
          variant: 'default' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'unhealthy':
        return {
          icon: XCircle,
          label: 'Backend Offline',
          variant: 'destructive' as const,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        };
      case 'checking':
        return {
          icon: RefreshCw,
          label: 'Checking...',
          variant: 'secondary' as const,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      default:
        return {
          icon: AlertTriangle,
          label: 'Unknown',
          variant: 'outline' as const,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Server className="w-4 h-4" />
          Backend Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon 
              className={`w-4 h-4 ${statusInfo.color} ${checking ? 'animate-spin' : ''}`} 
            />
            <Badge variant={statusInfo.variant} className="text-xs">
              {statusInfo.label}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            disabled={checking}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${checking ? 'animate-spin' : ''}`} />
            Check
          </Button>
        </div>
        
        {lastCheck && (
          <div className="text-xs text-muted-foreground">
            Last checked: {lastCheck.toLocaleTimeString()}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Endpoint: {API_CONFIG.BASE_URL.replace('/api', '')}
        </div>

        {status === 'unhealthy' && (
          <div className="text-xs text-destructive">
            Make sure the Spring Boot backend is running on port 4000
          </div>
        )}
      </CardContent>
    </Card>
  );
};