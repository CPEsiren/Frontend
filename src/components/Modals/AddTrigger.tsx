import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface Host {
  _id: string;
  hostname: string;
  ip_address: string;
  items: Item[];
}

// Update the Item interface to match your API response
export interface Item {
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

interface AddTriggerProps {
  onClose: () => void;
}

const AddTrigger: React.FC<AddTriggerProps> = ({ onClose }) => {
  //Global state
  const typographyProps = {
    fontSize: 14,
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

  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    const success = await StoreNewtrigger(
      trigger_name,
      host_id,
      severity,
      expression,
      ok_eventGen,
      recoveryExpression,
      enabled
    );

    if (success) {
      setTrigger_name("");
      setEnabled(true);
      setSeverity("");
      setHost_id("");
      alert("Trigger added successfully!");
      onClose();
    } else {
      alert("Failed to add trigger. Please try again.");
    }
  };
  const StoreNewtrigger = async (
    trigger_name: string,
    host_id: string,
    severity: string,
    expression: string,
    ok_event_generation: string,
    recovery_expression: string,
    enabled: boolean
  ): Promise<boolean> => {
    try {
      const requestBody = {
        trigger_name,
        host_id,
        severity,
        expression,
        ok_event_generation,
        recovery_expression,
        enabled,
      };

      await axios.post("http://127.0.0.1:3000/trigger", requestBody);
      return true;
    } catch (error) {
      console.error("Error recording New Trigger:", error);
      return false;
    }
  };
  const validateForm = () => {
    const newErrors = {
      trigger_name: !trigger_name,
      host_id: !host_id,
      severity: !severity,
      expression: !expression,
      ok_eventGen: !ok_eventGen,
      recoveryExpression:
        ok_eventGen === "recovery expression" && !recoveryExpression,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  // Add error states for form validation
  const [errors, setErrors] = useState({
    trigger_name: false,
    host_id: false,
    severity: false,
    expression: false,
    ok_eventGen: false,
    recoveryExpression: false,
  });

  //Trigger
  const [trigger_name, setTrigger_name] = useState<string>("");

  //Hosts
  const [host_id, setHost_id] = useState<string>("");
  const [hosts, setHosts] = useState<Host[]>([]);
  const fetchHosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:3000/host");
      if (Array.isArray(response.data)) {
        setHosts(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setHosts(response.data.data);
      } else {
        console.error("Invalid host data format");
        setHosts([]);
      }
    } catch (error) {
      console.error("Error fetching hosts:", error);
      setHosts([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHosts();
  }, []);
  const isFormDisabled = !host_id;
  const handleHostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedHostId = event.target.value;
    setHost_id(selectedHostId);
    if (selectedHostId) {
      fetchItems(selectedHostId);
    } else {
      setItems([]);
    }
  };

  //items
  const [items, setItems] = useState<Item[]>([]);
  const fetchItems = async (hostId: string) => {
    if (!hostId) return;

    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:3000/host/${hostId}`);
      if (response.data.status === "success" && response.data.data) {
        const items = response.data.data.items;
        setItems(items); // Now we store the complete item objects
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Severity
  const [severity, setSeverity] = useState<string>("");

  //Expression
  const [expression, setExpression] = useState<string>("");

  // New state for dialog
  const [openDialogExpression, setOpenDialogExpression] = useState(false);
  const [searchTermExpression, setSearchTermExpression] = useState("");
  // Function to handle dialog open
  const handleOpenDialogExpression = () => {
    setOpenDialogExpression(true);
    setSearchTermExpression("");
  };
  // Function to handle dialog close
  const handleCloseDialogExpression = () => {
    setOpenDialogExpression(false);
  };
  // Function to handle item selection
  const handleItemSelectExpression = (itemName: string) => {
    setExpression((prev) => prev + (prev ? " " : "") + itemName);
    handleCloseDialogExpression();
  };
  const filteredItemsExpression = items.filter((item) =>
    item.item_name.toLowerCase().includes(searchTermExpression.toLowerCase())
  );

  //Recovery Expression
  const [ok_eventGen, setOk_eventGen] = useState<string>("");
  const [recoveryExpression, setRecoveryExpression] = useState<string>("");
  // New state for dialog
  const [openDialogRecoveryExpression, setOpenDialogRecoveryExpression] =
    useState(false);
  const [searchTermRecoveryExpression, setSearchTermRecoveryExpression] =
    useState("");
  // Function to handle dialog open
  const handleOpenDialogRecoveryExpression = () => {
    setOpenDialogRecoveryExpression(true);
    setSearchTermRecoveryExpression("");
  };
  // Function to handle dialog close
  const handleCloseDialogRecoveryExpression = () => {
    setOpenDialogRecoveryExpression(false);
  };
  // Function to handle item selection
  const handleItemSelectRecoveryExpression = (itemName: string) => {
    setRecoveryExpression((prev) => prev + (prev ? " " : "") + itemName);
    handleCloseDialogRecoveryExpression();
  };
  const filteredItemsRecoveryExpression = items.filter((item) =>
    item.item_name
      .toLowerCase()
      .includes(searchTermRecoveryExpression.toLowerCase())
  );

  //Enabled
  const [enabled, setEnabled] = useState<boolean>(true);

  return (
    <Box sx={{ width: "100%" }}>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: "#FFFFFB" }}>
        <Box
          component={"form"}
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
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
              error={errors.trigger_name}
              helperText={errors.trigger_name ? "Trigger name is required" : ""}
            />
          </Box>

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
              {hosts.map((host) => (
                <MenuItem key={host._id} value={host._id}>
                  {host.hostname}
                </MenuItem>
              ))}
            </TextField>
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
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                maxWidth: "calc(100% - 150px)",
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
                  variant={
                    severity === level.toLowerCase() ? "contained" : "outlined"
                  }
                  onClick={() => setSeverity(level.toLowerCase())}
                  disabled={isFormDisabled}
                  sx={{
                    fontSize: 12,
                    minWidth: "auto",
                    flex: "1 0 auto",
                    color: severity === level.toLowerCase() ? "white" : color,
                    backgroundColor:
                      severity === level.toLowerCase() ? color : "transparent",
                    borderColor: color,
                    "&:hover": {
                      backgroundColor:
                        severity === level.toLowerCase() ? color : `${color}22`,
                    },
                  }}
                >
                  {level}
                </Button>
              ))}
            </Box>
            {errors.severity && (
              <Typography color="error" sx={{ fontSize: 12, mt: 1 }}>
                Severity is required
              </Typography>
            )}
          </Box>

          {/* Expression field */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Expression
              </Typography>
            </Box>
            <TextField
              {...textFieldProps}
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              disabled={isFormDisabled}
              error={errors.expression}
              helperText={errors.expression ? "Expression is required" : ""}
              multiline
              rows={4}
              sx={{
                ...textFieldProps.sx,
                "& .MuiOutlinedInput-root": {
                  padding: "8px",
                },
              }}
            />
            <Button
              onClick={handleOpenDialogExpression}
              disabled={isFormDisabled}
              sx={{
                mt: 1,
                alignSelf: "flex-start",
                backgroundColor: "#4CAF50",
                color: "white",
                "&:hover": {
                  backgroundColor: "#45a049",
                },
                "&:disabled": {
                  backgroundColor: "#a5d6a7",
                  color: "#e8f5e9",
                },
                fontSize: 14,
                padding: "6px 16px",
              }}
            >
              Add Item
            </Button>
          </Box>

          {/* OK event generation */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                OK event generation
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                maxWidth: "calc(100% - 150px)",
              }}
            >
              {[
                { level: "Expression", color: "#808080" },
                { level: "Recovery expression", color: "#808080" },
                { level: "None", color: "#808080" },
              ].map(({ level, color }) => (
                <Button
                  key={level}
                  variant={
                    ok_eventGen === level.toLowerCase()
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setOk_eventGen(level.toLowerCase())}
                  disabled={isFormDisabled}
                  sx={{
                    fontSize: 12,
                    minWidth: "auto",
                    flex: "1 0 auto",
                    color:
                      ok_eventGen === level.toLowerCase() ? "white" : color,
                    backgroundColor:
                      ok_eventGen === level.toLowerCase()
                        ? color
                        : "transparent",
                    borderColor: color,
                    "&:hover": {
                      backgroundColor:
                        ok_eventGen === level.toLowerCase()
                          ? color
                          : `${color}22`,
                    },
                  }}
                >
                  {level}
                </Button>
              ))}
            </Box>
            {errors.severity && (
              <Typography color="error" sx={{ fontSize: 12, mt: 1 }}>
                OK event generation is required
              </Typography>
            )}
          </Box>

          {/* Recovery Expression field */}
          {ok_eventGen === "recovery expression" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
              >
                <Typography color="error" {...typographyProps}>
                  *
                </Typography>
                <Typography sx={{ ml: 1 }} {...typographyProps}>
                  Recovery Expression
                </Typography>
              </Box>
              <TextField
                {...textFieldProps}
                value={recoveryExpression}
                onChange={(e) => setRecoveryExpression(e.target.value)}
                disabled={isFormDisabled}
                error={errors.recoveryExpression}
                helperText={
                  errors.recoveryExpression
                    ? "Recovery Expression is required"
                    : ""
                }
                multiline
                rows={4}
                sx={{
                  ...textFieldProps.sx,
                  "& .MuiOutlinedInput-root": {
                    padding: "8px",
                  },
                }}
              />
              <Button
                onClick={handleOpenDialogRecoveryExpression}
                disabled={isFormDisabled}
                sx={{
                  mt: 1,
                  alignSelf: "flex-start",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#45a049",
                  },
                  "&:disabled": {
                    backgroundColor: "#a5d6a7",
                    color: "#e8f5e9",
                  },
                  fontSize: 14,
                  padding: "6px 16px",
                }}
              >
                Add Item
              </Button>
            </Box>
          )}

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
                    disabled={isFormDisabled}
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
        </Box>
      </Paper>

      {/* Dialog for item selection for Expression */}
      <Dialog open={openDialogExpression} onClose={handleCloseDialogExpression}>
        <DialogTitle>Select an Item</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search items..."
            value={searchTermExpression}
            onChange={(e) => setSearchTermExpression(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <List>
            {filteredItemsExpression.map((item) => (
              <ListItemButton
                key={item._id}
                onClick={() => handleItemSelectExpression(item.item_name)}
              >
                <ListItemText primary={item.item_name} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Dialog for item selection for Recovery Expression */}
      <Dialog
        open={openDialogRecoveryExpression}
        onClose={handleCloseDialogRecoveryExpression}
      >
        <DialogTitle>Select an Item</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search items..."
            value={searchTermRecoveryExpression}
            onChange={(e) => setSearchTermRecoveryExpression(e.target.value)}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <List>
            {filteredItemsRecoveryExpression.map((item) => (
              <ListItemButton
                key={item._id}
                onClick={() =>
                  handleItemSelectRecoveryExpression(item.item_name)
                }
              >
                <ListItemText primary={item.item_name} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AddTrigger;
