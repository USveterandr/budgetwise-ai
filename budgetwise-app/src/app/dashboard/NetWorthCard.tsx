'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

export default function NetWorthCard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/net-worth');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Net worth fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Net Worth Over Time
      </h2>
      <LineChart width={800} height={300} data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#059669" 
          strokeWidth={2} 
        />
      </LineChart>
    </div>
  );
}