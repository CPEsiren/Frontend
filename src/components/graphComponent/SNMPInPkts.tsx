// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   FormControl,
//   Select,
//   MenuItem,
//   Typography,
//   Paper,
// } from "@mui/material";
// import {
//   Chart as ChartJS,
//   TimeScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
//   ChartData,
//   ChartOptions,
// } from "chart.js";
// import "chartjs-adapter-date-fns";
// import { Line } from "react-chartjs-2";
// import { enUS } from "date-fns/locale";

// ChartJS.register(
//   TimeScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// interface DataEntry {
//   timestamp: string;
//   value: string;
// }

// interface ItemId {
//   _id: string;
//   item_name: string;
//   oid: string;
//   type: string;
//   unit: string;
// }

// interface Item {
//   item_id: ItemId;
//   data: DataEntry[];
// }

// interface Host {
//   _id: {
//     _id: string;
//     hostname: string;
//   };
//   items: Item[];
// }

// interface ApiResponse {
//   status: string;
//   message: string;
//   data: Host[];
// }

// interface SNMPInPktsProps {
//   hostId: string;
// }

// const SNMPInPkts: React.FC<SNMPInPktsProps> = ({ hostId }) => {
//   const [chartData, setChartData] = useState<ChartData<"line">>({
//     labels: [],
//     datasets: [],
//   });
//   const [error, setError] = useState<string | null>(null);
//   const [hasData, setHasData] = useState<boolean>(false);
//   const [timeRange, setTimeRange] = useState<string>("2hr"); // Default to 2 hours

//   const getTimeRangeSettings = (range: string) => {
//     const now = new Date();
//     const endTime = now.getTime();
//     let startTime: number;
//     let unit: "minute" | "hour" | "day" | "month" | "year";

//     switch (range) {
//       case "10min":
//         startTime = endTime - 10 * 60 * 1000;
//         unit = "minute";
//         break;
//       case "30min":
//         startTime = endTime - 30 * 60 * 1000;
//         unit = "minute";
//         break;
//       case "1hr":
//         startTime = endTime - 60 * 60 * 1000;
//         unit = "minute";
//         break;
//       case "6hr":
//         startTime = endTime - 6 * 60 * 60 * 1000;
//         unit = "hour";
//         break;
//       case "12hr":
//         startTime = endTime - 12 * 60 * 60 * 1000;
//         unit = "hour";
//         break;
//       case "24hr":
//         startTime = endTime - 24 * 60 * 60 * 1000;
//         unit = "hour";
//         break;
//       // case "7d":
//       //   startTime = endTime - 7 * 24 * 60 * 60 * 1000;
//       //   unit = "day";
//       //   break;
//       // case "15d":
//       //   startTime = endTime - 15 * 24 * 60 * 60 * 1000;
//       //   unit = "day";
//       //   break;
//       // case "1mon":
//       //   startTime = endTime - 30 * 24 * 60 * 60 * 1000;
//       //   unit = "month";
//       //   break;
//       // case "2h":
//       case "2hr":
//       default:
//         startTime = endTime - 2 * 60 * 60 * 1000;
//         unit = "hour";
//         break;
//     }

//     return { startTime, endTime, unit };
//   };

//   const options: ChartOptions<"line"> = {
//     responsive: true,
//     maintainAspectRatio: false,
//     interaction: {
//       mode: "index",
//       intersect: false,
//     },
//     plugins: {
//       legend: {
//         position: "top" as const,
//       },
//       title: {
//         display: true,
//         text: "SNMP Incoming Packets Monitoring",
//         font: {
//           size: 16,
//           weight: "bold",
//         },
//       },
//       tooltip: {
//         enabled: true,
//         backgroundColor: "rgba(0, 0, 0, 0.8)",
//         titleFont: {
//           size: 12,
//         },
//         bodyFont: {
//           size: 12,
//         },
//         padding: 10,
//         displayColors: true,
//         callbacks: {
//           label: function (context) {
//             return `Packets: ${context.parsed.y}`;
//           },
//         },
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         title: {
//           display: true,
//           text: "Packets",
//         },
//       },
//       x: {
//         type: "time",
//         adapters: {
//           date: {
//             locale: enUS,
//           },
//         },
//         time: {
//           unit: getTimeRangeSettings(timeRange).unit,
//           parser: "yyyy-MM-dd HH:mm:ss",
//           displayFormats: {
//             minute: "HH:mm",
//             hour: "HH:mm",
//           },
//           tooltipFormat: "HH:mm:ss",
//         },
//         grid: {
//           display: true,
//         },
//         title: {
//           display: true,
//           text: "Time",
//         },
//         min: getTimeRangeSettings(timeRange).startTime,
//         max: getTimeRangeSettings(timeRange).endTime,
//         ticks: {
//           source: "auto",
//           maxRotation: 0,
//           stepSize: timeRange === "2h" ? 1 : undefined,
//           callback: function (value) {
//             const date = new Date(value);
//             if (timeRange === "2h") {
//               return date.getHours() % 2 === 0
//                 ? `${date.getHours().toString().padStart(2, "0")}:00`
//                 : "";
//             }
//             return `${date.getHours().toString().padStart(2, "0")}:${date
//               .getMinutes()
//               .toString()
//               .padStart(2, "0")}`;
//           },
//         },
//       },
//     },
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!hostId) return;

//       try {
//         const response = await fetch(`http://127.0.0.1:3000/data/${hostId}`);
//         const result: ApiResponse = await response.json();

//         if (result.status === "success") {
//           const host = result.data[0];
//           const inPktsItem = host.items.find(
//             (item) => item.item_id.item_name === "snmpInPkts"
//           );

//           if (inPktsItem && inPktsItem.data.length > 0) {
//             const timeSettings = getTimeRangeSettings(timeRange);
//             const filteredData = inPktsItem.data.filter((entry) => {
//               const timestamp = new Date(entry.timestamp).getTime();
//               return (
//                 timestamp >= timeSettings.startTime &&
//                 timestamp <= timeSettings.endTime
//               );
//             });

//             const sortedData = filteredData.sort(
//               (a, b) =>
//                 new Date(a.timestamp).getTime() -
//                 new Date(b.timestamp).getTime()
//             );

//             const labels = sortedData.map((entry) =>
//               new Date(entry.timestamp).getTime()
//             );
//             const values = sortedData.map((entry) => Number(entry.value));

//             setChartData({
//               labels,
//               datasets: [
//                 {
//                   label: "Incoming Packets",
//                   data: values,
//                   borderColor: "rgb(75, 192, 192)",
//                   backgroundColor: "rgba(75, 192, 192, 0.5)",
//                   tension: 0.1,
//                   borderWidth: 4,
//                   pointRadius: 1,
//                   pointHoverRadius: 4,
//                   pointBackgroundColor: "white",
//                   pointBorderColor: "rgb(75, 192, 192)",
//                   pointBorderWidth: 2,
//                   pointHoverBackgroundColor: "rgb(75, 192, 192)",
//                   pointHoverBorderColor: "white",
//                   fill: false,
//                   showLine: true,
//                 },
//               ],
//             });
//             setHasData(true);
//             setError(null);
//           } else {
//             setError("No data available");
//             setHasData(false);
//           }
//         } else {
//           setError("Failed to fetch data");
//           setHasData(false);
//         }
//       } catch (err) {
//         setError("Error connecting to server");
//         setHasData(false);
//       }
//     };

//     if (hostId) {
//       fetchData();
//       const interval = setInterval(fetchData, 10000);
//       return () => clearInterval(interval);
//     }
//   }, [hostId, timeRange]);

//   if (!hasData) {
//     return (
//       <Box sx={{ mt: 4, mb: 4 }}>
//         {/* <Paper
//           elevation={3}
//           sx={{
//             p: 3,
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             height: "100px",
//           }}
//         >
//           <Typography color="error" sx={{ p: 2 }}>
//             {error || "No data available"}
//           </Typography>
//         </Paper> */}
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ mt: 4, mb: 4 }}>
//       <Paper
//         elevation={3}
//         sx={{
//           p: 3,
//           height: "500px",
//           position: "relative",
//         }}
//       >
//         <Box
//           sx={{
//             position: "absolute",
//             right: "24px",
//             top: "24px",
//             zIndex: 1,
//           }}
//         >
//           <FormControl size="small">
//             <Select
//               value={timeRange}
//               onChange={(e) => setTimeRange(e.target.value)}
//               sx={{ minWidth: 120 }}
//             >
//               <MenuItem value="10min">10 minutes</MenuItem>
//               <MenuItem value="30min">30 minutes</MenuItem>
//               <MenuItem value="1hr">1 hour</MenuItem>
//               <MenuItem value="2hr">2 hours</MenuItem>
//               <MenuItem value="6hr">6 hours</MenuItem>
//               <MenuItem value="12hr">12 hours</MenuItem>
//               <MenuItem value="24hr">1 day</MenuItem>
//               {/* <MenuItem value="7d">1 week</MenuItem>
//               <MenuItem value="15d">15 days</MenuItem>
//               <MenuItem value="1mon">1 months</MenuItem> */}
//               {/* <MenuItem value="6mon">6 months</MenuItem>
//               <MenuItem value="1year">1 year</MenuItem> */}
//             </Select>
//           </FormControl>
//         </Box>
//         <Box sx={{ height: "100%", position: "relative" }}>
//           <Line options={options} data={chartData} />
//         </Box>
//       </Paper>
//     </Box>
//   );
// };

// export default SNMPInPkts;
