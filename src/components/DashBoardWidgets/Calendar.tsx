import React, { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

// Types for our components
interface DayCellProps {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const daysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date: Date): boolean => {
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

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
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

  // DayCell component
  const DayCell: React.FC<DayCellProps> = ({
    date,
    isToday,
    isCurrentMonth,
  }) => {
    return (
      <Box
        sx={{
          p: 0,
          borderRadius: "50%",
          backgroundColor: isToday
            ? isCurrentMonth
              ? "blue"
              : "rgba(0, 64, 255, 0.37)"
            : "transparent",
          color: !isCurrentMonth
            ? isToday
              ? "white"
              : "text.disabled"
            : isToday
            ? "white"
            : "text.primary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "20px",
          width: "20px",
          margin: "auto",
          fontSize: "0.65rem",
          fontWeight: isToday ? (isCurrentMonth ? "bold" : "normal") : "normal",
        }}
      >
        {date.getDate()}
      </Box>
    );
  };

  // Split the date into month and year for different styling
  const month = currentDate.toLocaleDateString("en-US", { month: "short" });
  const year = currentDate.getFullYear();

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 1.8,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 0.25,
          mb: 0.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.75rem",
            width: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 0.5,
              bgcolor: "rgba(0, 4, 255, 0.12)",
              px: 1,
              py: 0.3,
              borderRadius: 2,
            }}
          >
            <Typography
              sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#535353" }}
            >
              {month}
            </Typography>
            <Typography
              sx={{ fontSize: "0.9rem", fontWeight: 400, color: "#535353" }}
            >
              {year}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex" }}>
          <IconButton
            size="small"
            onClick={handlePrevMonth}
            sx={{
              p: 0.25,
              bgcolor: "rgba(0, 4, 255, 0.12)",
              mr: 1,
              "&:hover": {
                bgcolor: "rgba(0, 4, 255, 0.12)",
              },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleNextMonth}
            sx={{
              p: 0.25,
              bgcolor: "rgba(0, 4, 255, 0.12)",
              "&:hover": {
                bgcolor: "rgba(0, 4, 255, 0.12)",
              },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0.3,
          textAlign: "center",
        }}
      >
        {weekDays.map((day) => (
          <Typography
            key={day}
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              fontSize: "0.8rem",
              my: 1,
            }}
          >
            {day}
          </Typography>
        ))}
        {generateCalendarDays().map(({ date, isCurrentMonth }, index) => (
          <DayCell
            key={index}
            date={date}
            isToday={isToday(date)}
            isCurrentMonth={isCurrentMonth}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Calendar;
