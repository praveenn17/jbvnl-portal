import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Search, FilterX, Clock, Server, ShieldAlert, AlertTriangle, Info, Shield, Users, User, FileText, Settings, UserCheck } from 'lucide-react';
import { mockApi } from '../../lib/mockApi';
import { AuditLog } from '../../types';

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
    case 'warning': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
    default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'manager': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'consumer': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const getActionIcon = (type: string) => {
  switch (type) {
    case 'user': return <UserCheck className="h-4 w-4" />;
    case 'complaint': return <AlertTriangle className="h-4 w-4" />;
    case 'bill': return <FileText className="h-4 w-4" />;
    case 'setting': return <Settings className="h-4 w-4" />;
    case 'auth': return <Shield className="h-4 w-4" />;
    case 'system': return <Server className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [roleFilter, severityFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (roleFilter !== 'all') filters.actorRole = roleFilter;
      if (severityFilter !== 'all') filters.severity = severityFilter;
      
      const response = await mockApi.getAuditLogs(filters);
      setLogs(response.logs || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.message.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          (log.actorName || '').toLowerCase().includes(query) ||
          (log.targetLabel || '').toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [logs, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setSeverityFilter('all');
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">System Audit Logs</h3>
        <p className="text-sm text-muted-foreground">Monitor administrative actions and system events</p>
      </div>

      {/* Filters */}
      <Card className="bg-muted/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by message, actor, or action..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Actor Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="consumer">Consumer</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleClearFilters} title="Clear Filters">
              <FilterX className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <ShieldAlert className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-foreground">No audit logs found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-4 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex gap-4 items-start">
                    <div className={`mt-1 p-2 rounded-full border bg-background flex-shrink-0 ${log.severity === 'warning' ? 'text-amber-500 border-amber-500/30' : log.severity === 'critical' ? 'text-red-500 border-red-500/30' : 'text-blue-500 border-blue-500/30'}`}>
                      {getActionIcon(log.targetType || 'unknown')}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">{log.action}</span>
                        <Badge variant="outline" className={getRoleColor(log.actorRole)}>
                          {log.actorRole}
                        </Badge>
                        <Badge variant="outline" className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{log.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.actorName || log.actorEmail || 'System'}
                        </span>
                        {log.targetLabel && (
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-border" />
                            Target: {log.targetLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs text-muted-foreground flex items-center justify-end gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Audit Log Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex justify-between items-start border-b border-border/50 pb-4">
                <div>
                  <h4 className="text-lg font-semibold text-foreground">{selectedLog.action}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{selectedLog.message}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getSeverityColor(selectedLog.severity)}>{selectedLog.severity}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Actor Info */}
                <div className="space-y-3">
                  <h5 className="font-medium text-foreground flex items-center gap-2">
                    <User className="h-4 w-4" /> Actor Details
                  </h5>
                  <div className="bg-muted/30 p-3 rounded-lg space-y-2 border border-border/50">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{selectedLog.actorName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{selectedLog.actorEmail || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Role</span>
                      <Badge variant="outline" className={getRoleColor(selectedLog.actorRole)}>{selectedLog.actorRole}</Badge>
                    </div>
                  </div>
                </div>

                {/* Target Info */}
                <div className="space-y-3">
                  <h5 className="font-medium text-foreground flex items-center gap-2">
                    <Server className="h-4 w-4" /> Target Details
                  </h5>
                  <div className="bg-muted/30 p-3 rounded-lg space-y-2 border border-border/50 h-full">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium capitalize">{selectedLog.targetType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Label</span>
                      <span className="font-medium">{selectedLog.targetLabel || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID</span>
                      <span className="font-mono text-xs text-muted-foreground">{selectedLog.targetId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium text-foreground flex items-center gap-2">
                    <Info className="h-4 w-4" /> Additional Metadata
                  </h5>
                  <div className="bg-black/40 p-4 rounded-lg border border-border/50 overflow-x-auto">
                    <pre className="text-xs text-emerald-400/90 font-mono">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedLog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogs;
