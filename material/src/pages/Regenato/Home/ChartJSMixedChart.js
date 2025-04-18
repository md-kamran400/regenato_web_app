import React from 'react';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Card, CardBody, CardHeader } from 'reactstrap';

ChartJS.register(...registerables);

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const data = {
  labels,
  datasets: [
    {
      type: 'line',
      label: 'Dataset 1',
      borderColor: 'rgb(255, 99, 132)',
      borderWidth: 2,
      fill: false,
      data: [65, 59, 80, 81, 56, 55, 40],
    },
    {
      type: 'bar',
      label: 'Dataset 2',
      backgroundColor: 'rgb(75, 192, 192)',
      data: [28, 48, 40, 19, 86, 27, 90],
      borderColor: 'white',
      borderWidth: 2,
    },
  ],
};

const ChartJSMixedChart = () => {
  return (
    <Card>
      <CardHeader>
        <h5>Mixed Chart (Chart.js)</h5>
      </CardHeader>
      <CardBody>
        <div style={{ height: 300 }}>
          <Chart type='bar' data={data} />
        </div>
      </CardBody>
    </Card>
  );
};

export default ChartJSMixedChart;