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
  hideLegendLabel?: boolean;
  isSmall?: boolean; // Add new prop for size
}

const MetricGraph: React.FC<MetricGraphProps> = ({
  item,
  hideLegendLabel = false,
  isSmall = false, // Default to normal size
}) => {
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
            },
          ]}
          xAxis={[
            {
              scaleType: "point",
              data: xAxis,
              label: "Date\nTime",
              labelStyle: {
                fontSize: isSmall ? 10 : 12,
                fill: "#666",
              },
              tickLabelStyle: {
                fontSize: isSmall ? 8 : 10,
                fill: "#666",
              },
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
        />
      </Box>
    </Box>
  );
};

export default MetricGraph;
