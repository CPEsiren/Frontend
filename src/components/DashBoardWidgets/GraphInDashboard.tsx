import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import MetricGraph, { Items } from "../graphComponent/MetricGraph";

interface GraphInDashboardProps {
  graphSelection?: {
    itemId: string;
    hostId: string;
  };
}

const GraphInDashboard: React.FC<GraphInDashboardProps> = ({
  graphSelection,
}) => {
  const [graphData, setGraphData] = useState<Items | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rangeTime, setRangeTime] = useState("15 m");
  const [hostname, setHostname] = useState("");

  const [startTime, setStartTime] = useState<Date>(
    new Date(Date.now() - 16 * 60000)
  );
  const [startTimeForScale, setStartTimeForScale] = useState<Date>(
    new Date(Date.now() - 15 * 60000)
  );
  const [endTimeForScale, setEndTimeForScale] = useState<Date>(new Date());

  useEffect(() => {
    const fetchGraphData = async () => {
      if (!graphSelection?.itemId || !graphSelection?.hostId) {
        setIsLoading(false);
        return;
      }

      try {
        const now = new Date();
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60000);
        const forStartTime = new Date(now.getTime() - 16 * 60000);

        setStartTime(forStartTime);
        setStartTimeForScale(fifteenMinutesAgo);
        setEndTimeForScale(now);

        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/data/between?startTime=${forStartTime.toISOString()}&endTime=${now.toISOString()}&host_id=${
            graphSelection.hostId
          }`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        // console.log(result);

        if (
          result.status === "success" &&
          result.data &&
          result.data.length > 0
        ) {
          const host = result.data[0];
          setHostname(host._id.hostname);
          const selectedItemData = host.items.find(
            (item: any) => item.item_id._id === graphSelection.itemId
          );

          if (
            selectedItemData &&
            selectedItemData.data &&
            selectedItemData.data.length > 0
          ) {
            const transformedData: Items = {
              item_id: {
                _id: selectedItemData.item_id._id,
                oid: selectedItemData.item_id.oid,
                item_name: selectedItemData.item_id.item_name,
                type: selectedItemData.item_id.type,
                unit: selectedItemData.item_id.unit,
                interval: selectedItemData.item_id.interval,
              },
              data: selectedItemData.data.map((entry: any) => ({
                timestamp: entry.timestamp,
                value: Number(entry.value),
              })),
              avg_value: selectedItemData.avg_value,
              max_value: selectedItemData.max_value,
              min_value: selectedItemData.min_value,
            };

            setGraphData(transformedData);
          } else {
            setGraphData(null);
          }
        } else {
          setGraphData(null);
        }
      } catch (error) {
        console.error("Error fetching graph data:", error);
        setGraphData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();

    const interval = setInterval(fetchGraphData, 60000);
    return () => clearInterval(interval);
  }, [graphSelection?.itemId, graphSelection?.hostId]);

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading graph...</Typography>
      </Box>
    );
  }

  if (!graphData || !graphData.data || graphData.data.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No graph data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: "100%" }}>
      <Typography
        variant="subtitle2"
        sx={{ mb: 0, fontWeight: "bold", color: "#db5100" }}
      >
        {graphData.item_id.item_name}&nbsp;
      </Typography>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: "bold" }}>
        on {hostname}
      </Typography>
      <Box sx={{ height: "calc(100% - 52px)" }}>
        <MetricGraph
          item={graphData}
          selectedLastTime={rangeTime}
          startTimeForScale={startTimeForScale}
          endTimeForScale={endTimeForScale}
          isSmall={true}
          hideLegendLabel={false}
        />
      </Box>
    </Box>
  );
};

export default GraphInDashboard;
