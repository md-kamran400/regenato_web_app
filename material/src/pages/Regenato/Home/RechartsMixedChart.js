import React from 'react';
import { AreaChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { Card, CardBody, CardHeader } from 'reactstrap';
const data = [
  { name: 'Jan', lineValue: 400, barValue: 240 },
  { name: 'Feb', lineValue: 300, barValue: 139 },
  { name: 'Mar', lineValue: 600, barValue: 980 },
  { name: 'Apr', lineValue: 800, barValue: 390 },
  { name: 'May', lineValue: 500, barValue: 480 },
  { name: 'Jun', lineValue: 900, barValue: 380 },
  { name: 'Jul', lineValue: 1000, barValue: 430 },
];

const RechartsMixedChart = () => {
  return (
    <Card>
      <CardHeader>
        <h5>Mixed Chart (Recharts)</h5>
      </CardHeader>
      <CardBody>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="lineValue" fill="#8884d8" stroke="#8884d8" />
              <Bar dataKey="barValue" barSize={20} fill="#413ea0" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
};

export default RechartsMixedChart;