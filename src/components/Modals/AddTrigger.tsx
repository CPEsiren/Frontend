import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
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
import DeleteIcon from "@mui/icons-material/Delete";
import {
  ExpressionPart,
  RecoveryPart,
} from "../../interface/InterfaceCollection";

const functionofItem = [
  { value: "avg", label: "avg()" },
  { value: "min", label: "min()" },
  { value: "max", label: "max()" },
  { value: "last", label: "last()" },
];

const operators = [
  { value: "and", label: "AND" },
  { value: "or", label: "OR" },
];

const operations = [
  { value: ">", label: ">" },
  { value: ">=", label: ">=" },
  { value: "=", label: "=" },
  { value: "<", label: "<" },
  { value: "<=", label: "<=" },
];

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

  // Add new state for expression parts
  // Expression parts state
  const [expressionParts, setExpressionParts] = useState<ExpressionPart[]>([
    {
      item: "",
      operation: "",
      value: "",
      operator: "",
      functionofItem: "",
      duration: "",
    },
  ]);

  // Recovery parts state
  const [recoveryParts, setRecoveryParts] = useState<RecoveryPart[]>([
    {
      item: "",
      operation: "",
      value: "",
      operator: "",
      functionofItem: "",
      duration: "",
    },
  ]);

  // Update expression when parts change
  const handleExpressionPartChange = (
    index: number,
    field: keyof ExpressionPart,
    value: string
  ) => {
    const newParts = [...expressionParts];
    newParts[index] = { ...newParts[index], [field]: value };
    setExpressionParts(newParts);

    // Update the final expression
    const validParts = newParts.filter(
      (part) => part.item && part.operation && part.value && part.functionofItem
    );
    const newExpression = validParts
      .map((part, idx) => {
        // Format: functionofItem(item,duration) operation value
        const durationInMinutes = part.duration ? `${part.duration}m` : "";
        const functionCall = part.duration
          ? `${part.functionofItem}(${part.item},${durationInMinutes})`
          : `${part.functionofItem}(${part.item})`;
        const expr = `${functionCall} ${part.operation} ${part.value}`;
        return idx < validParts.length - 1
          ? `${expr} ${part.operator || "and"}`
          : expr;
      })
      .join(" ");
    setExpression(newExpression);
  };

  const handleRecoveryPartChange = (
    index: number,
    field: keyof RecoveryPart,
    value: string
  ) => {
    const newParts = [...recoveryParts];
    newParts[index] = { ...newParts[index], [field]: value };
    setRecoveryParts(newParts);

    // Update the final expression
    const validParts = newParts.filter(
      (part) => part.item && part.operation && part.value && part.functionofItem
    );
    const newRecovery = validParts
      .map((part, idx) => {
        // Format: functionofItem(item,duration) operation value
        const durationInMinutes = part.duration ? `${part.duration}m` : "";
        const functionCall = part.duration
          ? `${part.functionofItem}(${part.item},${durationInMinutes})`
          : `${part.functionofItem}(${part.item})`;
        const expr = `${functionCall} ${part.operation} ${part.value}`;
        return idx < validParts.length - 1
          ? `${expr} ${part.operator || "and"}`
          : expr;
      })
      .join(" ");
    setRecoveryExpression(newRecovery);
  };

  // Add new expression row
  const handleAddExpression = () => {
    setExpressionParts((prev) => [
      ...prev,
      { item: "", operation: "", value: "", functionofItem: "", duration: "" },
    ]);
  };

  // Add new recovery row
  const handleAddRecovery = () => {
    setRecoveryParts((prev) => [
      ...prev,
      { item: "", operation: "", value: "", functionofItem: "", duration: "" },
    ]);
  };

  // Remove expression row
  const handleRemoveExpression = (index: number) => {
    if (expressionParts.length > 1) {
      const newParts = expressionParts.filter((_, i) => i !== index);
      setExpressionParts(newParts);

      // Update the final expression
      const validParts = newParts.filter(
        (part) => part.item && part.operation && part.value
      );
      const newExpression = validParts
        .map((part) => `${part.item} ${part.operation} ${part.value}`)
        .join(" and ");
      setExpression(newExpression);
    }
  };

  // Remove recovery row
  const handleRemoveRecovery = (index: number) => {
    if (recoveryParts.length > 1) {
      const newParts = recoveryParts.filter((_, i) => i !== index);
      setRecoveryParts(newParts);

      // Update the final expression
      const validParts = newParts.filter(
        (part) => part.item && part.operation && part.value
      );
      const newRecovery = validParts
        .map((part) => `${part.item} ${part.operation} ${part.value}`)
        .join(" and ");
      setExpression(newRecovery);
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
      enabled,
      expressionParts,
      recoveryParts
    );

    if (success) {
      setTrigger_name("");
      setEnabled(true);
      setSeverity("");
      setHost_id("");
      setExpressionParts([
        {
          item: "",
          operation: "",
          value: "",
          operator: "",
          functionofItem: "",
          duration: "",
        },
      ]);
      setRecoveryParts([
        {
          item: "",
          operation: "",
          value: "",
          operator: "",
          functionofItem: "",
          duration: "",
        },
      ]);
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
    enabled: boolean,
    expressionParts: ExpressionPart[],
    recoveryParts: RecoveryPart[]
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
        // Store expressionParts as expressionPart in the model
        expressionPart: expressionParts.map((part) => ({
          item: part.item,
          operation: part.operation,
          value: part.value,
          operator: part.operator || "and",
          functionofItem: part.functionofItem,
          duration: part.duration,
        })),
        // Store recoveryParts as expressionRecoveryPart in the model
        expressionRecoveryPart: recoveryParts.map((part) => ({
          item: part.item,
          operation: part.operation,
          value: part.value,
          operator: part.operator || "and",
          functionofItem: part.functionofItem,
          duration: part.duration,
        })),
        userRole: localStorage.getItem("userRole"),
        userName: localStorage.getItem("username"),
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/trigger`, requestBody, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/host`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/host/${hostId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.status === "success" && response.data.data) {
        const items = response.data.data.items;
        setItems([
          { _id: 1, item_name: "Device Status" },
          { _id: 2, item_name: "Interface Admin Status" },
          { _id: 3, item_name: "Interface Oper Status" },
          ...items,
        ]); // Now we store the complete item objects
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
      <Paper elevation={0} sx={{ px: 3, backgroundColor: "#FFFFFB" }}>
        <Box
          component={"form"}
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            mt: 2,
          }}
        >
          <Box
            sx={{
              border: "2px solid rgb(232, 232, 232)",
              borderRadius: 3,
              p: 3,
              mb: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: "1.2rem",
                color: "black",
                fontWeight: "medium",
                width: "10%",
                mb: 2,
              }}
            >
              TRIGGER
            </Typography>
            {/* Trigger Name field */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
              >
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
                helperText={
                  errors.trigger_name ? "Trigger name is required" : ""
                }
              />
            </Box>

            {/* Host selection field */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
              >
                <Typography color="error" {...typographyProps}>
                  *
                </Typography>
                <Typography sx={{ ml: 1 }} {...typographyProps}>
                  Device
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
              >
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
                  gap: 1,
                }}
              >
                {[
                  { level: "Warning", color: "#FFA500" },
                  { level: "Critical", color: "#FF0000" },
                  { level: "Disaster", color: "#8B0000" },
                ].map(({ level, color }) => (
                  <Button
                    key={level}
                    variant={
                      severity === level.toLowerCase()
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() => setSeverity(level.toLowerCase())}
                    disabled={isFormDisabled}
                    sx={{
                      fontSize: 12,
                      minWidth: "auto",
                      flex: "1 0 auto",
                      color: severity === level.toLowerCase() ? "white" : color,
                      backgroundColor:
                        severity === level.toLowerCase()
                          ? color
                          : "transparent",
                      borderColor: color,
                      "&:hover": {
                        backgroundColor:
                          severity === level.toLowerCase()
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
                  Severity is required
                </Typography>
              )}
            </Box>

            {/* Expression field */}
            <Box sx={{ gap: 2, mb: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
              >
                <Typography color="error" {...typographyProps}>
                  *
                </Typography>
                <Typography sx={{ ml: 1, mr: 2 }} {...typographyProps}>
                  Expression
                </Typography>
                {!isFormDisabled ? (
                  <>
                    <Button
                      onClick={handleAddExpression}
                      disabled={isFormDisabled}
                      sx={{
                        color: "white",
                        textAlign: "center",
                        bgcolor: "#0281F2",
                        border: "1px solid #0281F2",
                        borderRadius: "8px",
                        gap: 1,
                        mt: 1,
                        mb: 1,
                      }}
                    >
                      + Expression
                    </Button>
                  </>
                ) : (
                  <></>
                )}
              </Box>

              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
              >
                {expressionParts.map((part, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      alignItems: "center",
                      width: 1,
                    }}
                  >
                    {/* functionofitem section */}
                    <TextField
                      select
                      value={part.functionofItem}
                      onChange={(e) =>
                        handleExpressionPartChange(
                          index,
                          "functionofItem",
                          e.target.value
                        )
                      }
                      disabled={isFormDisabled}
                      label="Function"
                      size="small"
                      sx={{
                        width: "10%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    >
                      {functionofItem.map((fn) => (
                        <MenuItem key={fn.value} value={fn.value}>
                          {fn.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    {/* Duration section */}
                    <TextField
                      value={part.duration}
                      onChange={(e) =>
                        handleExpressionPartChange(
                          index,
                          "duration",
                          e.target.value
                        )
                      }
                      disabled={isFormDisabled}
                      label="Duration"
                      size="small"
                      sx={{
                        width: "10%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    />

                    {/* Item Selection */}
                    <TextField
                      select
                      value={part.item}
                      onChange={(e) =>
                        handleExpressionPartChange(
                          index,
                          "item",
                          e.target.value
                        )
                      }
                      disabled={isFormDisabled}
                      error={errors.expression}
                      size="small"
                      label="Item"
                      sx={{
                        width: "40%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    >
                      {items.map((item) => (
                        <MenuItem key={item._id} value={item.item_name}>
                          {item.item_name}
                        </MenuItem>
                      ))}
                    </TextField>

                    {/* Operation Selection */}
                    <TextField
                      select
                      value={part.operation}
                      onChange={(e) =>
                        handleExpressionPartChange(
                          index,
                          "operation",
                          e.target.value
                        )
                      }
                      disabled={isFormDisabled}
                      label="Operation"
                      size="small"
                      sx={{
                        width: "10%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    >
                      {operations.map((op) => (
                        <MenuItem key={op.value} value={op.value}>
                          {op.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      value={part.value}
                      onChange={(e) =>
                        handleExpressionPartChange(
                          index,
                          "value",
                          e.target.value
                        )
                      }
                      disabled={isFormDisabled}
                      label="Value"
                      size="small"
                      sx={{
                        width: "10%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    />

                    {/* Operator Selection (show only if not the last row) */}
                    {index < expressionParts.length - 1 && (
                      <TextField
                        select
                        value={part.operator || "and"}
                        onChange={(e) =>
                          handleExpressionPartChange(
                            index,
                            "operator",
                            e.target.value
                          )
                        }
                        disabled={isFormDisabled}
                        label="Operator"
                        size="small"
                        sx={{
                          width: "8%",
                          backgroundColor: "white",
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                        }}
                      >
                        {operators.map((op) => (
                          <MenuItem key={op.value} value={op.value}>
                            {op.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}

                    {/* Remove button (only show for rows after the first) */}
                    {index > 0 && (
                      <IconButton
                        onClick={() => handleRemoveExpression(index)}
                        sx={{
                          fontSize: 12,
                          color: "red",
                          cursor: "pointer",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* OK event generation */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", minWidth: 150 }}
              >
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
                  gap: 1,
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
            {ok_eventGen === "recovery expression" && !isFormDisabled && (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    mt: -2,
                    mb: -1,
                  }}
                >
                  <Button
                    onClick={handleAddRecovery}
                    disabled={isFormDisabled}
                    sx={{
                      color: "white",
                      textAlign: "center",
                      bgcolor: "#0281F2",
                      border: "1px solid #0281F2",
                      borderRadius: "8px",
                      gap: 1,
                      mt: 2,
                      mb: 1,
                    }}
                  >
                    + Recovery Expression
                  </Button>
                </Box>
                {recoveryParts.map((part, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
                  >
                    {/* functionofitem section */}
                    <TextField
                      select
                      value={part.functionofItem}
                      onChange={(e) =>
                        handleRecoveryPartChange(
                          index,
                          "functionofItem",
                          e.target.value
                        )
                      }
                      disabled={isFormDisabled}
                      label="Function"
                      size="small"
                      sx={{
                        width: "10%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    >
                      {functionofItem.map((fn) => (
                        <MenuItem key={fn.value} value={fn.value}>
                          {fn.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      value={part.duration}
                      onChange={(e) =>
                        handleRecoveryPartChange(
                          index,
                          "duration",
                          e.target.value
                        )
                      }
                      disabled={isFormDisabled}
                      label="Duration"
                      size="small"
                      sx={{
                        width: "10%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    />

                    {/* Item Selection */}
                    <TextField
                      select
                      value={part.item}
                      onChange={(e) =>
                        handleRecoveryPartChange(index, "item", e.target.value)
                      }
                      disabled={isFormDisabled}
                      error={errors.expression}
                      size="small"
                      label="Item"
                      sx={{
                        width: "40%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    >
                      {items.map((item) => (
                        <MenuItem key={item._id} value={item.item_name}>
                          {item.item_name}
                        </MenuItem>
                      ))}
                    </TextField>

                    {/* Operation Selection */}
                    <TextField
                      select
                      value={part.operation}
                      onChange={(e) =>
                        handleRecoveryPartChange(
                          index,
                          "operation",
                          e.target.value
                        )
                      }
                      disabled={isFormDisabled}
                      label="Operation"
                      size="small"
                      sx={{
                        width: "10%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    >
                      {operations.map((op) => (
                        <MenuItem key={op.value} value={op.value}>
                          {op.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      value={part.value}
                      onChange={(e) =>
                        handleRecoveryPartChange(index, "value", e.target.value)
                      }
                      disabled={isFormDisabled}
                      label="Value"
                      size="small"
                      sx={{
                        width: "10%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    />

                    {/* Operator Selection (show only if not the last row) */}
                    {index < recoveryParts.length - 1 && (
                      <TextField
                        select
                        value={part.operator || "and"}
                        onChange={(e) =>
                          handleRecoveryPartChange(
                            index,
                            "operator",
                            e.target.value
                          )
                        }
                        disabled={isFormDisabled}
                        label="Operator"
                        size="small"
                        sx={{
                          width: "8%",
                          backgroundColor: "white",
                          "& .MuiInputBase-input": {
                            fontSize: 14,
                          },
                        }}
                      >
                        {operators.map((op) => (
                          <MenuItem key={op.value} value={op.value}>
                            {op.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}

                    {/* Remove button (only show for rows after the first) */}
                    {index > 0 && (
                      <IconButton
                        onClick={() => handleRemoveRecovery(index)}
                        sx={{
                          fontSize: 12,
                          color: "red",
                          cursor: "pointer",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
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
            </Box>
          </Box>
          {/* Button section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 2,
              mb: 1,
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={onClose}
              sx={{
                fontSize: 14,
                color: "black",
                borderColor: "#B9B9B9",
                borderRadius: 2,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outlined"
              disabled={isFormDisabled}
              sx={{
                fontSize: 14,
                color: "white",
                bgcolor: "#0281F2",
                borderColor: "white",
                borderRadius: 2,
                "&:hover": {
                  color: "white",
                  bgcolor: "#0274d9",
                  borderColor: "white",
                },
              }}
            >
              Add
            </Button>
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
