import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardBody, CardHeader } from 'reactstrap';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Dataset 2',
      data: [28, 48, 40, 19, 86, 27, 90],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Bar Chart (Chart.js)',
    },
  },
};

const ChartJSBarChart = () => {
  return (
    <Card>
      <CardHeader>
        <h5>Bar Chart (Chart.js)</h5>
      </CardHeader>
      <CardBody>
        <div style={{ height: 300 }}>
          <Bar options={options} data={data} />
        </div>
      </CardBody>
    </Card>
  );
};

export default ChartJSBarChart;