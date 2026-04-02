import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Server, Cpu, Database, Network, Clock, Gauge, HardDrive, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const SystemParameters: React.FC = () => {
  const navigate = useNavigate();

  const systemPerformance = [
    { time: '00:00', cpu: 45, memory: 62, disk: 78, network: 234 },
    { time: '04:00', cpu: 38, memory: 58, disk: 76, network: 189 },
    { time: '08:00', cpu: 72, memory: 71, disk: 79, network: 567 },
    { time: '12:00', cpu: 85, memory: 79, disk: 81, network: 723 },
    { time: '16:00', cpu: 91, memory: 83, disk: 82, network: 891 },
    { time: '20:00', cpu: 67, memory: 75, disk: 80, network: 445 }
  ];

  const billingCycles = [
    { type: 'Monthly', users: 45000, percentage: 80 },
    { type: 'Bi-monthly', users: 8500, percentage: 15 },
    { type: 'Quarterly', users: 2500, percentage: 5 }
  ];

  const notificationStats = [
    { channel: 'SMS', sent: 125000, delivered: 119500, failed: 5500 },
    { channel: 'Email', sent: 89000, delivered: 86340, failed: 2660 },
    { channel: 'Push', sent: 67000, delivered: 64230, failed: 2770 },
    { channel: 'WhatsApp', sent: 45000, delivered: 43650, failed: 1350 }
  ];

  const apiRateLimits = [
    { endpoint: '/api/auth', limit: 1000, current: 234, percentage: 23.4 },
    { endpoint: '/api/bills', limit: 5000, current: 3200, percentage: 64.0 },
    { endpoint: '/api/consumers', limit: 2000, current: 876, percentage: 43.8 },
    { endpoint: '/api/complaints', limit: 1500, current: 456, percentage: 30.4 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              System Parameters & Configuration
            </h1>
            <p className="text-muted-foreground mt-2">
              Operational parameters and system configuration management
            </p>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">System Uptime</CardTitle>
                <Server className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">99.98%</div>
              <p className="text-sm opacity-90">187 days continuous</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">CPU Usage</CardTitle>
                <Cpu className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">67%</div>
              <p className="text-sm opacity-90">Average load</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">Memory Usage</CardTitle>
                <Database className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">75%</div>
              <p className="text-sm opacity-90">48GB / 64GB</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">Network Traffic</CardTitle>
                <Network className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">445 MB/s</div>
              <p className="text-sm opacity-90">Current throughput</p>
            </CardContent>
          </Card>
        </div>

        {/* System Performance Monitoring */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Gauge className="h-6 w-6" />
              Real-time System Performance
            </CardTitle>
            <CardDescription>24-hour system resource utilization monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={systemPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value, name) => {
                  if (name === 'network') return [`${value} MB/s`, 'Network'];
                  return [`${value}%`, String(name).toUpperCase()];
                }} />
                <Area type="monotone" dataKey="cpu" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="cpu" />
                <Area type="monotone" dataKey="memory" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} name="memory" />
                <Area type="monotone" dataKey="disk" stackId="3" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} name="disk" />
                <Line type="monotone" dataKey="network" stroke="#ff7300" strokeWidth={2} name="network" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Billing and Notification Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Billing Cycle Distribution
              </CardTitle>
              <CardDescription>Consumer preferences for billing frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={billingCycles}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="users"
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                  >
                    {billingCycles.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value.toLocaleString(), 'Users']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Notification Delivery Stats
              </CardTitle>
              <CardDescription>Message delivery success rates by channel</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={notificationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channel" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
                  <Bar dataKey="delivered" fill="#00C49F" name="Delivered" />
                  <Bar dataKey="failed" fill="#FF8042" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* API Rate Limits */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Network className="h-6 w-6" />
              API Rate Limit Monitoring
            </CardTitle>
            <CardDescription>Current API usage against configured limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {apiRateLimits.map((api, index) => (
                <Card key={index} className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{api.endpoint}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current</span>
                        <span className="font-semibold">{api.current}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Limit</span>
                        <span className="font-semibold">{api.limit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${api.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-center text-sm font-medium">
                        {api.percentage.toFixed(1)}% utilized
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Configuration Parameters */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Operational Configuration Details</CardTitle>
            <CardDescription className="text-gray-300">
              Comprehensive system parameter specifications and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Storage & Database
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• Primary database: PostgreSQL 15.2 with 2TB storage</li>
                  <li>• Backup retention: 7 days incremental, 30 days full</li>
                  <li>• Data compression ratio: 3.2:1 using LZ4 algorithm</li>
                  <li>• Connection pooling: max 500 concurrent connections</li>
                  <li>• Query optimization: automatic index management</li>
                  <li>• Replication: Master-slave with automatic failover</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Configuration
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• Load balancer: HAProxy with SSL termination</li>
                  <li>• CDN: CloudFlare with 99.9% availability SLA</li>
                  <li>• Bandwidth allocation: 10 Gbps dedicated line</li>
                  <li>• DDoS protection: Layer 3/4 and Layer 7 filtering</li>
                  <li>• Geographic distribution: 5 edge locations</li>
                  <li>• API gateway: Rate limiting and request throttling</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Billing Configuration
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• Billing cycle start: 1st of every month</li>
                  <li>• Due date calculation: 21 days from bill generation</li>
                  <li>• Late fee: 2% per month after due date</li>
                  <li>• Reconnection fee: ₹200 for residential, ₹500 commercial</li>
                  <li>• Payment gateway integration: Razorpay, PayU, CCAvenue</li>
                  <li>• Auto-debit setup: 65% consumers enrolled</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Notification Settings
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• SMS gateway: Multi-vendor with failover support</li>
                  <li>• Email server: SMTP with DKIM/SPF authentication</li>
                  <li>• Push notifications: Firebase Cloud Messaging</li>
                  <li>• WhatsApp Business API: Verified business account</li>
                  <li>• Delivery retry logic: 3 attempts with exponential backoff</li>
                  <li>• Template management: 50+ pre-approved templates</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white/10 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Performance Thresholds & Alerts</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">CPU &lt; 80%</div>
                  <p className="text-sm">Normal Operation</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-2">80-90%</div>
                  <p className="text-sm">Warning Alert</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-2">90-95%</div>
                  <p className="text-sm">Critical Alert</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400 mb-2">&gt; 95%</div>
                  <p className="text-sm">Emergency Scale</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemParameters;