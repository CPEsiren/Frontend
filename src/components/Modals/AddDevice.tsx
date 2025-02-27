import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Paper,
  Tabs,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
} from "@mui/material";
import useWindowSize from "../../hooks/useWindowSize";
import axios from "axios";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Pagination, Fade } from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import { Router, Package } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";

interface AddDeviceProps {
  onClose: () => void;
  onSuccess?: (message: string, refreshCallback?: () => void) => void;
}

interface DeviceDetails {
  location: string;
  description: string;
}

interface DeviceItems {
  id: number;
  item_name: string;
  oid: string;
  type: string;
  unit: string;
  interval: number;
}

interface TemplateItem {
  item_name: string;
  type: string;
  unit: string;
  _id: string;
  oid?: string;
  interval: number;
}

interface Template {
  _id: string;
  template_name: string;
  items: TemplateItem[];
  description: string;
}
const AddDevice: React.FC<AddDeviceProps> = ({ onClose, onSuccess }) => {
  const windowSize = useWindowSize();
  const [hostname, sethostname] = useState<string>("");
  const [ip_address, setip_address] = useState<string>("");
  const [snmp_port, setsnmp_port] = useState<string>("");
  const [snmp_version, setsnmp_version] = useState<string>("");
  const [snmp_community, setsnmp_community] = useState<string>("");
  const [hostgroup, sethostgroup] = useState<string>("");
  const [templates, settemplates] = useState<string>("");
  const [details_location, setdetails_location] = useState<string>("");
  const [details_description, setdetails_description] = useState<string>("");
  const [tabvalue, setTabvalue] = React.useState("host"); //Tabview

  // About SNMPv3
  const [V3Username, setV3Username] = useState<string>("");
  const [SecurLevel, setSecurLevel] = useState<string>("");
  const [authenProtocol, setAuthenProtocol] = useState<string>("");
  const [authenPass, setAuthenPass] = useState<string>("");
  const [privacyProtocol, setPrivacyProtocol] = useState<string>("");
  const [privacyPass, setPrivacyPass] = useState<string>("");
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // const [currentTab, setCurrentTab] = useState("host");

  const [templateOptions, setTemplateOptions] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  //Scan interfacs
  const [ScanInterfacepage, setScanInterfacepage] = useState(1);
  const itemsPerScanInterfacepage = 10;
  const [isTransitioning, setIsTransitioning] = useState(false);
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 100); // Match this with the Fade timeout
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);
  const handleChangeScanInterfacepage = (
    event: React.ChangeEvent<unknown>,
    newScanInterfacepage: number
  ) => {
    setIsTransitioning(true);
    setScanInterfacepage(newScanInterfacepage);
  };

  // Function to handle template selection
  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTemplateId = e.target.value;
    settemplates(selectedTemplateId);

    // Find the selected template
    const selectedTemplate = templateOptions.find(
      (temp) => temp._id === selectedTemplateId
    );

    if (selectedTemplate && selectedTemplate.items.length > 0) {
      // Convert template items to the DeviceItems format
      const newItems = selectedTemplate.items.map((item, index) => ({
        id: index + 1,
        item_name: item.item_name,
        oid: item.oid || "",
        type: item.type,
        unit: item.unit,
        interval: item.interval,
      }));

      setItemRows(newItems);
      // Optionally switch to items tab
      setTabvalue("item");
    } else {
      // Reset to default single empty row if no items
      setItemRows([
        {
          id: 1,
          item_name: "",
          oid: "",
          type: "",
          unit: "",
          interval: 10,
        },
      ]);
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/template`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTemplateOptions(response.data.data);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setTemplateOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const [itemRows, setItemRows] = useState<DeviceItems[]>([
    {
      id: 1,
      item_name: "",
      oid: "",
      type: "",
      unit: "",
      interval: 10,
      // history: "",
      // trend: "",
    },
  ]);

  const paginatedItems = itemRows.slice(
    (ScanInterfacepage - 1) * itemsPerScanInterfacepage,
    ScanInterfacepage * itemsPerScanInterfacepage
  );

  const handleAddRow = () => {
    const newRow: DeviceItems = {
      id: itemRows.length + 1,
      item_name: "",
      oid: "",
      type: "",
      unit: "",
      interval: 10,
      // history: "",
      // trend: "",
    };
    setItemRows([...itemRows, newRow]);
  };

  // const handleTabChange = (event, newValue) => {
  //   setCurrentTab(newValue);
  // }
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabvalue(newValue);
  };

  const handleDeleteRow = (id: number) => {
    if (itemRows.length > 1) {
      setItemRows(itemRows.filter((row) => row.id !== id));
    }
  };

  const handleItemChange = (
    id: number,
    field: keyof DeviceItems,
    value: string
  ) => {
    setItemRows(
      itemRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const details = {
    location: details_location,
    description: details_description,
  };

  const handleVersionChange = (event: SelectChangeEvent) => {
    setsnmp_version(event.target.value);

    if (event.target.value === "SNMPv2" || event.target.value === "SNMPv1") {
      setV3Username("");
      setSecurLevel("");
      setAuthenProtocol("");
      setAuthenPass("");
      setPrivacyProtocol("");
      setPrivacyPass("");
    }
  };

  const StoreNewhost = async (
    hostname: string,
    ip_address: string,
    snmp_port: string,
    snmp_version: string,
    snmp_community: string,
    hostgroup: string,
    templates: string,
    details: DeviceDetails
  ): Promise<boolean> => {
    try {
      // Create request body
      const requestBody: any = {
        hostname,
        ip_address,
        snmp_port,
        snmp_version,
        snmp_community,
        hostgroup,
        templates,
        details,
        authenV3: {
          username: V3Username,
          securityLevel: SecurLevel,
          authenProtocol: authenProtocol,
          authenPass: authenPass,
          privacyProtocol: privacyProtocol,
          privacyPass: privacyPass,
        },
        userRole: localStorage.getItem("userRole"),
        userName: localStorage.getItem("username"),
      };

      // Only add items to request if they have data
      const filledItems = itemRows.filter(
        (item) => item.item_name || item.oid || item.type || item.unit
      );

      if (filledItems.length > 0) {
        requestBody.items = filledItems;
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/host`, requestBody, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return true;
    } catch (error) {
      console.error("Error recording New Host:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await StoreNewhost(
      hostname,
      ip_address,
      snmp_port,
      snmp_version,
      snmp_community,
      hostgroup,
      templates,
      details
    );
    if (success) {
      // Reset form fields
      sethostname("");
      setip_address("");
      setsnmp_port("");
      setsnmp_version("");
      setsnmp_community("");
      sethostgroup("");
      settemplates("");
      setdetails_location("");
      setdetails_description("");
      setItemRows([
        {
          id: 1,
          item_name: "",
          oid: "",
          type: "",
          unit: "",
          interval: 0,
        },
      ]);

      // Close the modal - we'll let the parent component handle this
      // onClose();

      // Trigger the success callback in the parent component
      if (onSuccess) {
        onSuccess(`Device "${hostname}" successfully added. REFRESH`, () => {
          window.location.reload();
        });
      }
    } else {
      // Show error alert
      alert("Failed to add device. Please try again.");
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

  // Add new function to handle interface scanning
  const handleScanInterface = async () => {
    if (!ip_address || !snmp_port || !snmp_version || !snmp_community) {
      alert("Please fill in all SNMP interface details before scanning");
      setTabvalue("host"); // Switch back to host tab if details are missing
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/item/interface`,
        {
          ip_address: ip_address,
          port: snmp_port,
          version: snmp_version,
          community: snmp_community,
          authenV3: {
            username: V3Username,
            securityLevel: SecurLevel,
            authenProtocol: authenProtocol,
            authenPass: authenPass,
            privacyProtocol: privacyProtocol,
            privacyPass: privacyPass,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        // Convert the interface data to the DeviceItems format
        const interfaceItems = response.data.data.map(
          (item: any, index: number) => ({
            id: index + 1,
            item_name: item.item_name || "",
            oid: item.oid || "",
            type: item.type || "",
            unit: item.unit || "",
            interval: item.interval || 0,
          })
        );

        // Combine existing items with new interface items
        const combinedItems = [...itemRows, ...interfaceItems];

        // Assign new IDs to ensure uniqueness
        const updatedItems = combinedItems.map((item, index) => ({
          ...item,
          id: index + 1,
        }));

        // Update the item rows with the scanned interface data
        setItemRows(updatedItems);

        // Switch to items tab to show the results
        setTabvalue("item");
      } else {
        alert("No interface data found");
      }
    } catch (error) {
      console.error("Error scanning interfaces:", error);
      alert(
        "Failed to scan interfaces. Please check your SNMP details and try again."
      );
    }
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
      <Box sx={{ p: 0, width: "100%" }}>
        {windowSize.width > 600 && (
          <Box
            sx={{ display: "flex", justifyContent: "flex-start", mb: 0, mt: 1 }}
          />
        )}
        {/* <form onSubmit={handleSubmit}  > */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TabContext value={tabvalue}>
            <Box
              sx={{ borderBottom: "1px solid #a9a9a9", borderColor: "divider" }}
            >
              <TabList
                sx={{
                  minHeight: 0,
                  "& .MuiTabs-indicator": {
                    display: "none",
                  },
                  "& .MuiTabs-flexContainer": {
                    borderBottom: "none",
                  },
                }}
                onChange={handleChange}
                aria-label="Tabview"
              >
                <Tab
                  sx={{
                    ml: 2,
                    minHeight: 0,
                    color: "black",
                    borderBottom: "none",
                    "&.Mui-selected": {
                      color: "#0281F2",
                      fontWeight: "bold",
                      outline: "none",
                      border: "none",
                      borderBottom: "3px solid #0281F2",
                      boxShadow: "none",
                    },
                    "&:focus": {
                      outline: "none",
                    },
                    "&::after": {
                      display: "none",
                    },
                  }}
                  icon={<Router size={18} />}
                  iconPosition="start"
                  label="DEVICE"
                  value="host"
                  disableRipple
                />
                <Tab
                  sx={{
                    minHeight: 0,
                    color: "black",
                    borderBottom: "none",
                    "&.Mui-selected": {
                      color: "#0281F2",
                      fontWeight: "bold",
                      outline: "none",
                      border: "none",
                      borderBottom: "2px solid #0281F2",
                      boxShadow: "none",
                    },
                    "&:focus": {
                      outline: "none",
                    },
                    "&::after": {
                      display: "none",
                    },
                  }}
                  icon={<Package size={18} />}
                  iconPosition="start"
                  label="Items"
                  value="item"
                  disableRipple
                />
              </TabList>
            </Box>
            <Box>
              <Box>
                <TabPanel value="host">
                  <Paper
                    elevation={0}
                    sx={{ p: 0, backgroundColor: "#FFFFFB", mt: -2 }}
                  >
                    <Box>
                      <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                          display: "flex",
                          bgcolor: "white",
                          flexDirection: "column",
                          gap: 0,
                          p: 3,
                          border: "2px solid rgb(232, 232, 232)",
                          borderRadius: 3,
                          mb: 3,
                        }}
                      >
                        <Typography
                          sx={{
                            mb: 2,
                            fontSize: "1.2rem",
                            color: "black",
                            fontWeight: "medium",
                          }}
                          {...typographyProps}
                        >
                          DEVICE
                        </Typography>
                        {/* <Box sx={{ borderTop: "2px solid #d9d9d9", mb: 3 }} /> */}

                        {/* Host Section */}
                        <Box
                          sx={{ display: "flex", flexDirection: "row", gap: 2 }}
                        >
                          <Box sx={{ textAlign: "right", mt: 1, width: "20%" }}>
                            <Box
                              sx={{ display: "flex", justifyContent: "right" }}
                            >
                              <Typography
                                sx={{ fontSize: 14, color: "red", mr: 1 }}
                              >
                                *
                              </Typography>
                              <Typography sx={{ fontSize: 14 }}>
                                Device's name
                              </Typography>
                            </Box>
                            <Typography sx={{ fontSize: 14, mt: 4 }}>
                              Templates
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "right",
                                mt: 4,
                              }}
                            >
                              <Typography
                                sx={{ fontSize: 14, color: "red", mr: 1 }}
                              >
                                *
                              </Typography>
                              <Typography sx={{ fontSize: 14 }}>
                                Host groups
                              </Typography>
                            </Box>
                            <Typography sx={{ fontSize: 14, mt: 4.5 }}>
                              Description
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "left", width: "50%" }}>
                            <TextField
                              {...textFieldProps}
                              value={hostname}
                              onChange={(e) => sethostname(e.target.value)}
                              sx={{
                                mb: 2,
                                width: 1,
                                "& .MuiInputBase-input": {
                                  fontSize: 14,
                                },
                              }}
                            />
                            <TextField
                              {...textFieldProps}
                              select
                              value={templates}
                              onChange={handleTemplateChange}
                              disabled={loading}
                              sx={{
                                mb: 2,
                                width: 1,
                                "& .MuiInputBase-input": {
                                  fontSize: 14,
                                },
                              }}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {templateOptions.map((template) => (
                                <MenuItem
                                  key={template._id}
                                  value={template._id}
                                >
                                  {template.template_name}
                                </MenuItem>
                              ))}
                            </TextField>
                            <TextField
                              {...textFieldProps}
                              value={hostgroup}
                              onChange={(e) => sethostgroup(e.target.value)}
                              sx={{
                                mb: 2,
                                width: 1,
                                "& .MuiInputBase-input": {
                                  fontSize: 14,
                                },
                              }}
                            />
                            <TextField
                              multiline
                              rows={3}
                              {...textFieldProps}
                              value={details_description}
                              onChange={(e) =>
                                setdetails_description(e.target.value)
                              }
                              sx={{
                                width: 1,
                                "& .MuiInputBase-input": {
                                  fontSize: 14,
                                },
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              textAlign: "left",
                              display: "flex",
                              flexDirection: "column",
                              gap: 2.5,
                            }}
                          ></Box>
                        </Box>
                      </Box>
                      {/* Interface Section */}
                      <Box
                        sx={{
                          p: 3,
                          border: "2px solid rgb(232, 232, 232)",
                          borderRadius: 3,
                          mb: 2,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "1.2rem",
                            color: "black",
                            fontWeight: "medium",
                            mb: 2,
                          }}
                          {...typographyProps}
                        >
                          SNMP INTERFACE
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            // mt: 2,
                            // backgroundColor: "#ebf1ff",
                            // borderRadius: 2,
                            // border: "4px solid #ebf1ff",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              gap: 2,
                              mt: 0,
                              // mb: 3,
                            }}
                          >
                            <Box
                              sx={{ textAlign: "right", mt: 1, width: "20%" }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "right",
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: 14, color: "red", mr: 1 }}
                                >
                                  *
                                </Typography>
                                <Typography sx={{ fontSize: 14 }}>
                                  IP address
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "right",
                                  mt: 4,
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: 14, color: "red", mr: 1 }}
                                >
                                  *
                                </Typography>
                                <Typography sx={{ fontSize: 14 }}>
                                  SNMP version
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display:
                                    snmp_version === "SNMPv1" ||
                                    snmp_version === "SNMPv2"
                                      ? "flex"
                                      : "none",
                                  justifyContent: "right",
                                  mt: 4,
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: 14, color: "red", mr: 1 }}
                                >
                                  *
                                </Typography>
                                <Typography sx={{ fontSize: 14 }}>
                                  SNMP community
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display:
                                    snmp_version === "SNMPv3" ? "flex" : "none",
                                  justifyContent: "right",
                                  mt: 4,
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: 14, color: "red", mr: 1 }}
                                >
                                  *
                                </Typography>
                                <Typography sx={{ fontSize: 14 }}>
                                  Username
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display:
                                    snmp_version === "SNMPv3" ? "flex" : "none",
                                  justifyContent: "right",
                                  mt: 4,
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: 14, color: "red", mr: 1 }}
                                >
                                  *
                                </Typography>
                                <Typography sx={{ fontSize: 14, mt: 0.3 }}>
                                  Security Level
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display:
                                    SecurLevel === "authNoPriv" ||
                                    SecurLevel === "authPriv"
                                      ? "flex"
                                      : "none",
                                  justifyContent: "right",
                                  mt: 4,
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: 14, color: "red", mr: 1 }}
                                >
                                  *
                                </Typography>
                                <Typography sx={{ fontSize: 14, mt: 0.1 }}>
                                  Authen Protocol
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display:
                                    SecurLevel === "authNoPriv" ||
                                    SecurLevel === "authPriv"
                                      ? "flex"
                                      : "none",
                                  justifyContent: "right",
                                  mt: 4,
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: 14, color: "red", mr: 1 }}
                                >
                                  *
                                </Typography>
                                <Typography sx={{ fontSize: 14 }}>
                                  Authen Passphrase
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display:
                                    SecurLevel === "authPriv" ? "flex" : "none",
                                  justifyContent: "right",
                                  mt: 4,
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: 14, color: "red", mr: 1 }}
                                >
                                  *
                                </Typography>
                                <Typography sx={{ fontSize: 14, mt: 0.2 }}>
                                  Privacy Protocol
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display:
                                    privacyProtocol === "DES" ||
                                    privacyProtocol === "AES"
                                      ? "flex"
                                      : "none",
                                  justifyContent: "right",
                                  mt: 4,
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: 14, color: "red", mr: 1 }}
                                >
                                  *
                                </Typography>
                                <Typography sx={{ fontSize: 14, mt: 0.3 }}>
                                  Privacy Passphrase
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: "left", width: "40%" }}>
                              <TextField
                                {...textFieldProps}
                                value={ip_address}
                                onChange={(e) => setip_address(e.target.value)}
                                sx={{
                                  mb: 2,
                                  width: 1,
                                  "& .MuiInputBase-input": {
                                    fontSize: 14,
                                  },
                                }}
                              />
                              <Box
                                sx={{
                                  textAlign: "left",
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {/* SNMP Version */}
                                <FormControl
                                  component="fieldset"
                                  sx={{ minWidth: 200, mb: 2 }}
                                >
                                  {/* <FormLabel component="legend" sx={{ fontSize: 14 }}>SNMP Version</FormLabel> */}
                                  <RadioGroup
                                    value={snmp_version}
                                    onChange={handleVersionChange}
                                    row
                                  >
                                    <FormControlLabel
                                      value="SNMPv1"
                                      control={<Radio size="small" />}
                                      label="SNMPv1"
                                    />
                                    <FormControlLabel
                                      value="SNMPv2"
                                      control={<Radio size="small" />}
                                      label="SNMPv2"
                                    />
                                    <FormControlLabel
                                      value="SNMPv3"
                                      control={<Radio size="small" />}
                                      label="SNMPv3"
                                    />
                                  </RadioGroup>
                                </FormControl>

                                <TextField
                                  {...textFieldProps}
                                  value={snmp_community}
                                  onChange={(e) =>
                                    setsnmp_community(e.target.value)
                                  }
                                  sx={{
                                    display:
                                      snmp_version === "SNMPv1" ||
                                      snmp_version === "SNMPv2"
                                        ? ""
                                        : "none",
                                    width: 1,
                                    "& .MuiInputBase-input": {
                                      fontSize: 14,
                                    },
                                  }}
                                />
                                <TextField
                                  {...textFieldProps}
                                  value={V3Username}
                                  onChange={(e) =>
                                    setV3Username(e.target.value)
                                  }
                                  sx={{
                                    display:
                                      snmp_version === "SNMPv3" ? "" : "none",
                                    width: 1,
                                    "& .MuiInputBase-input": {
                                      fontSize: 14,
                                    },
                                    mb: 2.5,
                                  }}
                                />
                                <FormControl
                                  sx={{ minWidth: 200 }}
                                  size="small"
                                >
                                  <RadioGroup
                                    value={SecurLevel}
                                    onChange={(e) => {
                                      setSecurLevel(e.target.value);
                                      if (e.target.value === "noAuthNoPriv") {
                                        setAuthenProtocol("");
                                        setAuthenPass("");
                                      } else if (
                                        e.target.value === "authNoPriv"
                                      ) {
                                        setPrivacyProtocol("");
                                        setPrivacyPass("");
                                      }
                                    }}
                                    row
                                    sx={{
                                      display:
                                        snmp_version === "SNMPv3" ? "" : "none",
                                      mb: 2,
                                      mt: -0.5,
                                      fontSize: 14,
                                    }}
                                  >
                                    <FormControlLabel
                                      value="noAuthNoPriv"
                                      control={<Radio size="small" />}
                                      label="noAuthNoPriv"
                                    />
                                    <FormControlLabel
                                      value="authNoPriv"
                                      control={<Radio size="small" />}
                                      label="authNoPriv"
                                    />
                                    <FormControlLabel
                                      value="authPriv"
                                      control={<Radio size="small" />}
                                      label="authPriv"
                                    />
                                  </RadioGroup>
                                </FormControl>

                                <FormControl
                                  sx={{ minWidth: 200 }}
                                  size="small"
                                >
                                  <RadioGroup
                                    value={authenProtocol}
                                    onChange={(e) =>
                                      setAuthenProtocol(e.target.value)
                                    }
                                    row // This makes the radio buttons appear horizontally
                                    sx={{
                                      display:
                                        SecurLevel === "authNoPriv" ||
                                        SecurLevel === "authPriv"
                                          ? ""
                                          : "none",
                                      mb: 2,
                                      fontSize: 14,
                                    }}
                                  >
                                    <FormControlLabel
                                      value="MD5"
                                      control={<Radio size="small" />}
                                      label="MD5"
                                    />
                                    <FormControlLabel
                                      value="SHA"
                                      control={<Radio size="small" />}
                                      label="SHA"
                                    />
                                  </RadioGroup>
                                </FormControl>

                                <TextField
                                  {...textFieldProps}
                                  value={authenPass}
                                  onChange={(e) =>
                                    setAuthenPass(e.target.value)
                                  }
                                  sx={{
                                    display:
                                      SecurLevel === "authNoPriv" ||
                                      SecurLevel === "authPriv"
                                        ? ""
                                        : "none",
                                    width: 1,
                                    "& .MuiInputBase-input": {
                                      fontSize: 14,
                                    },
                                    mb: 2,
                                  }}
                                />
                                <FormControl
                                  sx={{ minWidth: 200 }}
                                  size="small"
                                >
                                  <RadioGroup
                                    value={privacyProtocol}
                                    onChange={(e) => {
                                      setPrivacyProtocol(e.target.value);
                                      if (e.target.value === "NONE") {
                                        setPrivacyPass("");
                                      }
                                    }}
                                    row // This makes the radio buttons appear horizontally
                                    sx={{
                                      display:
                                        SecurLevel === "authPriv" ? "" : "none",
                                      mb: 2,
                                      fontSize: 14,
                                    }}
                                  >
                                    <FormControlLabel
                                      value="NONE"
                                      control={<Radio size="small" />}
                                      label="NONE"
                                    />
                                    <FormControlLabel
                                      value="DES"
                                      control={<Radio size="small" />}
                                      label="DES"
                                    />
                                    <FormControlLabel
                                      value="AES"
                                      control={<Radio size="small" />}
                                      label="AES"
                                    />
                                  </RadioGroup>
                                </FormControl>

                                <TextField
                                  {...textFieldProps}
                                  value={privacyPass}
                                  onChange={(e) =>
                                    setPrivacyPass(e.target.value)
                                  }
                                  sx={{
                                    display:
                                      privacyProtocol === "DES" ||
                                      privacyProtocol === "AES"
                                        ? ""
                                        : "none",
                                    width: 1,
                                    "& .MuiInputBase-input": {
                                      fontSize: 14,
                                    },
                                    mb: 2,
                                    mt: 0.3,
                                  }}
                                />
                              </Box>
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: 14, mt: 1 }}>
                                Port
                              </Typography>
                            </Box>
                            <Box>
                              <TextField
                                {...textFieldProps}
                                value={snmp_port}
                                onChange={(e) => setsnmp_port(e.target.value)}
                                sx={{
                                  width: "90%",
                                  "& .MuiInputBase-input": {
                                    fontSize: 14,
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Description Section */}
                      {/* <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          p: 4,
                          border: "2px solid rgb(232, 232, 232)",
                          borderRadius: 3,
                          mb: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            mb: -2,
                            fontSize: "1.1rem",
                            color: "black",
                            fontWeight: "semibold",
                            mt: 0.5,
                          }}
                          {...typographyProps}
                        >
                          DESCRIPTION
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexDirection: "row", gap: 2 }}
                        >
                          <Box
                            sx={{
                              width: "20%",
                              display: "flex",
                              justifyContent: "right",
                              mt: 4,
                            }}
                          >
                            <Typography sx={{ fontSize: 14 }}>
                              Description
                            </Typography>
                          </Box>

                          <Box sx={{ textAlign: "left", width: "40%" }}>
                            <TextField
                              multiline
                              rows={4}
                              {...textFieldProps}
                              value={details_description}
                              onChange={(e) =>
                                setdetails_description(e.target.value)
                              }
                              sx={{
                                width: 1,
                                "& .MuiInputBase-input": {
                                  fontSize: 14,
                                },
                              }}
                            />
                          </Box>
                        </Box>
                      </Box> */}
                    </Box>
                  </Paper>
                </TabPanel>
              </Box>

              {/* Item Tabview */}
              <Box>
                <TabPanel value="item">
                  <Paper
                    elevation={0}
                    sx={{ px: 0, backgroundColor: "#FFFFFB", mt: -2 }}
                  >
                    <Box
                      component="form"
                      onSubmit={handleSubmit}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        p: 3,
                        border: "2px solid rgb(232, 232, 232)",
                        borderRadius: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Box sx={{ width: "10%" }}>
                          <Typography
                            sx={{
                              fontSize: "1.2rem",
                              color: "black",
                              fontWeight: "medium",
                            }}
                          >
                            ITEMS
                          </Typography>
                        </Box>
                        <Box
                          width={"75%"}
                          display={"flex"}
                          justifyContent={"flex-end"}
                          marginRight={2}
                        >
                          <Button
                            onClick={handleScanInterface}
                            sx={{
                              color: "white",
                              textAlign: "center",
                              bgcolor: "#0281F2",
                              border: "1px solid #0281F2",
                              borderRadius: "8px",
                              gap: 1,
                            }}
                          >
                            <SearchIcon />
                            <Typography>Scan interface</Typography>
                          </Button>
                        </Box>
                        <Button
                          onClick={handleAddRow}
                          sx={{
                            color: "white",
                            bgcolor: "#F25A28",
                            border: "1px solid #F25A28",
                            borderRadius: "8px",
                            width: "15%",
                          }}
                        >
                          <AddIcon
                            sx={{
                              color: "white",
                              mr: 1,
                              // border: "2px solid",
                              "&.Mui-selected": {},
                              "&:focus": {
                                outline: "none",
                              },
                            }}
                          />
                          <Typography fontSize={14}>Another item</Typography>
                        </Button>
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ width: 1 }}>
                              <TableCell>Item's name</TableCell>
                              <TableCell>OID</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Unit</TableCell>
                              <TableCell>Update Interval</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TransitionGroup component={null}>
                              {paginatedItems.map((row) => (
                                <Fade
                                  key={row.id}
                                  in={!isTransitioning}
                                  style={{ transformOrigin: "0 0 0" }}
                                  {...(isTransitioning ? { timeout: 100 } : {})}
                                >
                                  <TableRow>
                                    <TableCell sx={{ width: "25%" }}>
                                      <TextField
                                        {...textFieldProps}
                                        value={row.item_name}
                                        onChange={(e) =>
                                          handleItemChange(
                                            row.id,
                                            "item_name",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell sx={{ width: "25%" }}>
                                      <TextField
                                        {...textFieldProps}
                                        value={row.oid}
                                        onChange={(e) =>
                                          handleItemChange(
                                            row.id,
                                            "oid",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </TableCell>

                                    <TableCell sx={{ width: "15%" }}>
                                      <TextField
                                        {...textFieldProps}
                                        select
                                        value={row.type}
                                        onChange={(e) =>
                                          handleItemChange(
                                            row.id,
                                            "type",
                                            e.target.value
                                          )
                                        }
                                      >
                                        <MenuItem value={"integer"}>
                                          Integer
                                        </MenuItem>
                                        <MenuItem value={"counter"}>
                                          Counter
                                        </MenuItem>
                                      </TextField>
                                    </TableCell>

                                    <TableCell>
                                      <TextField
                                        {...textFieldProps}
                                        value={row.unit}
                                        onChange={(e) =>
                                          handleItemChange(
                                            row.id,
                                            "unit",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        {...textFieldProps}
                                        value={row.interval}
                                        onChange={(e) =>
                                          handleItemChange(
                                            row.id,
                                            "interval",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </TableCell>

                                    <TableCell>
                                      <IconButton
                                        onClick={() => handleDeleteRow(row.id)}
                                        disabled={itemRows.length === 1}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                </Fade>
                              ))}
                            </TransitionGroup>
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {Math.ceil(itemRows.length / itemsPerScanInterfacepage) >
                        1 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 2,
                          }}
                        >
                          <Pagination
                            count={Math.ceil(
                              itemRows.length / itemsPerScanInterfacepage
                            )}
                            showFirstButton
                            showLastButton
                            page={ScanInterfacepage}
                            onChange={handleChangeScanInterfacepage}
                            color="primary"
                            sx={{
                              "& .MuiPaginationItem-root": {
                                transition: "all 0.1s ease",
                                "&:hover": {
                                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                                  transform: "scale(1.1)",
                                },
                              },
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </TabPanel>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 1,
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
          </TabContext>
        </Box>
        {/* </form> */}
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            fontSize: 14,
            "& .MuiAlert-icon": {
              fontSize: 20,
              mt: 0.5,
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddDevice;
