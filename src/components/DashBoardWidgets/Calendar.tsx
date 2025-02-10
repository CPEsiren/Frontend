import React, { useState } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

// Types for our custom components
interface DayCellProps {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
}

// Styled components moved to component-specific sx props
const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleNowClick = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    // Previous month days
    const prevMonthDays = daysInMonth(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        prevMonthDays - i
      );
      days.push({ date, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i
      );
      days.push({ date, isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        i
      );
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Separate DayCell component
  const DayCell: React.FC<DayCellProps> = ({
    date,
    isToday,
    isSelected,
    isCurrentMonth,
    onClick,
  }) => {
    return (
      <Box
        onClick={onClick}
        sx={{
          p: 0,
          borderRadius: "50%",
          cursor: "pointer",
          backgroundColor: isSelected && !isToday
            ? "primary.main"
            : isToday
            ? "blue"
            : "transparent",
          color: isSelected && !isToday
            ? "primary.contrastText"
            : isToday
            ? "white"
            : !isCurrentMonth
            ? "text.disabled"
            : "text.primary",
          "&:hover": {
            backgroundColor: !isToday ? "#E2E3E6" : "blue",
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "20px",
          width: "20px",
          margin: "auto",
          fontSize: "0.65rem",
          fontWeight: isToday ? "bold" : "normal",
        }}
      >
        {date.getDate()}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 0.25,
          mb: 0.5,
        }}
      >
        <IconButton size="small" onClick={handlePrevMonth} sx={{ p: 0.25 }}>
          <ChevronLeftIcon sx={{ fontSize: "1rem" }} />
        </IconButton>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.75rem",
          }}
        >
          <Typography
            sx={{ fontSize: "0.85rem", fontWeight: "bold", color: "#535353" }}
          >
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleNowClick}
            sx={{
              ml: 0.25,
              color: "blue",
              padding: "0px 4px",
              minWidth: "30px",
              height: "20px",
              fontSize: "0.65rem",
              lineHeight: 1,
              "& .MuiButton-startIcon": {
                margin: 0,
              },
            }}
          >
            Now
          </Button>
        </Box>
        <IconButton size="small" onClick={handleNextMonth} sx={{ p: 0.25 }}>
          <ChevronRightIcon sx={{ fontSize: "1rem" }} />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0.25,
          textAlign: "center",
        }}
      >
        {weekDays.map((day) => (
          <Typography
            key={day}
            sx={{
              fontWeight: "bold",
              color: "text.secondary",
              fontSize: "0.65rem",
            }}
          >
            {day.slice(0, 1)}
          </Typography>
        ))}
        {generateCalendarDays().map(({ date, isCurrentMonth }, index) => (
          <DayCell
            key={index}
            date={date}
            isToday={isToday(date)}
            isSelected={date.getTime() === selectedDate.getTime()}
            isCurrentMonth={isCurrentMonth}
            onClick={() => handleDateClick(date)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Calendar;
