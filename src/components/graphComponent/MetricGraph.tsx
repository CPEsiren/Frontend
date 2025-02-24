import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { DataEntry } from "../../interface/InterfaceCollection";
import { Item } from "../../interface/InterfaceCollection";
import { LineChart } from "@mui/x-charts/LineChart";

export interface Items {
  item_id: Item;
  avg_value: number[];
  max_value: number[];
  min_value: number[];
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
  const [maxValue, setMaxValue] = useState<number[]>([]);
  const [minValue, setMinValue] = useState<number[]>([]);
  const [avgValue, setAvgValue] = useState<number[]>([]);

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
    const value = sortedData
      .map((entry) => {
        const numValue = Number(entry.value);
        return isNaN(numValue) ? null : numValue;
      })
      .filter((numValue) => numValue !== null) as number[];
    setYAxis(value);
    setMaxValue(item.max_value);
    setMinValue(item.min_value);
    setAvgValue(item.avg_value);
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
        height: isSmall ? "245px" : "455px",
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
          p: 2,
        }}
      >
        <LineChart
          height={isSmall ? 260 : 420}
          margin={{
            left: isSmall ? 50 : 55, // Increased left margin for y-axis label
            bottom: isSmall ? 55 : 60, // Increased bottom margin for x-axis label
          }}
          series={[
            ...(yAxis.length === 0
              ? [
                  {
                    data: maxValue,
                    label: `Maximum(${selectedLastTime})`,
                    curve: "linear" as const,
                    color: "#ff9800",
                    showMark: false,
                    valueFormatter: formatYAxisLabel,
                    id: "max",
                  },
                  {
                    data: avgValue,
                    label: `Average(${selectedLastTime})`,
                    curve: "linear" as const,
                    color: "#4caf50",
                    showMark: false,
                    valueFormatter: formatYAxisLabel,
                    id: "avg",
                  },
                  {
                    data: minValue,
                    label: `Minimum(${selectedLastTime})`,
                    curve: "linear" as const,
                    color: "#f44336",
                    showMark: false,
                    valueFormatter: formatYAxisLabel,
                    id: "min",
                  },
                ]
              : [
                  {
                    data: yAxis,
                    label: hideLegendLabel ? "" : item.item_id.item_name,
                    curve: "linear" as const,
                    color: "#2196f3",
                    area: true,
                    showMark: false,
                    valueFormatter: formatYAxisLabel,
                    connectNulls: false,
                  },
                  {
                    data: createConstantArray(maxValue[0], xAxis.length),
                    label: `Maximum(${selectedLastTime})`,
                    curve: "linear" as const,
                    color: "#ff9800",
                    showMark: false,
                    valueFormatter: formatYAxisLabel,
                    id: "max",
                  },
                  {
                    data: createConstantArray(avgValue[0], xAxis.length),
                    label: `Average(${selectedLastTime})`,
                    curve: "linear" as const,
                    color: "#4caf50",
                    showMark: false,
                    valueFormatter: formatYAxisLabel,
                    id: "avg",
                  },
                  {
                    data: createConstantArray(minValue[0], xAxis.length),
                    label: `Minimum(${selectedLastTime})`,
                    curve: "linear" as const,
                    color: "#f44336",
                    showMark: false,
                    valueFormatter: formatYAxisLabel,
                    id: "min",
                  },
                ]),
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
                lineHeight: isSmall ? 1 : 1.2,
                fill: "#666",
                transform: `translateY(${isSmall ? 3 : 7}px)`, // Move label down
              },
              tickLabelStyle: {
                fontSize: isSmall ? 8 : 10,
                fill: "#666",
                transform: `translateY(${isSmall ? 1 : 2}px)`, // Move label down
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
                transform: `translateX(-${isSmall ? 11 : 14}px)`, // Move label left
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
              strokeDasharray: yAxis.length === 0 ? "none" : "5 5",
              strokeWidth: isSmall ? 0.5 : 1,
            },
            " .MuiLineElement-series-avg": {
              strokeWidth: isSmall ? 0.5 : 1,
              strokeDasharray: yAxis.length === 0 ? "none" : "5 5",
            },
            " .MuiLineElement-series-min": {
              strokeWidth: isSmall ? 0.5 : 1,
              strokeDasharray: yAxis.length === 0 ? "none" : "5 5",
            },
            // Add styles for axis areas
            "& .MuiChartsAxis-root": {
              "& .MuiChartsAxis-line": {
                stroke: "#666",
                strokeWidth: 1,
              },
              "& .MuiChartsAxis-label": {
                fill: "#666",
                fontWeight: "medium",
              },
              "& .MuiChartsAxis-tick": {
                stroke: "#666",
              },
              "& .MuiChartsAxis-tickLabel": {
                fill: "#666",
              },
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
