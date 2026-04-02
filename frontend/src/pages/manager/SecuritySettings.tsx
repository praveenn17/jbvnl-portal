import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Key, Eye, AlertTriangle, CheckCircle, Users, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

const SecuritySettings: React.FC = () => {
  const navigate = useNavigate();

  const securityMetrics = [
    { name: 'Successful Logins', value: 2847, color: '#00C49F' },
    { name: 'Failed Attempts', value: 23, color: '#FF8042' },
    { name: 'Blocked IPs', value: 12, color: '#FFBB28' },
    { name: 'Active Sessions', value: 156, color: '#0088FE' }
  ];

  const passwordCompliance = [
    { criteria: 'Minimum 8 characters', compliance: 94 },
    { criteria: 'Special characters', compliance: 87 },
    { criteria: 'Uppercase/Lowercase', compliance: 91 },
    { criteria: 'Numbers included', compliance: 89 },
    { criteria: 'No dictionary words', compliance: 83 }
  ];

  const monthlySecurityEvents = [
    { month: 'Jan', incidents: 5, resolved: 5 },
    { month: 'Feb', incidents: 3, resolved: 3 },
    { month: 'Mar', incidents: 8, resolved: 7 },
    { month: 'Apr', incidents: 2, resolved: 2 },
    { month: 'May', incidents: 6, resolved: 6 },
    { month: 'Jun', incidents: 4, resolved: 4 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6">
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Security Settings & Protocols
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive security management and threat analysis
            </p>
          </div>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">Security Score</CardTitle>
                <Shield className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">94.5%</div>
              <p className="text-sm opacity-90">Excellent security posture</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">Active Users</CardTitle>
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">156</div>
              <p className="text-sm opacity-90">Currently online</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">Threats Blocked</CardTitle>
                <AlertTriangle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">23</div>
              <p className="text-sm opacity-90">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm opacity-90">System Uptime</CardTitle>
                <Server className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">99.98%</div>
              <p className="text-sm opacity-90">Last 6 months</p>
            </CardContent>
          </Card>
        </div>

        {/* Security Metrics Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Login Activity Analysis
              </CardTitle>
              <CardDescription>Security events breakdown over last month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={securityMetrics}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {securityMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password Policy Compliance
              </CardTitle>
              <CardDescription>User adherence to password requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={passwordCompliance} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="criteria" type="category" width={120} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Compliance']} />
                  <Bar dataKey="compliance" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Security Incident Trends */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Security Incident Trends
            </CardTitle>
            <CardDescription>Monthly security incidents and resolution status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySecurityEvents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="incidents" stroke="#ff7300" strokeWidth={2} name="Incidents Reported" />
                <Line type="monotone" dataKey="resolved" stroke="#00c49f" strokeWidth={2} name="Incidents Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Multi-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Enabled Users</span>
                  <span className="font-bold">89%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>SMS Verification</span>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Email Verification</span>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Authenticator App</span>
                  <CheckCircle className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Firewall Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Active Rules</span>
                  <span className="font-bold">47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Blocked Attempts</span>
                  <span className="font-bold">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>DDoS Protection</span>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Intrusion Detection</span>
                  <CheckCircle className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Monitoring & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>24/7 Monitoring</span>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Real-time Alerts</span>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Log Retention</span>
                  <span className="font-bold">1 Year</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Incident Response</span>
                  <span className="font-bold">&lt;15min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Security Protocols */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Advanced Security Protocols</CardTitle>
            <CardDescription className="text-gray-300">
              Comprehensive security measures and implementation details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Authentication Security</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Password complexity requirements with minimum 12 characters</li>
                  <li>• Account lockout after 3 failed login attempts</li>
                  <li>• Session timeout after 30 minutes of inactivity</li>
                  <li>• Mandatory password rotation every 90 days</li>
                  <li>• Integration with enterprise LDAP/Active Directory</li>
                  <li>• Biometric authentication support for mobile devices</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Data Protection</h3>
                <ul className="space-y-2 text-sm">
                  <li>• AES-256 encryption for data at rest</li>
                  <li>• TLS 1.3 encryption for data in transit</li>
                  <li>• Regular security audits and penetration testing</li>
                  <li>• GDPR and ISO 27001 compliance</li>
                  <li>• Automated backup with 99.9% recovery guarantee</li>
                  <li>• Geographic data replication across multiple centers</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white/10 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Emergency Response Protocol</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400 mb-2">Tier 1</div>
                  <p className="text-sm">Low Priority Issues</p>
                  <p className="text-xs text-gray-300">Response: 4 hours</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400 mb-2">Tier 2</div>
                  <p className="text-sm">Medium Priority Issues</p>
                  <p className="text-xs text-gray-300">Response: 1 hour</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-2">Tier 3</div>
                  <p className="text-sm">Critical Security Breach</p>
                  <p className="text-xs text-gray-300">Response: 15 minutes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecuritySettings;