import React, { useState, useEffect } from "react";
import "./calendar.css";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [holidays, setHolidays] = useState([]);

  const weekArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthArray = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    fetch("http://localhost:4040/api/eventScheduler/events")
      .then((response) => response.json())
      .then((data) => setHolidays(data))
      .catch((error) => console.error("Error fetching holidays:", error));
  }, []);
  console.log(holidays);

  // const generateCalendarDays = (date) => {
  //   const year = date.getFullYear();
  //   const month = date.getMonth();
  //   const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  //   const firstDayOfWeek = new Date(year, month, 1).getDay();
  //   const days = [];

  //   for (let i = 0; i < firstDayOfWeek; i++) {
  //     days.push(<li key={`empty-${i}`} className="calendar-day"></li>);
  //   }

  //   for (let day = 1; day <= totalDaysInMonth; day++) {
  //     const isToday =
  //       day === currentDate.getDate() &&
  //       month === currentDate.getMonth() &&
  //       year === currentDate.getFullYear();
  //     const isSunday = new Date(year, month, day).getDay() === 0;

  //     // Check if the day is a holiday
  //     const holidayEvents = holidays.filter((holiday) => {
  //       const holidayDate = new Date(holiday.startDate);
  //       return (
  //         holidayDate.getDate() === day &&
  //         holidayDate.getMonth() === month &&
  //         holidayDate.getFullYear() === year
  //       );
  //     });

  //     const isHoliday = holidayEvents.length > 0;

  //     days.push(
  //       <li
  //         key={`day-${day}`}
  //         className={`calendar-day ${isToday ? "calendar-day-active" : ""} ${
  //           isSunday ? "calendar-day-sunday" : ""
  //         } ${isHoliday ? "calendar-day-holiday" : ""}`}
  //         title={
  //           isHoliday
  //             ? holidayEvents.map((event) => event.eventName).join(", ")
  //             : ""
  //         }
  //       >
  //         {day}
  //       </li>
  //     );
  //   }

  //   return days;
  // };
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<li key={`empty-${i}`} className="calendar-day"></li>);
    }

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const isToday =
        day === currentDate.getDate() &&
        month === currentDate.getMonth() &&
        year === currentDate.getFullYear();
      const isSunday = new Date(year, month, day).getDay() === 0;

      // Check if the current day is within any holiday range
      const holidayEvents = holidays.filter((holiday) => {
        let startDate = new Date(holiday.startDate);
        let endDate = new Date(holiday.endDate);

        // Adjust start date by adding 1 day
        startDate.setDate(startDate.getDate()-1);

        return (
          new Date(year, month, day) >= startDate &&
          new Date(year, month, day) <= endDate
        );
      });

      const isHoliday = holidayEvents.length > 0;

      days.push(
        <li
          key={`day-${day}`}
          className={`calendar-day ${isToday ? "calendar-day-active" : ""} 
            ${isSunday ? "calendar-day-sunday" : ""} 
            ${isHoliday ? "calendar-day-holiday" : ""}`}
          title={
            isHoliday
              ? holidayEvents.map((event) => event.eventName).join(", ")
              : ""
          }
        >
          {day}
        </li>
      );
    }

    return days;
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    setSelectedMonth(newMonth);
    setCurrentDate(new Date(currentDate.getFullYear(), newMonth, 1));
  };

  const handleArrowClick = (direction) => {
    let newMonth = selectedMonth + (direction === "left" ? -1 : 1);
    let newYear = currentDate.getFullYear();

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setSelectedMonth(newMonth);
    setCurrentDate(new Date(newYear, newMonth, 1));
  };

  return (
    <div className="calendar-container">
      <div className="calendar-month-arrow-container">
        <div className="calendar-month-year-container">
          <select
            className="calendar-months"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {monthArray.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div className="calendar-arrow-container">
          <button
            className="calendar-left-arrow"
            onClick={() => handleArrowClick("left")}
          >
            <FaAngleLeft />
          </button>
          <span style={{ margin: "0 5px" }}></span>
          <button
            className="calendar-right-arrow"
            onClick={() => handleArrowClick("right")}
          >
            <FaAngleRight />
          </button>
        </div>
      </div>
      <ul className="calendar-week">
        {weekArray.map((day) => (
          <li key={day} className="calendar-week-day">
            {day}
          </li>
        ))}
      </ul>
      <ul className="calendar-days">{generateCalendarDays(currentDate)}</ul>
    </div>
  );
};

export default Calendar;
