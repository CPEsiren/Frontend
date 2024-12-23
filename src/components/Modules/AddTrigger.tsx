import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import useWindowSize from "../../hooks/useWindowSize";
import axios from "axios";

// Update the TriggerItems interface to match database exactly
interface TriggerItems {
  trigger_name: string;
  host_id: string;
  item_id: string;
  ComparisonOperator: string; // Note the capital C
  valuetrigger: number | "";
  severity: string;
  enabled: boolean;
  createdAt?: string; // Optional as it's set by server
}

interface AddTriggerProps {
  onClose: () => void;
}

// Update the Host interface to include hostname
interface Host {
  _id: string;
  hostname: string;
  ip_address: string;
  items: Item[];
}

// Update the Item interface to match your API response
interface Item {
  _id: string;
  host_id: string;
  item_name: string;
  oid: string;
  type: string;
  unit: string;
  interval: number;
  status: number;
  createAt: string;
  updateAt: string;
}

interface HostDetails {
  _id: string;
  hostname: string;
  items: string[];
  // Add other fields as needed
}

const AddTrigger: React.FC<AddTriggerProps> = ({ onClose }) => {
  const windowSize = useWindowSize();
  const [host_id, setHost_id] = useState<string>("");
  const [item_id, setItem_id] = useState<string>("");
  const [trigger_name, setTrigger_name] = useState<string>("");
  const [enabled, setEnabled] = useState<boolean>(false);
  const [severity, setSeverity] = useState<string>("");
  const [valuetrigger, setValuetrigger] = useState<number | "">("");
  const [ComparisonOperator, setComparisonOperator] = useState<string>("");
  const [createAt, setCreateAt] = useState<string>("");
  const [hostOptions, setHostOptions] = useState<Host[]>([]);
  const [itemOptions, setItemOptions] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  // Add error states for form validation
  const [errors, setErrors] = useState({
    trigger_name: false,
    host_id: false,
    item_id: false,
    ComparisonOperator: false,
    valuetrigger: false,
    severity: false,
  });

  const validateForm = () => {
    const newErrors = {
      trigger_name: !trigger_name,
      host_id: !host_id,
      item_id: !item_id,
      ComparisonOperator: !ComparisonOperator,
      valuetrigger: valuetrigger === "",
      severity: !severity,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const fetchHosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:3000/host");
      if (Array.isArray(response.data)) {
        setHostOptions(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setHostOptions(response.data.data);
      } else {
        console.error("Invalid host data format");
        setHostOptions([]);
      }
    } catch (error) {
      console.error("Error fetching hosts:", error);
      setHostOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch items with the complete data structure
  const fetchItems = async (hostId: string) => {
    if (!hostId) return;

    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:3000/host/${hostId}`);
      if (response.data.status === "success" && response.data.data) {
        const items = response.data.data.items;
        setItemOptions(items); // Now we store the complete item objects
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setItemOptions([]);
    } finally {
      setLoading(false);
    }
  };
  const handleHostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedHostId = event.target.value;
    setHost_id(selectedHostId);
    setItem_id(""); // Reset item selection when host changes
    if (selectedHostId) {
      fetchItems(selectedHostId);
    } else {
      setItemOptions([]);
    }
  };

  const handleItemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItem_id(event.target.value);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    const success = await StoreNewtrigger(
      trigger_name,
      enabled,
      severity,
      valuetrigger,
      ComparisonOperator,
      host_id,
      item_id
    );

    if (success) {
      setTrigger_name("");
      setEnabled(false);
      setSeverity("");
      setValuetrigger("");
      setComparisonOperator("");
      setHost_id("");
      setItem_id("");
      alert("Trigger added successfully!");
      onClose();
    } else {
      alert("Failed to add trigger. Please try again.");
    }
  };

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

  const typographyProps = {
    fontSize: 14,
  };

  // Update the StoreNewtrigger function to match database fields
  const StoreNewtrigger = async (
    trigger_name: string,
    enabled: boolean,
    severity: string,
    valuetrigger: number | "",
    ComparisonOperator: string,
    host_id: string,
    item_id: string
  ): Promise<boolean> => {
    try {
      const requestBody = {
        trigger_name,
        host_id,
        item_id,
        ComparisonOperator,
        valuetrigger,
        severity,
        enabled,
        // Note: createdAt is handled by the server
      };

      await axios.post("http://127.0.0.1:3000/trigger", requestBody);
      return true;
    } catch (error) {
      console.error("Error recording New Trigger:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const isFormDisabled = !host_id; // Form is disabled if no host is selected

  return (
    <Box sx={{ p: 0, width: "100%" }}>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: "#FFFFFB" }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Host selection field */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Host
              </Typography>
            </Box>
            <TextField
              select
              value={host_id}
              onChange={handleHostChange}
              disabled={loading}
              error={errors.host_id}
              helperText={errors.host_id ? "Host is required" : ""}
              {...textFieldProps}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {hostOptions.map((host) => (
                <MenuItem key={host._id} value={host._id}>
                  {host.hostname}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Item selection field */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Item Name
              </Typography>
            </Box>
            <TextField
              select
              value={item_id}
              onChange={handleItemChange}
              disabled={!host_id || loading}
              error={errors.item_id}
              helperText={errors.item_id ? "Item is required" : ""}
              {...textFieldProps}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {itemOptions.map((item) => (
                <MenuItem key={item._id} value={item._id}>
                  {item.item_name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Trigger Name field */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Trigger Name
              </Typography>
            </Box>
            <TextField
              {...textFieldProps}
              value={trigger_name}
              onChange={(e) => setTrigger_name(e.target.value)}
              disabled={isFormDisabled}
              error={errors.trigger_name}
              helperText={errors.trigger_name ? "Trigger name is required" : ""}
            />
          </Box>

          {/* Enabled Switch */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
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
                  disabled={isFormDisabled}
                />
              }
              label=""
            />
          </Box>

          {/* Severity field */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Severity
              </Typography>
            </Box>
            <TextField
              select
              {...textFieldProps}
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              disabled={isFormDisabled}
              error={errors.severity}
              helperText={errors.severity ? "Severity is required" : ""}
            >
              <MenuItem value="critical">critical</MenuItem>
              <MenuItem value="warning">warning</MenuItem>
            </TextField>
          </Box>

          {/* Comparison Operator field */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Comparison Operator
              </Typography>
            </Box>
            <TextField
              select
              {...textFieldProps}
              value={ComparisonOperator}
              onChange={(e) => setComparisonOperator(e.target.value)}
              disabled={isFormDisabled}
              error={errors.ComparisonOperator}
              helperText={
                errors.ComparisonOperator ? "Operator is required" : ""
              }
            >
              <MenuItem value="=">=</MenuItem>
              <MenuItem value="<">{"<"}</MenuItem>
              <MenuItem value=">">{">"}</MenuItem>
              <MenuItem value="<=">{"<="}</MenuItem>
              <MenuItem value=">=">{">="}</MenuItem>
            </TextField>
          </Box>

          {/* Trigger Value field */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Trigger Value
              </Typography>
            </Box>
            <TextField
              {...textFieldProps}
              type="number"
              value={valuetrigger}
              onChange={(e) =>
                setValuetrigger(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              disabled={isFormDisabled}
              error={errors.valuetrigger}
              helperText={
                errors.valuetrigger ? "Trigger value is required" : ""
              }
            />
          </Box>

          {/* Button section */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
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
              disabled={isFormDisabled}
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
      </Paper>
    </Box>
  );
};

export default AddTrigger;
