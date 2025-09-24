import { useState, useEffect } from 'react';
import Analytics from '@/components/Analytics';

const AnalyticsPage = () => {
  // Mock data matching the requested JSON structure
  const [analyticsData] = useState({
    totalBatches: 120,
    verifiedBatches: 95,
    pendingBatches: 15,
    flaggedIssues: 2,
    weeklyData: [
      { week: "Week 1", batches: 20 },
      { week: "Week 2", batches: 30 },
      { week: "Week 3", batches: 25 },
      { week: "Week 4", batches: 45 }
    ]
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        <Analytics data={analyticsData} />
      </div>
    </div>
  );
};

export default AnalyticsPage;