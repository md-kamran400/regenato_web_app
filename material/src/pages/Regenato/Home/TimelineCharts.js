import React from "react";
import ReactApexChart from "react-apexcharts";
import * as moment from "moment";

import getChartColorsArray from "../../../Components/Common/ChartsDynamicColor";
import ActiveProjects from "./ActiveProjects";

const Advanced = ({ dataColors }) => {
  var chartTimelineAdvancedColors = getChartColorsArray(dataColors);
  const series = [
    {
      name: "Production Order 1",
      data: [
        {
          x: "VMC Imported",
          y: [
            new Date("2019-03-05").getTime(),
            new Date("2019-03-08").getTime(),
          ],
        },
        {
          x: "VMC Local",
          y: [
            new Date("2019-03-02").getTime(),
            new Date("2019-03-05").getTime(),
          ],
        },
        {
          x: "Milling manual",
          y: [
            new Date("2019-03-05").getTime(),
            new Date("2019-03-07").getTime(),
          ],
        },
        {
          x: "CNC Lathe",
          y: [
            new Date("2019-03-03").getTime(),
            new Date("2019-03-09").getTime(),
          ],
        },
        {
          x: "Wire Cut Imported",
          y: [
            new Date("2019-03-08").getTime(),
            new Date("2019-03-11").getTime(),
          ],
        },
        {
          x: "Drill/Tap",
          y: [
            new Date("2019-03-11").getTime(),
            new Date("2019-03-16").getTime(),
          ],
        },
        {
          x: "Black Oxide",
          y: [
            new Date("2019-03-01").getTime(),
            new Date("2019-03-03").getTime(),
          ],
        },
      ],
    },
    {
      name: "Production Order 3",
      data: [
        {
          x: "Black Oxide",
          y: [
            new Date("2019-03-02").getTime(),
            new Date("2019-03-05").getTime(),
          ],
        },
        {
          x: "Drill/Tap",
          y: [
            new Date("2019-03-06").getTime(),
            new Date("2019-03-16").getTime(),
          ],
        },
        {
          x: "Wire Cut Imported",
          y: [
            new Date("2019-03-03").getTime(),
            new Date("2019-03-07").getTime(),
          ],
        },
        {
          x: "Milling manual",
          y: [
            new Date("2019-03-20").getTime(),
            new Date("2019-03-22").getTime(),
          ],
        },
        {
          x: "VMC Imported",
          y: [
            new Date("2019-03-10").getTime(),
            new Date("2019-03-16").getTime(),
          ],
        },
      ],
    },
    {
      name: "Production Order 3",
      data: [
        {
          x: "Wire Cut Imported",
          y: [
            new Date("2019-03-10").getTime(),
            new Date("2019-03-17").getTime(),
          ],
        },
        {
          x: "Drill/Tap",
          y: [
            new Date("2019-03-05").getTime(),
            new Date("2019-03-09").getTime(),
          ],
        },
      ],
    },
  ];

  const options = {
    chart: {
      toolbar: {
        show: !1,
      },
    },
    plotOptions: {
      bar: {
        horizontal: !0,
        barHeight: "80%",
      },
    },
    xaxis: {
      type: "datetime",
    },
    stroke: {
      width: 1,
    },
    fill: {
      type: "solid",
      opacity: 0.6,
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
    colors: chartTimelineAdvancedColors,
  };

  return (
    <React.Fragment>
      <ReactApexChart
        dir="ltr"
        className="apex-charts"
        options={options}
        series={series}
        type="rangeBar"
        height={350}
      />
      {/* <ActiveProjects/> */}
    </React.Fragment>
  );
};

export { Advanced };
