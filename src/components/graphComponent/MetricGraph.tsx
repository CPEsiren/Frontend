import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { DataEntry } from "../../interface/InterfaceCollection";
import { Item } from "../../interface/InterfaceCollection";
import { LineChart } from "@mui/x-charts/LineChart";

export interface Items {
  item_id: Item;
  data: DataEntry[];
}

interface MetricGraphProps {
  item: Items;
}

const MetricGraph: React.FC<MetricGraphProps> = ({ item }) => {
  const [xAxis, setXAxis] = useState<string[]>([]);
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
      // Set timezone to ICT (Indochina Time, UTC+7)
      const formattedDate = date.toISOString().split("T")[0];
      const formattedTime = date.toTimeString().split(" ")[0].slice(0, 8);
      return `${formattedDate}\n${formattedTime}`;
    });
    setXAxis(DateXAxis);
    const Change_per_seconds = sortedData.map((entry) =>
      Number(entry.Change_per_second)
    );
    setYAxis(Change_per_seconds);
  }, [item]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "450px",
        p: 2,
        bgcolor: "#f5f5f5",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          "& canvas": {
            height: "400px !important", // Force consistent height
          },
        }}
      >
        <LineChart
          height={400}
          series={[
            {
              data: yAxis,
              label: item.item_id.item_name,
              curve: "linear",
              color: "#2196f3",
            },
          ]}
          xAxis={[
            {
              scaleType: "point",
              data: xAxis,
              label: "Date\nTime",
              labelStyle: { fontSize: 12, fill: "#666" },
              tickLabelStyle: { fontSize: 10, fill: "#666" },
            },
          ]}
          yAxis={[
            {
              label: `${item.item_id.unit}/s`,
              labelStyle: { fontSize: 12, fill: "#666" },
              tickLabelStyle: { fontSize: 10, fill: "#666" },
            },
          ]}
          sx={{
            "& .MuiLineElement-root": {
              strokeWidth: 2,
            },
            "& .MuiMarkElement-root": {
              stroke: "#fff",
              scale: "0.6",
              fill: "#2196f3",
            },
          }}
          slotProps={{
            legend: {
              hidden: false,
              itemMarkWidth: 10,
              itemMarkHeight: 10,
              markGap: 5,
              itemGap: 10,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default MetricGraph;
