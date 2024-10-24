import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import * as moment from 'moment';
import getChartColorsArray from '../../../Components/Common/ChartsDynamicColor';

const AdvanceTimeLine = ({ dataColors }) => {
  const [seriesData, setSeriesData] = useState([]);

  // Function to process data and create series
  const createSeries = (partsData, scalingFactor, baseDate) => {
    const series = [];

    partsData.forEach((part) => {
      let currentTime = baseDate;

      const data = [];

      for (const [step, quantity] of Object.entries(part.steps)) {
        const durationDays = quantity / scalingFactor;
        const start = currentTime;
        const end = start + durationDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

        data.push({
          x: step,
          y: [start, end],
        });

        currentTime = end; // Update current time for the next step
      }

      series.push({
        name: part.partName,
        data: data,
      });
    });

    return series;
  };

  useEffect(() => {
    // Fetch chart colors dynamically
    const chartTimelineAdvancedColors = getChartColorsArray(dataColors);

    // Define the scaling factor (100 units = 1 day)
    const scalingFactor = 100;

    // Define the base date
    const baseDate = moment("2024-03-01").valueOf(); // Convert to timestamp

    // Define the parts data
    const partsData = [
      {
        partName: "Project 1",
        steps: {
          "VMC Local": 500.0,
          "Grinding Final": 500.0,
          "Wire Cut Rough": 400.0,
          "Grinding Blank/Rough": 300.0,
        },
      },
      {
        partName: "Project 2",
        steps: {
          "VMC Local": 1000.0,
          "Grinding Final": 1125.0,
          "Grinding Blank/Rough": 375.0,
        },
      },
      {
        partName: "Project 3",
        steps: {
          "Milling Manual": 250.0,
          "Grinding Final": 250.0,
        },
      },
      {
        partName: "Project 4",
        steps: {
          "Milling Manual": 60.0,
          "Grinding Final": 375.0,
          "Grinding Blank/Rough": 125.0,
        },
      },
    ];

    // Process data and set series
    const processedSeriesData = createSeries(partsData, scalingFactor, baseDate);
    setSeriesData(processedSeriesData);
  }, [dataColors]);

  const options = {
    chart: {
      height: 500,
      type: 'rangeBar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '80%',
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'dd MMM',
      },
    },
    stroke: {
      width: 1,
    },
    fill: {
      type: 'solid',
      opacity: 0.6,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: getChartColorsArray(dataColors), // Use dynamic colors
    tooltip: {
      x: {
        format: 'dd MMM yyyy',
      },
    },
  };

  return (
    <div>
      <ReactApexChart
        dir="ltr"
        className="apex-charts"
        options={options}
        series={seriesData}
        type="rangeBar"
        height={500}
      />
    </div>
  );
};

export default AdvanceTimeLine;
