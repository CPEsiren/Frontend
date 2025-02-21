import React, { useState, useEffect } from "react";
import { Box, Button, Typography, TextField, Paper } from "@mui/material";
import useWindowSize from "../../hooks/useWindowSize";
import axios from "axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { createTheme } from "@mui/material/styles";
import { Pagination, Fade } from "@mui/material";
import { TransitionGroup } from "react-transition-group";

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

interface AddDeviceProps {
  onClose: () => void;
  deviceId: string;
}

const AddItemOnly: React.FC<AddDeviceProps> = ({ onClose, deviceId }) => {
  const windowSize = useWindowSize();
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

  const StoreNewItem = async (itemRows: DeviceItems[]): Promise<boolean> => {
    try {
      // Map each item to the format expected by the API
      const promises = itemRows.map((item) => {
        const itemData = {
          host_id: deviceId,
          item_name: item.item_name,
          oid: item.oid,
          type: item.type,
          unit: item.unit,
          interval: item.interval.toString(), // Convert to string as per API format
        };

        return axios.post(`${import.meta.env.VITE_API_URL}/item`, itemData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      // Wait for all items to be added
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error("Error recording New Item:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await StoreNewItem(itemRows);
    if (success) {
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
      alert("Item added successfully!");
      onClose();
    } else {
      alert("Failed to add item. Please try again.");
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

  return (
    <Box sx={{ p: 0, width: "100%" }}>
      {windowSize.width > 600 && (
        <Box
          sx={{ display: "flex", justifyContent: "flex-start", mb: 0, mt: 1 }}
        />
      )}
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
            <IconButton onClick={handleAddRow} sx={{ color: "primary.main" }}>
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
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ width: 1 }}>
                  <TableCell>Item's name</TableCell>
                  <TableCell>OID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Update Interval</TableCell>
                  <TableCell></TableCell>
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
    </Box>
  );
};

export default AddItemOnly;

//Pls change to update with item path and post deviceid**************
