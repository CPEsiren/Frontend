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
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          outline: "none !important", // Remove the focus ring for all elements
          "&:focus": {
            outline: "none !important", // Specific to focus state
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:focus": {
            outline: "none", // Remove focus ring from IconButtons
          },
          "&:focus-visible": {
            outline: "none", // Remove focus ring from keyboard navigation
          },
        },
      },
    },
  },
});

interface AddDeviceProps {
  onClose: () => void;
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
  // history: string;
  // trend: string;
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
  name_template: string;
  items: TemplateItem[];
  description: string;
}
const AddDevice: React.FC<AddDeviceProps> = ({ onClose }) => {
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

  const [templateOptions, setTemplateOptions] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

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
          interval: 0,
        },
      ]);
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:3000/template");
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
      interval: 0,
      // history: "",
      // trend: "",
    },
  ]);

  const handleAddRow = () => {
    const newRow: DeviceItems = {
      id: itemRows.length + 1,
      item_name: "",
      oid: "",
      type: "",
      unit: "",
      interval: 0,
      // history: "",
      // trend: "",
    };
    setItemRows([...itemRows, newRow]);
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
      };

      // Only add items to request if they have data
      const filledItems = itemRows.filter(
        (item) => item.item_name || item.oid || item.type || item.unit
      );

      if (filledItems.length > 0) {
        requestBody.items = filledItems;
      }

      await axios.post("http://127.0.0.1:3000/host", requestBody);
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
      // itemRows
    );
    if (success) {
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
      alert("Device added successfully!");
      onClose();
    } else {
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

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabvalue(newValue);
  };

  // Add new function to handle interface scanning
  const handleScanInterface = async () => {
    if (!ip_address || !snmp_port || !snmp_version || !snmp_community) {
      alert("Please fill in all SNMP interface details before scanning");
      setTabvalue("host"); // Switch back to host tab if details are missing
      return;
    }

    try {
      const response = await axios.get("http://127.0.0.1:3000/item/interface", {
        params: {
          ip_address: ip_address,
          port: snmp_port,
          version: snmp_version,
          community: snmp_community,
        },
      });

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

        // Update the item rows with the scanned interface data
        setItemRows(interfaceItems);

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

  return (
    <Box sx={{ p: 0, width: "100%" }}>
      {windowSize.width > 600 && (
        <Box
          sx={{ display: "flex", justifyContent: "flex-start", mb: 0, mt: 1 }}
        />
      )}
      <TabContext value={tabvalue}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            sx={{
              minHeight: 0, // Removes default TabList height
            }}
            onChange={handleChange}
            aria-label="Tabview"
          >
            <Tab
              sx={{
                minHeight: 0,
                color: "black",
                "&.Mui-selected": {
                  color: "blue",
                  outline: "none",
                  border: "none",
                },
                "&:focus": {
                  outline: "none",
                },
              }}
              label="Host"
              value="host"
            />
            <Tab
              sx={{
                minHeight: 0,
                color: "black",
                "&.Mui-selected": {
                  color: "blue",
                  outline: "none",
                  border: "none",
                },
                "&:focus": {
                  outline: "none",
                },
              }}
              label="Items"
              value="item"
            />
          </TabList>
        </Box>
        <TabPanel value="host">
          <Paper elevation={0} sx={{ px: 2, backgroundColor: "#FFFFFB" }}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Typography
                sx={{
                  mt: 0,
                  mb: -2,
                  fontSize: "1.1rem",
                  color: "#a9a9a9",
                  fontWeight: "semibold",
                }}
                {...typographyProps}
              >
                HOST
              </Typography>
              <Box sx={{ borderTop: "2px solid #d9d9d9" }} />

              {/* Host Section */}
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <Box sx={{ textAlign: "right", mt: 1, width: "20%" }}>
                  <Box sx={{ display: "flex", justifyContent: "right" }}>
                    <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                      *
                    </Typography>
                    <Typography sx={{ fontSize: 14 }}>Host name</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 14, mt: 4 }}>
                    Templates
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "right", mt: 4 }}>
                    <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                      *
                    </Typography>
                    <Typography sx={{ fontSize: 14 }}>Host groups</Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "left" }}>
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
                      <MenuItem key={template._id} value={template._id}>
                        {template.name_template}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    {...textFieldProps}
                    value={hostgroup}
                    onChange={(e) => sethostgroup(e.target.value)}
                    sx={{
                      mb: 0,
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
                >
                  {/* <Button
                    variant="contained"
                    size="small"
                    sx={{ fontSize: 14, mt: 6.6 }}
                  >
                    Select
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ fontSize: 14 }}
                  >
                    Select
                  </Button> */}
                </Box>
              </Box>

              {/* Interface Section */}
              <Typography
                sx={{
                  mb: -2,
                  fontSize: "1.1rem",
                  color: "#a9a9a9",
                  fontWeight: "semibold",
                  mt: 0.5,
                }}
                {...typographyProps}
              >
                SNMP INTERFACE
              </Typography>
              <Box sx={{ borderTop: "2px solid #d9d9d9" }} />
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <Box sx={{ textAlign: "right", mt: 1, width: "18%" }}>
                  <Box sx={{ display: "flex", justifyContent: "right" }}>
                    <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                      *
                    </Typography>
                    <Typography sx={{ fontSize: 14 }}>IP address</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "right", mt: 4 }}>
                    <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                      *
                    </Typography>
                    <Typography sx={{ fontSize: 14 }}>SNMP version</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "right", mt: 4 }}>
                    <Typography sx={{ fontSize: 14, color: "red", mr: 1 }}>
                      *
                    </Typography>
                    <Typography sx={{ fontSize: 14 }}>
                      SNMP community
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
                  <Box sx={{ textAlign: "left" }}>
                    <FormControl sx={{ minWidth: 200 }} size="small">
                      <Select
                        value={snmp_version}
                        onChange={handleVersionChange}
                        displayEmpty
                        sx={{
                          mb: 2,
                          fontSize: 14,
                          "& .MuiMenuItem-root": { fontSize: 14 },
                        }}
                      >
                        <MenuItem value="v1">SNMPv1</MenuItem>
                        <MenuItem value="v2">SNMPv2</MenuItem>
                        <MenuItem value="v3">SNMPv3</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      {...textFieldProps}
                      value={snmp_community}
                      onChange={(e) => setsnmp_community(e.target.value)}
                      sx={{
                        width: 1,
                        "& .MuiInputBase-input": {
                          fontSize: 14,
                        },
                      }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14, mt: 1 }}>Port</Typography>
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

              {/* Details Section */}
              <Typography
                sx={{
                  mb: -2,
                  fontSize: "1.1rem",
                  color: "#a9a9a9",
                  fontWeight: "semibold",
                  mt: 0.5,
                }}
                {...typographyProps}
              >
                DETAILS
              </Typography>
              <Box sx={{ borderTop: "2px solid #d9d9d9" }} />
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <Box sx={{ textAlign: "right", mt: 1, width: "18%" }}>
                  <Box sx={{ display: "flex", justifyContent: "right" }}>
                    <Typography sx={{ fontSize: 14 }}>Location</Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "right", mt: 4 }}>
                    <Typography sx={{ fontSize: 14 }}>description</Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "left" }}>
                  <TextField
                    {...textFieldProps}
                    value={details_location}
                    onChange={(e) => setdetails_location(e.target.value)}
                    sx={{
                      mb: 2,
                      width: "100%",
                      "& .MuiInputBase-input": {
                        fontSize: 14,
                      },
                    }}
                  />
                  <TextField
                    multiline
                    rows={4}
                    {...textFieldProps}
                    value={details_description}
                    onChange={(e) => setdetails_description(e.target.value)}
                    sx={{
                      width: "100%",
                      "& .MuiInputBase-input": {
                        fontSize: 14,
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Action Buttons */}
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
          </Paper>
        </TabPanel>

        {/* Item Tabview */}
        <TabPanel value="item">
          <Paper elevation={0} sx={{ px: 2, backgroundColor: "#FFFFFB" }}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Typography
                    sx={{
                      fontSize: "1.1rem",
                      color: "#a9a9a9",
                      fontWeight: "semibold",
                    }}
                  >
                    ITEMS
                  </Typography>
                  <Box sx={{ borderTop: "2px solid #d9d9d9" }} />
                </Box>
                <IconButton
                  onClick={handleAddRow}
                  sx={{ color: "primary.main" }}
                >
                  <AddIcon
                    sx={{
                      color: "black",
                      border: "2px solid",
                      "&.Mui-selected": {},
                      "&:focus": {
                        outline: "none",
                      },
                    }}
                  />
                </IconButton>
              </Box>
              <Box sx={{ justifyItems: "flex-end" }}>
                <Button
                  onClick={handleScanInterface}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    color: "blue",
                  }}
                >
                  Scan interface
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
                      <TableCell>History</TableCell>
                      <TableCell>Trend</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itemRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
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
                        <TableCell>
                          <TextField
                            {...textFieldProps}
                            value={row.oid}
                            onChange={(e) =>
                              handleItemChange(row.id, "oid", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            {...textFieldProps}
                            value={row.type}
                            onChange={(e) =>
                              handleItemChange(row.id, "type", e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            {...textFieldProps}
                            value={row.unit}
                            onChange={(e) =>
                              handleItemChange(row.id, "unit", e.target.value)
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
                          <TextField {...textFieldProps} />
                        </TableCell>
                        <TableCell>
                          <TextField {...textFieldProps} />
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
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Action Buttons */}
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
          </Paper>
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default AddDevice;
