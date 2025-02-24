import {
  Grid,
  Typography,
  Box,
  Alert,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
const ActivityComponent = () => {
  return (
    <Container maxWidth={false}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          backgroundColor: "transparent",
          // mt: 2,
        }}
      >
        <Table
          sx={{
            // minWidth: 650,
            width: 1,
            "& .MuiTableCell-root": {
              borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
              padding: "16px",
            },
            "& .MuiTableRow-root:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          {/* <TableHead sx={{ backgroundColor: "#242d5d",  }}> */}
          <TableHead sx={{ backgroundColor: "#ffffff" }}>
            <TableRow>
              <TableCell sx={{ color: "black" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Timestamp
                </Typography>
              </TableCell>
              <TableCell sx={{ color: "black" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  User's role
                </Typography>
              </TableCell>
              <TableCell sx={{ color: "black" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Activity
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow hover>
              <TableCell>
                <Typography variant="body2">12:00</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">admin</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">activity</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ActivityComponent;
