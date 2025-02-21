import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import MetricGraph from "../graphComponent/MetricGraph";
import { Item } from "../Modals/AddTrigger";
import { DataEntry } from "../../interface/InterfaceCollection";

interface GraphInDashboardProps {
  graphSelection?: {
    graphName: string;
  };
}

interface GraphData {
  item_id: Item;
  avg_value: number;
  max_value: number;
  min_value: number;
  data: DataEntry[];
  hostname: string;
}

const GraphInDashboard: React.FC<GraphInDashboardProps> = ({
  graphSelection,
}) => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Add state for tracking the time range
  const timeRange = "15min";
  const [startTime, setStartTime] = useState<Date>(
    new Date(Date.now() - 16 * 60000)
  );
  const [endTime, setEndTime] = useState<Date>(new Date());

  useEffect(() => {
    const fetchGraphData = async () => {
      if (!graphSelection?.graphName) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/host`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch hosts");

        const result = await res.json();

        if (
          result.status === "success" &&
          Array.isArray(result.data) &&
          result.data.length > 0
        ) {
          const host = result.data[0];

          const now = new Date();
          const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60000);
          setStartTime(new Date(now.getTime() - 16 * 60000));
          setEndTime(now);

          const dataUrl = `${
            import.meta.env.VITE_API_URL
          }/data/between?startTime=${fifteenMinutesAgo.toISOString()}&endTime=${now.toISOString()}&host_id=${
            host._id
          }`;

          const dataRes = await fetch(dataUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (!dataRes.ok) throw new Error("Failed to fetch graph data");

          const dataResult = await dataRes.json();

          if (
            dataResult.status === "success" &&
            Array.isArray(dataResult.data) &&
            dataResult.data.length > 0
          ) {
            const hostname = dataResult.data[0]._id.hostname;
            const selectedGraph = dataResult.data[0].items.find(
              (item: GraphData) =>
                item.item_id.item_name === graphSelection.graphName
            );

            if (selectedGraph) {
              setGraphData({
                item_id: selectedGraph.item_id,
                data: selectedGraph.data,
                avg_value: selectedGraph.avg_value || 0,
                max_value: selectedGraph.max_value || 0,
                min_value: selectedGraph.min_value || 0,
                hostname: hostname,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching graph data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();
    const interval = setInterval(fetchGraphData, 60000);
    return () => clearInterval(interval);
  }, [graphSelection?.graphName]);

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading graph...</Typography>
      </Box>
    );
  }

  if (!graphData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No graph data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: "100%" }}>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: "bold" }}>
        {graphData.hostname}
      </Typography>
      <Box sx={{ height: "calc(100% - 52px)" }}>
        <MetricGraph
          item={graphData}
          selectedLastTime={timeRange}
          startTimeForScale={startTime}
          endTimeForScale={endTime}
          isSmall={true}
        />
      </Box>
    </Box>
  );
};

export default GraphInDashboard;
