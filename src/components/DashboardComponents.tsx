import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { Box, Typography, Paper, Button } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import dayjs from "dayjs";
import MetricGraph, { Items } from "../components/graphComponent/MetricGraph"; // Adjust the import path as needed

function createData(name: string, value: number, details: string) {
  return { name, value, details };
}

const rows = [
  createData("Number of hosts (enabled/disabled)", 159, "6/10"),
  createData("Number of items (enabled/disabled)", 237, "6/10"),
  createData("Number of triggers (enabled/disabled)", 262, "6/10"),
  createData(
    "Number of users (enabled/disabled [problem/resolved])",
    305,
    "6/10"
  ),
];

const DigitalClock = () => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "70%",
        backgroundColor: "rgb(187, 187, 187)",
        borderRadius: "5px",
        p: 1,
      }}
    >
      <Typography variant="h4" fontFamily="monospace" fontWeight="bold">
        {formatTime(time)}
      </Typography>
    </Box>
  );
};

const AnalogClock = () => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6;
  const secondAngle = seconds * 6;

  return (
    <Paper
      elevation={3}
      sx={{
        position: "relative",
        width: 200,
        height: 200,
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      {/* Hour Markers */}
      {[...Array(12)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: "4px",
            height: "15px",
            backgroundColor: "grey.800",
            transform: `rotate(${i * 30}deg)`,
            transformOrigin: "bottom center",
            top: "10px",
            left: "calc(50% - 2px)",
          }}
        />
      ))}

      {/* Hour Hand */}
      <Box
        sx={{
          position: "absolute",
          width: "6px",
          height: "60px",
          backgroundColor: "grey.900",
          transform: `rotate(${hourAngle}deg)`,
          transformOrigin: "bottom center",
          borderRadius: "6px",
          bottom: "50%",
          left: "calc(50% - 3px)",
        }}
      />

      {/* Minute Hand */}
      <Box
        sx={{
          position: "absolute",
          width: "4px",
          height: "80px",
          backgroundColor: "grey.800",
          transform: `rotate(${minuteAngle}deg)`,
          transformOrigin: "bottom center",
          borderRadius: "4px",
          bottom: "50%",
          left: "calc(50% - 2px)",
        }}
      />

      {/* Second Hand */}
      <Box
        sx={{
          position: "absolute",
          width: "2px",
          height: "90px",
          backgroundColor: "error.main",
          transform: `rotate(${secondAngle}deg)`,
          transformOrigin: "bottom center",
          borderRadius: "2px",
          bottom: "50%",
          left: "calc(50% - 1px)",
        }}
      />

      {/* Center Dot */}
      <Box
        sx={{
          position: "absolute",
          width: "12px",
          height: "12px",
          backgroundColor: "grey.900",
          borderRadius: "50%",
          left: "calc(50% - 6px)",
          top: "calc(50% - 6px)",
        }}
      />
    </Paper>
  );
};

const CalendarWithNowButton = () => {
  const [value, setValue] = React.useState(dayjs());

  const handleNowClick = () => {
    setValue(dayjs());
  };

  return (
    <Box sx={{ position: "relative" }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={value}
          onChange={(newValue) => setValue(newValue)}
        />
      </LocalizationProvider>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: -4,
          mb: 4,
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={handleNowClick}
          sx={{
            minWidth: "80px",
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          Now
        </Button>
      </Box>
    </Box>
  );
};

const DashboardComponents = () => {

  return (
    <Box sx={{ width: 1 }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          mb: 2, // adds some margin bottom for spacing
        }}
      >
        <Button
          sx={{
            width: "auto", // changed from fixed 15% to auto
            color: "Blue",
            border: 1,
            px: 1,
            mx:2,
            minWidth: "150px", // ensures minimum width
          }}
        >
          Edit Dashboard
        </Button>
      </Box>
      <Box
        sx={{
          height: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          px: 2,
        }}
      >
        <Box
          sx={{
            width: "25%",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <AnalogClock />
        </Box>
        {/* <Box sx={{ width: "30%", textAlign: "center" }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar />
          </LocalizationProvider>
        </Box> */}
        <Box sx={{ width: "30%", textAlign: "center" }}>
          <CalendarWithNowButton />
        </Box>
        <Box sx={{ width: "45%", textAlign: "center" }}>
          <DigitalClock/>
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 300 }}
              size="small"
              aria-label="a dense table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>(Draft)Parameter</TableCell>
                  <TableCell align="left">Value</TableCell>
                  <TableCell align="left">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="left">{row.value}</TableCell>
                    <TableCell align="left">{row.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          px: 2,
        }}
      >
        {/* <Box sx={{ width: "50%", textAlign: "center" }}>
          <AnalogClock />
        </Box> */}
        <Box sx={{ width: "50%", textAlign: "center" }}>Graph 1</Box>
        <Box sx={{ width: "50%", textAlign: "center" }}>Graph 2</Box>
      </Box>
        {/* <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          px: 2,
        }}
      >
        <Box sx={{ width: "50%", textAlign: "center" }}>Graph 3</Box>
        <Box sx={{ width: "50%", textAlign: "center" }}>Graph 4</Box>
      </Box> */}
    </Box>
  );
};

export default DashboardComponents;
