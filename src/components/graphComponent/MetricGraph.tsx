import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from "chart.js";
import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export interface DataEntry {
  timestamp: string;
  value: string;
  Change_per_second: string;
}

export interface ItemId {
  _id: string;
  name_item: string;
  oid: string;
  type: string;
  unit: string;
}

export interface Item {
  item_id: ItemId;
  data: DataEntry[];
}

interface MetricGraphProps {
  item: Item;
}

const MetricGraph: React.FC<MetricGraphProps> = ({ item }) => {
  const [timeRange, setTimeRange] = useState<string>("2hr");
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [{
      label: '',
      data: [],
      borderColor: "rgb(75, 192, 192)",
      backgroundColor: "rgba(75, 192, 192, 0.5)",
      tension: 0.1,
      borderWidth: 2,
      pointRadius: 1,
      pointHoverRadius: 4,
      fill: false,
      showLine: true,
    }]
  });

  // Calculate fixed min and max for stable Y axis
  const getYAxisMinMax = (data: DataEntry[]) => {
    const Change_per_seconds = data.map(entry => Number(entry.Change_per_second));
    const min = Math.min(...Change_per_seconds);
    const max = Math.max(...Change_per_seconds);
    const padding = (max - min) * 0.1; // Add 10% padding
    return {
      min: Math.max(0, min - padding),
      max: max + padding
    };
  };

  const getTimeRangeSettings = (range: string) => {
    const now = new Date();
    const endTime = now.getTime();
    let startTime: number;
    let unit: "minute" | "hour" | "day";

    switch (range) {
      case "10min":
        startTime = endTime - 10 * 60 * 1000;
        unit = "minute";
        break;
      case "30min":
        startTime = endTime - 30 * 60 * 1000;
        unit = "minute";
        break;
      case "1hr":
        startTime = endTime - 60 * 60 * 1000;
        unit = "minute";
        break;
      case "6hr":
        startTime = endTime - 6 * 60 * 60 * 1000;
        unit = "hour";
        break;
      case "12hr":
        startTime = endTime - 12 * 60 * 60 * 1000;
        unit = "hour";
        break;
      case "24hr":
        startTime = endTime - 24 * 60 * 60 * 1000;
        unit = "hour";
        break;
      case "2hr":
      default:
        startTime = endTime - 2 * 60 * 60 * 1000;
        unit = "hour";
        break;
    }

    return { startTime, endTime, unit };
  };

  // Get Y-axis limits once when component mounts
  const yAxisLimits = React.useMemo(() => getYAxisMinMax(item.data), []);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${item.item_id.name_item} (${item.item_id.unit}/s)`, // Updated title to include /s
        padding: {
          top: 20  // This is equivalent to mt-5 in most cases
        },
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 12,
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${item.item_id.name_item}: ${context.parsed.y} ${item.item_id.unit}/s`; // Updated tooltip to include /s
          },
        },
      },
    },
    scales: {
      y: {
        min: yAxisLimits.min,
        max: yAxisLimits.max,
        beginAtZero: true,
        title: {
          display: true,
          text: `${item.item_id.unit}/s`, // Updated Y-axis label to include /s
        },
      },
      x: {
        type: "time",
        adapters: {
          date: {
            locale: enUS,
          },
        },
        time: {
          unit: getTimeRangeSettings(timeRange).unit,
          displayFormats: {
            minute: "HH:mm",
            hour: "HH:mm",
          },
          tooltipFormat: "HH:mm:ss",
        },
        title: {
          display: true,
          text: "Time",
        },
        min: getTimeRangeSettings(timeRange).startTime,
        max: getTimeRangeSettings(timeRange).endTime,
      },
    },
  };

  useEffect(() => {
    const timeSettings = getTimeRangeSettings(timeRange);
    const filteredData = item.data.filter((entry) => {
      const timestamp = new Date(entry.timestamp).getTime();
      return timestamp >= timeSettings.startTime && timestamp <= timeSettings.endTime;
    });

    const sortedData = filteredData.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const labels = sortedData.map((entry) => new Date(entry.timestamp).getTime());
    const Change_per_seconds = sortedData.map((entry) => Number(entry.Change_per_second));

    setChartData({
      labels,
      datasets: [
        {
          label: item.item_id.name_item,
          data: Change_per_seconds,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          tension: 0.1,
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 4,
          fill: false,
          showLine: true,
        },
      ],
    });
  }, [item, timeRange]);

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ 
        position: "absolute", 
        right: 0, 
        top: 0, 
        zIndex: 1,
        p: 2
      }}>
        <FormControl size="small">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{ 
              minWidth: 120,
              backgroundColor: "white",
              "& .MuiSelect-select": {
                fontSize: 14,
              
              }
            }}
          >
            <MenuItem value="10min">10 minutes</MenuItem>
            <MenuItem value="30min">30 minutes</MenuItem>
            <MenuItem value="1hr">1 hour</MenuItem>
            <MenuItem value="2hr">2 hours</MenuItem>
            <MenuItem value="6hr">6 hours</MenuItem>
            <MenuItem value="12hr">12 hours</MenuItem>
            <MenuItem value="24hr">1 day</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ 
        height: "400px", 
        pt: 6,
        "& canvas": {
          height: "400px !important"  // Force consistent height
        }
      }}>
        <Line options={options} data={chartData} />
      </Box>
    </Box>
  );
};

export default MetricGraph;