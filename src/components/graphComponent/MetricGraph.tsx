import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { DataEntry } from "../../interface/InterfaceCollection";
import { Item } from "../../interface/InterfaceCollection";
import { LineChart } from "@mui/x-charts/LineChart";

export interface Items {
  item_id: Item;
  avg_value: number;
  max_value: number;
  min_value: number;
  data: DataEntry[];
}

interface MetricGraphProps {
  item: Items;
  selectedLastTime: string;
  startTimeForScale: Date;
  endTimeForScale: Date;
  hideLegendLabel?: boolean;
  isSmall?: boolean; // Add new prop for size
}

const MetricGraph: React.FC<MetricGraphProps> = ({
  item,
  selectedLastTime,
  startTimeForScale,
  endTimeForScale,
  hideLegendLabel = false,
  isSmall = false, // Default to normal size
}) => {
  const [xAxis, setXAxis] = useState<Date[]>([]);
  const [yAxis, setYAxis] = useState<number[]>([]);

  useEffect(() => {
    const sortedData = item.data
      .slice()
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

    const DateXAxis = item.data.map((entry) => {
      const date = new Date(entry.timestamp);
      return date;
    });
    setXAxis(DateXAxis);
    const value = sortedData.map((entry) => Number(entry.value));
    setYAxis(value);
  }, [item]);

  const createConstantArray = (value: number, length: number) => {
    return Array(length).fill(value);
  };

  const formatYAxisLabel = (value: number | null) => {
    if (value === null) return "";
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  const formatDateTime = (date: Date) => {
    const dateStr = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${dateStr}\n${timeStr}`;
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: isSmall ? "220px" : "450px",
        mt: isSmall ? -1 : 0,
        pb: isSmall ? 5 : 0,
        pt: isSmall ? 1 : 2,
        px: isSmall ? 0 : 0,
        bgcolor: "#f5f5f5",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          "& canvas": {
            height: isSmall ? "250px !important" : "400px !important",
          },
        }}
      >
        <LineChart
          height={isSmall ? 250 : 400}
          series={[
            {
              data: yAxis,
              label: hideLegendLabel ? "" : item.item_id.item_name,
              curve: "linear",
              color: "#2196f3",
              area: true,
              showMark: false,
              valueFormatter: formatYAxisLabel,
              connectNulls: false,
            },
            {
              data: createConstantArray(item.max_value, yAxis.length),
              label: `Maximum(${selectedLastTime})`,
              curve: "linear",
              color: "#ff9800",
              showMark: false,
              valueFormatter: formatYAxisLabel,
              id: "max",
            },
            {
              data: createConstantArray(item.avg_value, yAxis.length),
              label: `Average(${selectedLastTime})`,
              curve: "linear",
              color: "#4caf50",
              showMark: false,
              valueFormatter: formatYAxisLabel,
              id: "avg",
            },
            {
              data: createConstantArray(item.min_value, yAxis.length),
              label: `Minimum(${selectedLastTime})`,
              curve: "linear",
              color: "#f44336",
              showMark: false,
              valueFormatter: formatYAxisLabel,
              id: "min",
            },
          ]}
          xAxis={[
            {
              scaleType: "time",
              data: xAxis,
              label: "Date\nTime",
              min: startTimeForScale.getTime(),
              max: endTimeForScale.getTime(),
              labelStyle: {
                fontSize: isSmall ? 10 : 12,
                fill: "#666",
              },
              tickLabelStyle: {
                fontSize: isSmall ? 8 : 10,
                fill: "#666",
              },
              valueFormatter: (value) => formatDateTime(new Date(value)),
              tickNumber: isSmall ? 5 : 7,
            },
          ]}
          yAxis={[
            {
              label: `${item.item_id.unit}/s`,
              labelStyle: {
                fontSize: isSmall ? 10 : 12,
                fill: "#666",
              },
              tickLabelStyle: {
                fontSize: isSmall ? 8 : 10,
                fill: "#666",
              },
              valueFormatter: formatYAxisLabel,
              tickNumber: isSmall ? 5 : 7,
            },
          ]}
          sx={{
            "& .MuiLineElement-root": {
              strokeWidth: isSmall ? 1.5 : 2,
            },
            "& .MuiMarkElement-root": {
              stroke: "#fff",
              scale: isSmall ? "0.5" : "0.6",
              fill: "#2196f3",
            },
            " .MuiLineElement-series-max": {
              strokeDasharray: "5 5",
              strokeWidth: isSmall ? 0.5 : 1,
            },
            " .MuiLineElement-series-avg": {
              strokeWidth: isSmall ? 0.5 : 1,
              strokeDasharray: "5 5",
            },
            " .MuiLineElement-series-min": {
              strokeWidth: isSmall ? 0.5 : 1,
              strokeDasharray: "5 5",
            },
          }}
          slotProps={{
            legend: {
              hidden: hideLegendLabel,
              itemMarkWidth: isSmall ? 8 : 10,
              itemMarkHeight: isSmall ? 8 : 10,
              markGap: isSmall ? 3 : 5,
              itemGap: isSmall ? 8 : 10,
              labelStyle: {
                fontSize: isSmall ? 8 : 15,
              },
            },
          }}
          grid={{ vertical: true, horizontal: true }}
        />
      </Box>
    </Box>
  );
};

export default MetricGraph;
