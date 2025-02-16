import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useState } from "react";

interface AddTriggerProps {
  onClose: () => void;
}

const AddAction: React.FC<AddTriggerProps> = ({ onClose }) => {
  //   Global state
  const typographyProps = {
    fontSize: 14,
  };

  //Errors State
  const validateForm = () => {
    const newErrors = {
      actionName: !actionName,
      media: !media,
      duration: !duration,
      messageProblemTemplate: !messageProblemTemplate,
      messageRecoveryTemplate: !messageRecoveryTemplate,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const [errors, setErrors] = useState({
    actionName: false,
    media: false,
    duration: false,
    messageProblemTemplate: false,
    messageRecoveryTemplate: false,
  });

  const textFieldProps = {
    size: "small" as const,
    fullWidth: true,
    sx: {
      backgroundColor: "white",
      "& .MuiInputBase-input": {
        fontSize: 14,
      },
    },
  };

  //Action name
  const [actionName, setActionName] = useState("");

  //Media field
  const mediaOptions = [
    { value: "all media", label: "All Media" },
    { value: "email", label: "Email" },
    { value: "line", label: "Line" },
  ];
  const [media, setMedia] = useState<string>(mediaOptions[0].value);
  const handleMediaChange = (value: string) => {
    setMedia(value);
  };

  //Duration field
  const [duration, setDuration] = useState("30m");

  //Message Problem Template
  const [messageProblemTemplate, setMessageProblemTemplate] = useState("");

  //Message Recovery Template
  const [messageRecoveryTemplate, setMessageRecoveryTemplate] = useState("");

  //Enabled field
  const [enabled, setEnabled] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    const success = await StoreNewAction(
      actionName,
      media,
      duration,
      messageProblemTemplate,
      messageRecoveryTemplate,
      enabled
    );

    if (success) {
      setActionName("");
      setMedia(mediaOptions[0].value);
      setDuration("");
      setMessageProblemTemplate("");
      setMessageRecoveryTemplate("");
      setEnabled(true);
      onClose();
    } else {
      alert("Failed to add action. Please try again.");
    }
  };

  //user
  const user_id = localStorage.getItem("user_id");

  const StoreNewAction = async (
    actionName: string,
    media: string,
    duration: string,
    messageProblemTemplate: string,
    messageRecoveryTemplate: string,
    enabled: boolean
  ): Promise<boolean> => {
    try {
      const requestBody = {
        action_name: actionName,
        user_id: user_id,
        media,
        duration,
        messageProblemTemplate,
        messageRecoveryTemplate,
        enabled,
      };

      await axios.post("http://127.0.0.1:3000/action", requestBody);
      return true;
    } catch (error) {
      console.error("Error recording new action:", error);
      return false;
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: "#FFFFFB" }}>
        <Box
          component={"form"}
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Action Name field */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Action Name
              </Typography>
            </Box>
            <TextField
              {...textFieldProps}
              value={actionName}
              onChange={(e) => setActionName(e.target.value)}
              error={errors.actionName}
              helperText={errors.actionName ? "Action name is required" : ""}
            />
          </Box>

          {/* Media field */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Media
              </Typography>
            </Box>
            <TextField
              select
              value={media}
              onChange={(e) => handleMediaChange(e.target.value)}
              error={errors.media}
              helperText={errors.media ? "Media is required" : ""}
              sx={{ width: "11%" }}
            >
              {mediaOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Duration */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Duration
              </Typography>
            </Box>
            <TextField
              sx={{ width: "11%" }}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              error={errors.duration}
              helperText={errors.duration ? "Duration is required." : ""}
            />
          </Box>

          {/* Message Problem Template */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Message Problem Template
              </Typography>
            </Box>
            <TextField
              {...textFieldProps}
              value={messageProblemTemplate}
              onChange={(e) => setMessageProblemTemplate(e.target.value)}
              multiline
              rows={4}
              sx={{
                ...textFieldProps.sx,
                "& .MuiOutlinedInput-root": {
                  padding: "8px",
                },
              }}
              error={errors.messageProblemTemplate}
              helperText={
                errors.messageProblemTemplate
                  ? "Message problem template is required."
                  : ""
              }
            />
          </Box>

          {/* Message Recovery Template */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Message Recovery Template
              </Typography>
            </Box>
            <TextField
              {...textFieldProps}
              value={messageRecoveryTemplate}
              onChange={(e) => setMessageRecoveryTemplate(e.target.value)}
              multiline
              rows={4}
              sx={{
                ...textFieldProps.sx,
                "& .MuiOutlinedInput-root": {
                  padding: "8px",
                },
              }}
              error={errors.messageRecoveryTemplate}
              helperText={
                errors.messageRecoveryTemplate
                  ? "Message recovery template is required."
                  : ""
              }
            />
          </Box>

          {/* Enabled */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Enabled Switch */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
              >
                <Typography color="error" {...typographyProps}>
                  *
                </Typography>
                <Typography sx={{ ml: 1 }} {...typographyProps}>
                  Enabled
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#4CAF50",
                        "&:hover": {
                          backgroundColor: "#4CAF5022",
                        },
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#4CAF50",
                        },
                      "& .MuiSwitch-switchBase.Mui-disabled": {
                        color: "#bdbdbd",
                      },
                      "& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track":
                        {
                          backgroundColor: "#e0e0e0",
                        },
                    }}
                  />
                }
                label=""
              />
            </Box>

            {/* Button section */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={onClose}
                sx={{ fontSize: 14 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="outlined"
                sx={{
                  fontSize: 14,
                  color: "black",
                  borderColor: "black",
                  "&:hover": {
                    color: "red",
                    borderColor: "red",
                  },
                }}
              >
                Add
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddAction;
