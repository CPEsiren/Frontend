import {
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box,
} from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";

interface IActivity {
  image: string;
  username: string;
  role: string;
  activity: string;
  createdAt: Date;
}

const mockData = [
  {
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocL_GDPC-hRqhOEEUMnzUPrjmDGkocs9PQnXtY86gycRfV2Jpw=s96-c",
    username: "John Doe",
    role: "Admin",
    activity: "Created a new project",
    createdAt: new Date(1740412281),
  },
  {
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocL_GDPC-hRqhOEEUMnzUPrjmDGkocs9PQnXtY86gycRfV2Jpw=s96-c",
    username: "Jane Smith",
    role: "User",
    activity: "Updated a project",
    createdAt: new Date(1740415275),
  },
  {
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocL_GDPC-hRqhOEEUMnzUPrjmDGkocs9PQnXtY86gycRfV2Jpw=s96-c",
    username: "John Doe",
    role: "Admin",
    activity: "Created a new project",
    createdAt: new Date(1740412281),
  },
  {
    image:
      "https://lh3.googleusercontent.com/a/ACg8ocL_GDPC-hRqhOEEUMnzUPrjmDGkocs9PQnXtY86gycRfV2Jpw=s96-c",
    username: "John Doe",
    role: "Admin",
    activity: "Created a new project",
    createdAt: new Date(1740412281),
  },
];

const ActivityComponent = () => {
  return (
    <Container maxWidth={false}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          backgroundColor: "transparent",
        }}
      >
        <Table
          sx={{
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
          <TableHead sx={{ backgroundColor: "#ffffff" }}>
            <TableRow>
              <TableCell align="center" sx={{ color: "black", width: "5%" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Timestamp
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ color: "black", width: "20%" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  User
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ color: "black", width: "7%" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  User's role
                </Typography>
              </TableCell>
              <TableCell align="center" sx={{ color: "black", width: "30%" }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Activity
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockData
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((activity, index) => (
                <TableRow>
                  <TableCell
                    align="center"
                    style={{
                      verticalAlign: "top",
                      margin: "0 auto",
                      padding: "0",
                    }}
                  >
                    <Timeline
                      style={{
                        padding: "0",
                      }}
                    >
                      <TimelineItem
                        key={index}
                        style={{
                          padding: "0",
                        }}
                      >
                        <TimelineSeparator>
                          <TimelineDot />
                          {index !== mockData.length - 1 && (
                            <TimelineConnector />
                          )}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2">
                            {activity.createdAt.toLocaleString("en-US", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    </Timeline>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Box key={index} display="flex" alignItems="center" mb={2}>
                      <Avatar
                        src={activity.image}
                        alt={activity.username}
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="body2">
                        {activity.username}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography key={index} variant="body2">
                      {activity.role}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography key={index} variant="body2">
                      {activity.activity}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ActivityComponent;
