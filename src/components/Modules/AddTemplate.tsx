import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import useWindowSize from "../../hooks/useWindowSize";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface TemplateItems {
  id: number;
  item_name: string;
  oid: string;
  type: string;
  unit: string;
  // updateInterval: string;
  // history: string;
  // trend: string;
}

interface AddTemplateProps {
  onClose: () => void;
}

const AddTemplate: React.FC<AddTemplateProps> = ({ onClose }) => {
  const windowSize = useWindowSize();
  const [name_template, setname_template] = useState<string>("");
  const [description, setdescription] = useState<string>("");
  const [itemRows, setItemRows] = useState<TemplateItems[]>([
    {
      id: 1,
      item_name: "",
      oid: "",
      type: "",
      unit: "",
      // updateInterval: "",
      // history: "",
      // trend: "",
    },
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await StoreNewtemplate(name_template);
    if (success) {
      // Clear form fields after successful submission
      setname_template("");
      setdescription("");
      setItemRows([
        {
          id: 1,
          item_name: "",
          oid: "",
          type: "",
          unit: "",
        },
      ]);
      alert("Template added successfully!");
    } else {
      alert("Failed to add template. Please try again.");
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

  const StoreNewtemplate = async (name_template: string): Promise<boolean> => {
    try {
      if (!name_template.trim()) {
        alert("Template name is required");
        return false;
      }

      // Create request body with just the template name
      const requestBody: any = {
        name_template,
        description,
      };

      // Only add items array if there are non-empty items
      const filledItems = itemRows.filter(
        (item) =>
          item.item_name.trim() ||
          item.oid.trim() ||
          item.type.trim() ||
          item.unit.trim()
      );

      if (filledItems.length > 0) {
        requestBody.items = filledItems.map((item) => ({
          item_name: item.item_name,
          oid: item.oid,
          type: item.type,
          unit: item.unit,
        }));
      }

      const response = await axios.post(
        "http://127.0.0.1:3000/template",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error storing template:", error);
      if (axios.isAxiosError(error)) {
        alert(
          `Failed to store template: ${
            error.response?.data?.message || error.message
          }`
        );
      } else {
        alert("An unexpected error occurred while storing the template");
      }
      return false;
    }
  };

  const handleAddRow = () => {
    const newRow: TemplateItems = {
      id: itemRows.length + 1,
      item_name: "",
      oid: "",
      type: "",
      unit: "",
      // updateInterval: "",
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
    field: keyof TemplateItems,
    value: string
  ) => {
    setItemRows(
      itemRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  return (
    <Box sx={{ p: 0, width: "100%" }}>
      {windowSize.width > 600 && (
        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 0 }} />
      )}

      <Paper elevation={0} sx={{ p: 2, backgroundColor: "#FFFFFB" }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Template section */}
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
            TEMPLATE
          </Typography>
          <Box sx={{ borderTop: "2px solid #d9d9d9" }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Template name
              </Typography>
            </Box>
            <TextField
              {...textFieldProps}
              value={name_template}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setname_template(e.target.value)
              }
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
              <Typography color="error" {...typographyProps}>
                *
              </Typography>
              <Typography sx={{ ml: 1 }} {...typographyProps}>
                Description
              </Typography>
            </Box>
            <TextField
              {...textFieldProps}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setdescription(e.target.value)
              }
            />
          </Box>
          <Box sx={{}}>
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

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <AddIcon
              onClick={handleAddRow}
              sx={{
                color: "black",
                cursor: "pointer",
                border: "2px solid",
                // borderRadius: "50%", // Optional for rounded borders
                padding: 0.5,
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            />
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
                          handleItemChange(row.id, "item_name", e.target.value)
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
                      <TextField {...textFieldProps} />
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
      </Paper>
    </Box>
  );
};

export default AddTemplate;
