import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  AlertColor,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const NotificationComponent: React.FC = () => {
  const [emails, setEmails] = useState<string[]>([""]);
  const [lines, setLines] = useState<string[]>([""]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  // Store temporary values while editing
  const [tempEmails, setTempEmails] = useState<string[]>([]);
  const [tempLines, setTempLines] = useState<string[]>([]);

  const MAX_ENTRIES = 3;

  const handleEditClick = () => {
    if (!isEditMode) {
      // Enter edit mode - store current values
      setTempEmails([...emails]);
      setTempLines([...lines]);
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = () => {
    setEmails(tempEmails);
    setLines(tempLines);
    setIsEditMode(false);
    setSnackbar({
      open: true,
      message: "Changes saved successfully",
      severity: "success",
    });
  };

  const handleCancel = () => {
    setTempEmails([...emails]);
    setTempLines([...lines]);
    setIsEditMode(false);
    setSnackbar({
      open: true,
      message: "Changes cancelled",
      severity: "info",
    });
  };

  const handleAddEmail = (): void => {
    if (tempEmails.length < MAX_ENTRIES) {
      setTempEmails([...tempEmails, ""]);
    } else {
      setSnackbar({
        open: true,
        message: "Maximum 3 email addresses allowed",
        severity: "error",
      });
    }
  };

  const handleAddLine = (): void => {
    if (tempLines.length < MAX_ENTRIES) {
      setTempLines([...tempLines, ""]);
    } else {
      setSnackbar({
        open: true,
        message: "Maximum 3 line IDs allowed",
        severity: "error",
      });
    }
  };

  const handleEmailChange = (index: number, value: string): void => {
    const newEmails = [...tempEmails];
    newEmails[index] = value;
    setTempEmails(newEmails);
  };

  const handleLineChange = (index: number, value: string): void => {
    const newLines = [...tempLines];
    newLines[index] = value;
    setTempLines(newLines);
  };

  const handleRemoveEmail = (index: number): void => {
    if (tempEmails.length > 1) {
      const newEmails = tempEmails.filter((_, i) => i !== index);
      setTempEmails(newEmails);
    }
  };

  const handleRemoveLine = (index: number): void => {
    if (tempLines.length > 1) {
      const newLines = tempLines.filter((_, i) => i !== index);
      setTempLines(newLines);
    }
  };

  const handleCloseSnackbar = (): void => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Grid
        container
        item
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          mt: 1,
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ mb: 0, fontSize: "21px", fontWeight: "medium" }}>
          Alerting
        </Typography>
        <Box>
          {isEditMode ? (
            <>
              <IconButton onClick={handleSave} color="secondary">
                <SaveIcon />
              </IconButton>
              <IconButton onClick={handleCancel} color="error">
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <IconButton onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          )}
        </Box>
      </Grid>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: 2,
          mb: 2,
          border: "3px solid #f3f3f3",
          borderRadius: "10px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: 3,
            width: 1,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row", width: 1 }}>
            <Typography sx={{ color: "#000000", mt: 2, width: "50%" }}>
              Email for Alerting
            </Typography>
          </Box>

          {(isEditMode ? tempEmails : emails).map((email, index) => (
            <Box
              key={`email-${index}`}
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TextField
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                sx={{ ml: 1.5, width: "50%" }}
                placeholder="Enter email address"
                disabled={!isEditMode}
              />

              {isEditMode && tempEmails.length > 1 && (
                <IconButton
                  onClick={() => handleRemoveEmail(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
          {isEditMode && (
            <Button
              onClick={handleAddEmail}
              sx={{
                color: "blue",
                width: "fit-content",
                ml: 2,
              }}
              disabled={tempEmails.length >= MAX_ENTRIES}
            >
              Add another email
            </Button>
          )}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              maxWidth: "calc(100% - 150px)",
              gap: 1,
              ml: 2,
            }}
          >
            {[
              { level: "Not classified", color: "#808080" },
              { level: "Information", color: "#0000FF" },
              { level: "Warning", color: "#FFA500" },
              { level: "Average", color: "#FF4500" },
              { level: "High", color: "#FF0000" },
              { level: "Disaster", color: "#8B0000" },
            ].map(({ level, color }) => (
              <Button
                key={level}
                // variant={
                //   severity === level.toLowerCase() ? "contained" : "outlined"
                // }
                // onClick={() => setSeverity(level.toLowerCase())}
                disabled={!isEditMode}
                sx={{
                  fontSize: 12,
                  minWidth: "auto",
                  flex: "1 0 auto",
                  color: color,
                  backgroundColor: "transparent",
                  borderColor: color,
                  "&:hover": {
                    backgroundColor: `${color}22`,
                  },
                  border: isEditMode ? "1px solid black" : "1px solid #f3f3f3",
                }}
              >
                {level}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: 2,
          mb: 2,
          border: "3px solid #f3f3f3",
          borderRadius: "10px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: 3,
            width: 1,
          }}
        >
          <Typography sx={{ color: "#000000" }}>
            Line ID for Alerting
          </Typography>

          {(isEditMode ? tempLines : lines).map((line, index) => (
            <Box
              key={`line-${index}`}
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TextField
                value={line}
                onChange={(e) => handleLineChange(index, e.target.value)}
                sx={{ ml: 1.5, width: "50%", mr: 2 }}
                placeholder="Enter line ID"
                disabled={!isEditMode}
              />
              {isEditMode && tempLines.length > 1 && (
                <IconButton
                  onClick={() => handleRemoveLine(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              maxWidth: "calc(100% - 150px)",
              gap: 1,
              ml: 2,
            }}
          >
            {[
              { level: "Not classified", color: "#808080" },
              { level: "Information", color: "#0000FF" },
              { level: "Warning", color: "#FFA500" },
              { level: "Average", color: "#FF4500" },
              { level: "High", color: "#FF0000" },
              { level: "Disaster", color: "#8B0000" },
            ].map(({ level, color }) => (
              <Button
                key={level}
                // variant={
                //   severity === level.toLowerCase() ? "contained" : "outlined"
                // }
                // onClick={() => setSeverity(level.toLowerCase())}
                disabled={!isEditMode}
                sx={{
                  fontSize: 12,
                  minWidth: "auto",
                  flex: "1 0 auto",
                  color: color,
                  backgroundColor: "transparent",
                  borderColor: color,
                  "&:hover": {
                    backgroundColor: `${color}22`,
                  },
                  border: isEditMode ? "1px solid black" : "1px solid #f3f3f3",
                }}
              >
                {level}
              </Button>
            ))}
          </Box>

          {isEditMode && (
            <Button
              onClick={handleAddLine}
              sx={{ color: "blue", width: "fit-content", ml: 2 }}
              disabled={tempLines.length >= MAX_ENTRIES}
            >
              Add another line ID
            </Button>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationComponent;
