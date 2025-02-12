import { Box, Paper, TextField, Typography } from "@mui/material";
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
  const [errors, setErrors] = useState({
    actionName: false,
  });

  //Action name
  const [actionName, setActionName] = useState("");

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    return;
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
        </Box>
      </Paper>
    </Box>
  );
};

export default AddAction;
