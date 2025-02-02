import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from "@mui/material";

// Sample data for the table
const sampleData = [
  {
    id: 1,
    name: "Number of users (enabled/disabled/templates)",
    value: "30",
    detail: "15/15/35",
  },
  {
    id: 2,
    name: "Number of hosts (enabled/disabled)",
    value: "30",
    detail: "15/14",
  },
  {
    id: 3,
    name: "Number of items (enabled/disabled)",
    value: "30",
    detail: "20/10",
  },
  {
    id: 4,
    name: "Number of triggers (enabled/disabled [problem/resolved])",
    value: "30",
    detail: "15/18 [4/5]",
  },
];

const highlightText = (text: string) => {
  return text.split(/(enabled|disabled)/gi).map((part, index) => {
    if (/enabled/i.test(part)) {
      return (
        <Typography key={index} component="span" sx={{ color: "green",fontSize:"0.8rem" }}>
          {part}
        </Typography>
      );
    }
    if (/disabled/i.test(part)) {
      return (
        <Typography key={index} component="span" sx={{ color: "red",fontSize:"0.8rem" }}>
          {part}
        </Typography>
      );
    }
    return part;
  });
};

// Function to highlight numbers but keep "/" and "[]" in black
// const highlightDetail = (detail: string) => {
//   return detail.split(/(\d+|\/|\[|\])/).map((part, index) => {
//     if (/^\d+$/.test(part)) {
//       const color = index % 5 === 1 ? "green" : "red"; // Alternating colors
//       return (
//         <Typography
//           key={index}
//           component="span"
//           sx={{ color, fontWeight: "bold", margin: "0 2px" }}
//         >
//           {part}
//         </Typography>
//       );
//     }
//     return (
//       <Typography
//         key={index}
//         component="span"
//         sx={{ color: "black", margin: "0 2px" }}
//       >
//         {part}
//       </Typography>
//     );
//   });
// };

const TableComponent = () => {
  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 300,
          "& .MuiTableCell-root": {
            padding: "10px 8px",
            fontSize: "0.8rem",
            lineHeight: 1.8,
          },
          "& .MuiTableCell-head": {
            fontWeight: "bold",
            backgroundColor: "#f5f5f5",
            fontSize: "0.8rem",
          },
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            "& .MuiTableRow-root": {
              "&:nth-of-type(odd)": {
                backgroundColor: "#fafafa",
              },
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Parameter</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    maxWidth: "200px",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {highlightText(row.name)}
                </TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      borderRadius: "4px",
                      padding: "2px 6px",
                      display: "inline-block",
                      minWidth: "30px",
                      textAlign: "center",
                    }}
                  >
                    {row.value}
                  </Box>
                </TableCell>
                {/* <TableCell>{highlightDetail(row.detail)}</TableCell> */}
                <TableCell>{row.detail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableComponent;
