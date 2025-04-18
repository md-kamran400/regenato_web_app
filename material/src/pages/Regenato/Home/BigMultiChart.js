import {
    ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
  } from 'recharts';
  
  const data = [
    {
      month: 'Jan', planned: 30, inProgress: 20, completed: 10, revenue: 100, hours: 850,
    },
    {
      month: 'Feb', planned: 25, inProgress: 35, completed: 15, revenue: 120, hours: 950,
    },
    {
      month: 'Mar', planned: 40, inProgress: 30, completed: 20, revenue: 90, hours: 780,
    },
    // ... more months
  ];
  
  const BigMultiChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" label={{ value: 'Orders', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Revenue ($) / Hours', angle: -90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="planned" stackId="a" fill="#8884d8" />
          <Bar yAxisId="left" dataKey="inProgress" stackId="a" fill="#82ca9d" />
          <Bar yAxisId="left" dataKey="completed" stackId="a" fill="#ffc658" />
          <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ff7300" />
          <Area yAxisId="right" type="monotone" dataKey="hours" fill="#f0f8ff" stroke="#8884d8" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };
  
  export default BigMultiChart;
  