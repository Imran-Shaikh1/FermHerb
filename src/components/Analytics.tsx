import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface AnalyticsData {
  totalBatches: number;
  verifiedBatches: number;
  pendingBatches: number;
  flaggedIssues: number;
  weeklyData: { week: string; batches: number }[];
}

const Analytics = ({ data }: { data: AnalyticsData }) => {
  const pieData = [
    { name: 'Verified', value: data.verifiedBatches, color: 'hsl(var(--success))' },
    { name: 'Pending', value: data.pendingBatches, color: 'hsl(var(--warning))' },
    { name: 'Flagged', value: data.flaggedIssues, color: 'hsl(var(--destructive))' }
  ];

  const stats = [
    {
      title: "Total Batches Collected",
      value: data.totalBatches,
      icon: TrendingUp,
      theme: "neutral",
      bgColor: "bg-muted",
      iconColor: "text-muted-foreground"
    },
    {
      title: "Verified by Labs", 
      value: data.verifiedBatches,
      icon: CheckCircle,
      theme: "success",
      bgColor: "bg-success/10",
      iconColor: "text-success"
    },
    {
      title: "Pending Processing",
      value: data.pendingBatches,
      icon: Clock,
      theme: "warning", 
      bgColor: "bg-warning/10",
      iconColor: "text-warning"
    },
    {
      title: "Flagged Issues",
      value: data.flaggedIssues,
      icon: AlertTriangle,
      theme: "destructive",
      bgColor: "bg-destructive/10", 
      iconColor: "text-destructive"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Sacred Origins Analytics
        </h1>
        <p className="text-muted-foreground">
          Real-time insights into your herbal supply chain
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Batch Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
  contentStyle={{
    backgroundColor: '#fff',      // white background
    border: '1px solid #ccc',     // light border
    borderRadius: '8px',
    color: '#000',                 // black text
    fontSize: '14px',              // readable size
    fontWeight: 500
  }}
/>

              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Weekly Collection Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="week" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Bar 
                  dataKey="batches" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;