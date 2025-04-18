import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const BigChartJS = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Planned Orders',
            data: [30, 25, 40, 50, 45, 60, 55],
            backgroundColor: '#8884d8',
            stack: 'orders',
            yAxisID: 'y',
          },
          {
            label: 'In Progress Orders',
            data: [20, 35, 30, 20, 25, 30, 40],
            backgroundColor: '#82ca9d',
            stack: 'orders',
            yAxisID: 'y',
          },
          {
            label: 'Completed Orders',
            data: [10, 15, 20, 25, 30, 20, 15],
            backgroundColor: '#ffc658',
            stack: 'orders',
            yAxisID: 'y',
          },
          {
            label: 'Revenue ($)',
            data: [100, 120, 90, 130, 110, 150, 140],
            type: 'line',
            borderColor: '#ff7300',
            backgroundColor: '#ff7300',
            yAxisID: 'y1',
            tension: 0.4,
          },
          {
            label: 'Working Hours',
            data: [850, 950, 780, 1020, 980, 1100, 1070],
            type: 'line',
            fill: true,
            borderColor: '#36a2eb',
            backgroundColor: 'rgba(54,162,235,0.2)',
            yAxisID: 'y1',
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        stacked: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Production Orders',
            },
            stacked: true,
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'Revenue ($) & Hours',
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, []);

  return <canvas ref={chartRef} />;
};

export default BigChartJS;
