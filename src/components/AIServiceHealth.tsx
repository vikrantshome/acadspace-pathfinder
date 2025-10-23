// AI Service Health Check Component
// Shows the status of the AI microservice connection

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Brain } from 'lucide-react';
import { apiService } from '@/lib/api';

interface AIServiceHealthProps {
  className?: string;
}

export const AIServiceHealth: React.FC<AIServiceHealthProps> = ({ className }) => {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'unhealthy' | 'unknown'>('unknown');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    setChecking(true);
    setStatus('checking');
    
    try {
      const response = await apiService.aiServiceHealthCheck();
      if (response?.aiServiceHealthy) {
        setStatus('healthy');
      } else {
        setStatus('unhealthy');
      }
      setLastCheck(new Date());
    } catch (error) {
      console.error('AI Service health check failed:', error);
      setStatus('unhealthy');
      setLastCheck(new Date());
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 60 seconds (less frequent than backend)
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = () => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle,
          label: 'AI Service Connected',
          variant: 'default' as const,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
      case 'unhealthy':
        return {
          icon: XCircle,
          label: 'AI Service Offline',
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
          <Brain className="w-4 h-4" />
          AI Service Status
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
          AI Report Generation Service
        </div>

        {status === 'unhealthy' && (
          <div className="text-xs text-destructive">
            AI enhancements may not be available. Reports will show basic content.
          </div>
        )}

        {status === 'healthy' && (
          <div className="text-xs text-green-600">
            AI-powered career insights are available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

