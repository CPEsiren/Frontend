import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import MetricGraph from "../graphComponent/MetricGraph";
import { hostname } from "os";

interface GraphInDashboardProps {
  graphSelection?: {
    graphName: string;
  };
}

const GraphInDashboard: React.FC<GraphInDashboardProps> = ({
  graphSelection,
}) => {
  const [graphData, setGraphData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGraphData = async () => {
      if (!graphSelection?.graphName) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/host", {
          method: "GET",
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

          const dataUrl = `http://127.0.0.1:3000/data/between?startTime=${fifteenMinutesAgo.toISOString()}&endTime=${now.toISOString()}&host_id=${
            host._id
          }`;

          const dataRes = await fetch(dataUrl);
          if (!dataRes.ok) throw new Error("Failed to fetch graph data");

          const dataResult = await dataRes.json();

          if (
            dataResult.status === "success" &&
            Array.isArray(dataResult.data) &&
            dataResult.data.length > 0
          ) {
            const hostname = dataResult.data[0]._id.hostname; // ดึง hostname จาก _id
            const selectedGraph = dataResult.data[0].items.find(
              (item: any) => item.item_id.item_name === graphSelection.graphName
            );
          
            if (selectedGraph) {
              setGraphData({
                item_id: selectedGraph.item_id,
                data: selectedGraph.data,
                hostname: hostname, // ใช้ hostname ที่ถูกต้อง
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
          // hideLegendLabel={true}
          isSmall={true} // Set to small size for dashboard
        />
      </Box>
    </Box>
  );
};

export default GraphInDashboard;
