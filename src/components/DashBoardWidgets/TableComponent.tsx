import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';

// Sample data for the table
const sampleData = [
  {
    id: 1,
    name: 'Device 1',
    status: 'Online',
    lastUpdate: '2024-02-01 10:30:00',
    metric: '98%',
  },
  {
    id: 2,
    name: 'Device 2',
    status: 'Offline',
    lastUpdate: '2024-02-01 09:45:00',
    metric: '0%',
  },
  {
    id: 3,
    name: 'Device 3',
    status: 'Online',
    lastUpdate: '2024-02-01 10:28:00',
    metric: '87%',
  },
  {
    id: 4,
    name: 'Device 4',
    status: 'Online',
    lastUpdate: '2024-02-01 10:25:00',
    metric: '92%',
  },
];

const TableComponent = () => {
  return (
    <Box sx={{ width: '95%', overflow: 'hidden' }}>
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Update</TableCell>
              <TableCell>Metric</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sampleData.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: row.status === 'Online' ? '#e8f5e9' : '#ffebee',
                      color: row.status === 'Online' ? '#2e7d32' : '#c62828',
                    }}
                  >
                    {row.status}
                  </Box>
                </TableCell>
                <TableCell>{row.lastUpdate}</TableCell>
                <TableCell>{row.metric}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TableComponent;