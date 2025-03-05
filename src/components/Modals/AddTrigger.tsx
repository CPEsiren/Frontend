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
  ListSubheader,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import axios from "axios";
import { SearchIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  ExpressionPart,
  ITrigger,
  RecoveryPart,
} from "../../interface/InterfaceCollection";
import { InfoOutlined } from "@mui/icons-material";

const functionofItem = [
  { value: "avg", label: "Average" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
  { value: "last", label: "Latest" },
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
  hostgroup: string;
  ip_address: string;
  items: Item[];
}

interface IGroupHost {
  [key: string]: Host[];
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
  onSuccess?: (message: string, refreshCallback?: () => void) => void;
  Trigger: ITrigger | null;
}

const AddTrigger: React.FC<AddTriggerProps> = ({
  onClose,
  onSuccess,
  Trigger,
}) => {
  //Global state
  const typographyProps = {
    fontSize: 14,
  };
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

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // Update expression when parts change
  const handleExpressionPartChange = (
    index: number,
    field: keyof ExpressionPart,
    value: string
  ) => {
    const newParts = [...expressionParts];
    if ("functionofItem" === field && value === "last") {
      newParts[index] = {
        ...newParts[index],
        [field]: value,
        ["duration"]: "",
      };
    } else {
      newParts[index] = { ...newParts[index], [field]: value };
    }

    setExpressionParts(newParts);

    // Update the final expression
    const validParts = newParts.filter(
      (part) => part.item && part.operation && part.value && part.functionofItem
    );
    const newExpression = validParts
      .map((part, idx) => {
        // Format: functionofItem(item,duration) operation value
        const durationInMinutes =
          part.functionofItem === "last" ? "" : `${part.duration}`;
        const functionCall =
          part.functionofItem !== "last"
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
    if ("functionofItem" === field && value === "last") {
      newParts[index] = {
        ...newParts[index],
        [field]: value,
        ["duration"]: "",
      };
    } else {
      newParts[index] = { ...newParts[index], [field]: value };
    }
    setRecoveryParts(newParts);

    // Update the final expression
    const validParts = newParts.filter(
      (part) => part.item && part.operation && part.value && part.functionofItem
    );
    const newRecovery = validParts
      .map((part, idx) => {
        // Format: functionofItem(item,duration) operation value
        const durationInMinutes =
          part.functionofItem === "last" ? "" : `${part.duration}`;
        const functionCall =
          part.functionofItem !== "last"
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
      // Check which validation failed and show appropriate message
      const expressionMissing = expressionParts.some(
        (part) =>
          !part.item ||
          !part.operation ||
          !part.value ||
          !part.functionofItem ||
          (part.functionofItem !== "last" && !part.duration)
      );

      const recoveryMissing =
        ok_eventGen === "resolved expression" &&
        recoveryParts.some(
          (part) =>
            !part.item ||
            !part.operation ||
            !part.value ||
            !part.functionofItem ||
            (part.functionofItem !== "last" && !part.duration)
        );

      let errorMessage = "Please fill in all required fields";

      if (expressionMissing) {
        errorMessage =
          "All expression fields are required. Please complete all expression fields.";
      } else if (recoveryMissing) {
        errorMessage =
          "All recovery expression fields are required. Please complete all recovery expression fields.";
      }

      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
      recoveryParts,
      ThresholdBreachDuration
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
      const successMessage = `Trigger: ${trigger_name} successfully added`;

      // Call onSuccess with a simple success message (not using REFRESH keyword)
      if (onSuccess) {
        onSuccess(successMessage);
      } else {
        // Show success message in the snackbar
        setSnackbarMessage(successMessage);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }

      // Close the modal after calling onSuccess
      onClose();
    } else {
      setSnackbarMessage("Failed to add triggers. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
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
    recoveryParts: RecoveryPart[],
    ThresholdBreachDuration: number
  ): Promise<boolean> => {
    try {
      const requestBody = {
        trigger_name,
        host_id,
        severity,
        expression,
        ok_event_generation,
        recovery_expression,
        thresholdDuration: ThresholdBreachDuration,
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
    // First check the basic form fields
    const basicFieldsValid = {
      trigger_name: !trigger_name,
      host_id: !host_id,
      severity: !severity,
      ok_eventGen: !ok_eventGen,
    };

    // Check if all expression parts have the required fields
    const expressionPartsValid = expressionParts.every((part) => {
      return (
        part.item &&
        part.operation &&
        part.value &&
        part.functionofItem &&
        (part.functionofItem === "last" || part.duration)
      );
    });

    // Check if all recovery expression parts have the required fields (when ok_eventGen is "resolved expression")
    const recoveryPartsValid =
      ok_eventGen !== "resolved expression" ||
      recoveryParts.every((part) => {
        return (
          part.item &&
          part.operation &&
          part.value &&
          part.functionofItem &&
          (part.functionofItem === "last" || part.duration)
        );
      });

    // Update the errors state
    setErrors({
      ...basicFieldsValid,
      expression: !expressionPartsValid,
      recoveryExpression:
        ok_eventGen === "resolved expression" && !recoveryPartsValid,
    });

    // Form is valid only if all basic fields and all expression parts are valid
    return (
      !Object.values(basicFieldsValid).some((error) => error) &&
      expressionPartsValid &&
      recoveryPartsValid
    );
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
  const [hostgroupHosts, setHostgroupHosts] = useState<IGroupHost>({});
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
    // Group hosts by hostgroup
    const groupHosts: IGroupHost = {};
    hosts.forEach((host: Host) => {
      if (!groupHosts[host.hostgroup]) {
        groupHosts[host.hostgroup] = [];
      }
      groupHosts[host.hostgroup].push(host);
    });

    setHostgroupHosts(groupHosts);
  }, [hosts]);

  useEffect(() => {
    fetchHosts();

    if (Trigger) {
      fetchItems(Trigger.host_id);
      setTrigger_name(Trigger.trigger_name);
      setEnabled(Trigger.enabled);
      setSeverity(Trigger.severity);
      setHost_id(Trigger.host_id);
      setExpression(Trigger.expression);
      setRecoveryExpression(Trigger.recovery_expression);
      setExpressionParts(Trigger.expressionPart);
      setRecoveryParts(Trigger.expressionRecoveryPart);
      setOk_eventGen(Trigger.ok_event_generation);
    }
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
        setItems([...items]); // Now we store the complete item objects
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  //Threshold Breach Duration
  const [ThresholdBreachDuration, setThresholdBreachDuration] =
    useState<number>(0);

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
  const [isFormValid, setIsFormValid] = useState(false);

  // Create a validation function to check all required fields
  const validateFormSubmit = useCallback(() => {
    // Check all required fields
    const isBasicInfoValid =
      trigger_name.trim() !== "" &&
      host_id.trim() !== "" &&
      severity !== "" &&
      ok_eventGen !== "";

    // Check if all expression parts are filled out properly
    const areExpressionPartsValid = expressionParts.every(
      (part) =>
        part.item &&
        part.operation &&
        part.value &&
        part.functionofItem &&
        (part.functionofItem === "last" || part.duration)
    );

    // If OK event generation is "resolved expression", check recovery parts too
    const areRecoveryPartsValid =
      ok_eventGen !== "resolved expression" ||
      recoveryParts.every(
        (part) =>
          part.item &&
          part.operation &&
          part.value &&
          part.functionofItem &&
          (part.functionofItem === "last" || part.duration)
      );

    return isBasicInfoValid && areExpressionPartsValid && areRecoveryPartsValid;
  }, [
    trigger_name,
    host_id,
    severity,
    ok_eventGen,
    expressionParts,
    recoveryParts,
  ]);

  // Update form validity whenever relevant fields change
  useEffect(() => {
    setIsFormValid(validateFormSubmit());
  }, [
    trigger_name,
    host_id,
    severity,
    ok_eventGen,
    expressionParts,
    recoveryParts,
    validateFormSubmit,
  ]);

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
                sx={{
                  minWidth: 200,
                  backgroundColor: "white",
                  "& .MuiSelect-select": {
                    fontSize: 14,
                  },
                }}
              >
                {Object.entries(hostgroupHosts).map(([category, hosts]) => [
                  <ListSubheader
                    key={category}
                    sx={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "text.secondary",
                      backgroundColor: "background.paper",
                      lineHeight: "36px",
                      borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    {category}
                  </ListSubheader>,
                  ...hosts.map((host: Host) => (
                    <MenuItem
                      key={host._id}
                      value={host._id}
                      sx={{
                        fontSize: 14,
                        pl: 4,
                        py: 1,
                        "&.Mui-selected": {
                          backgroundColor: "action.selected",
                          "&:hover": { backgroundColor: "action.hover" },
                        },
                      }}
                    >
                      {host.hostname}
                    </MenuItem>
                  )),
                ])}
              </TextField>
            </Box>

            {/* Threshold Breach Duration selection field */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  minWidth: 150,
                  width: "14%",
                }}
              >
                <Typography color="error" {...typographyProps}>
                  *
                </Typography>
                <Typography sx={{ ml: 1 }} {...typographyProps}>
                  Threshold Breach Duration
                </Typography>
              </Box>
              <TextField
                select
                value={ThresholdBreachDuration}
                onChange={(e) =>
                  setThresholdBreachDuration(parseInt(e.target.value))
                }
                disabled={isFormDisabled}
                size="small"
                sx={{
                  backgroundColor: "white",
                  "&.MuiInputBase-input": {
                    fontSize: 14,
                  },
                }}
              >
                <MenuItem value={0}>Real-Time</MenuItem>
                {[...Array(6)].map((_, index) => (
                  <MenuItem key={index + 1} value={(index * 5 + 5) * 60 * 1000}>
                    {index * 5 + 5} minute.
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
                <Typography sx={{ ml: 1, mr: 1 }} {...typographyProps}>
                  Severity
                </Typography>
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="#FFA500"
                        >
                          Warning
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ ml: 1, fontSize: 13 }}
                        >
                          Moderate - Requires Monitoring
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            display: "block",
                            color: "text.secondary",
                            mt: 0.5,
                          }}
                        >
                          There is a potential issue, but it has not yet
                          directly impacted network operations. Monitoring is
                          required, and preventive action may be needed to
                          prevent escalation.
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 1.5 }}>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="#FF0000"
                        >
                          Critical
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ ml: 1, fontSize: 13 }}
                        >
                          Severe - Immediate Action Required
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            display: "block",
                            color: "text.secondary",
                            mt: 0.5,
                          }}
                        >
                          The issue is affecting network operations, potentially
                          causing service disruptions or failures. Immediate
                          action is required to minimize damage.
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="#8B0000"
                        >
                          Disaster
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ ml: 1, fontSize: 13 }}
                        >
                          Catastrophic - Full System Failure
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 1,
                            display: "block",
                            color: "text.secondary",
                            mt: 0.5,
                          }}
                        >
                          The network or system has completely failed, severely
                          impacting the organization or business. Emergency
                          disaster recovery measures must be implemented
                          immediately.
                        </Typography>
                      </Box>
                    </Box>
                  }
                  arrow
                  placement="right"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: "white",
                        color: "black",
                        maxWidth: "350px",
                        boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
                        borderRadius: "8px",
                        p: 1.5,
                      },
                    },
                  }}
                >
                  <IconButton>
                    <InfoOutlined sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
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
                      onChange={(e) => {
                        handleExpressionPartChange(
                          index,
                          "functionofItem",
                          e.target.value
                        );
                      }}
                      disabled={isFormDisabled}
                      label="Function"
                      size="small"
                      error={errors.expression && !part.functionofItem}
                      required
                      sx={{
                        width: "12%",
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
                      disabled={
                        isFormDisabled || part.functionofItem === "last"
                      }
                      required={part.functionofItem !== "last"}
                      error={
                        errors.expression &&
                        part.functionofItem !== "last" &&
                        !part.duration
                      }
                      select
                      label="Interval"
                      size="small"
                      sx={{
                        width: "11%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    >
                      <MenuItem value="1m">1m</MenuItem>
                      <MenuItem value="5m">5m</MenuItem>
                      <MenuItem value="10m">10m</MenuItem>
                      <MenuItem value="15m">15m</MenuItem>
                      <MenuItem value="30m">30m</MenuItem>
                      <MenuItem value="1h">1h</MenuItem>
                    </TextField>

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
                      error={errors.expression && !part.item}
                      required
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
                      error={errors.expression && !part.operation}
                      required
                      label="Operation"
                      size="small"
                      sx={{
                        width: "13%",
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
                      error={errors.expression && !part.value}
                      required
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
                        error={errors.expression && !part.operator}
                        required
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
                          // "&:hover": {
                          //   textDecoration: "underline",
                          // },
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
                  { level: "Resolved expression", color: "#808080" },
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
            {ok_eventGen === "resolved expression" && !isFormDisabled && (
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
                    + Resolved Expression
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
                      error={errors.recoveryExpression && !part.functionofItem}
                      required
                      label="Function"
                      size="small"
                      sx={{
                        width: "12%",
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
                      select
                      value={part.duration}
                      onChange={(e) =>
                        handleRecoveryPartChange(
                          index,
                          "duration",
                          e.target.value
                        )
                      }
                      disabled={
                        isFormDisabled || part.functionofItem === "last"
                      }
                      required={part.functionofItem !== "last"}
                      error={
                        errors.recoveryExpression &&
                        part.functionofItem !== "last" &&
                        !part.duration
                      }
                      label="Interval"
                      size="small"
                      sx={{
                        width: "11%",
                        backgroundColor: "white",
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    >
                      <MenuItem value="15m">15m</MenuItem>
                      <MenuItem value="30m">30m</MenuItem>
                      <MenuItem value="1h">1h</MenuItem>
                    </TextField>

                    {/* Item Selection */}
                    <TextField
                      select
                      value={part.item}
                      onChange={(e) =>
                        handleRecoveryPartChange(index, "item", e.target.value)
                      }
                      disabled={isFormDisabled}
                      error={errors.recoveryExpression && !part.item}
                      required
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
                      error={errors.recoveryExpression && !part.operation}
                      required
                      label="Operation"
                      size="small"
                      sx={{
                        width: "13%",
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
                      error={errors.recoveryExpression && !part.value}
                      required
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
                        error={errors.recoveryExpression && !part.operator}
                        required
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
                          // "&:hover": {
                          //   textDecoration: "underline",
                          // },
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
              disabled={isFormDisabled || !isFormValid}
              sx={{
                fontSize: 14,
                color: "white",
                bgcolor: isFormDisabled || !isFormValid ? "#cccccc" : "#0281F2",
                borderColor: "white",
                borderRadius: 2,
                "&:hover": {
                  color: "white",
                  bgcolor:
                    isFormDisabled || !isFormValid ? "#cccccc" : "#0274d9",
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
