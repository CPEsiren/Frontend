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
import { ITemplate, Item } from "../../interface/InterfaceCollection";

interface AddTemplateProps {
  onClose: () => void;
  onSuccess: () => void;
}

// Type for new template before submission (without _id)
type NewTemplateItem = Omit<Item, "_id">;

const AddTemplate: React.FC<AddTemplateProps> = ({ onClose, onSuccess }) => {
  const windowSize = useWindowSize();
  const [template_name, setTemplateName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [items, setItems] = useState<NewTemplateItem[]>([
    {
      item_name: "",
      oid: "",
      type: "",
      unit: "",
      interval: 0,
    },
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await storeNewTemplate();
    if (success) {
      setTemplateName("");
      setDescription("");
      setItems([
        {
          item_name: "",
          oid: "",
          type: "",
          unit: "",
          interval: 0,
        },
      ]);
      await onSuccess();
      alert("Template added successfully!");
      onClose();
    }
  };

  const storeNewTemplate = async (): Promise<boolean> => {
    try {
      if (!template_name.trim()) {
        alert("Template name is required");
        return false;
      }

      // Filter out empty items
      const filledItems = items.filter(
        (item) => item.item_name.trim() || item.oid.trim()
      );

      // Construct the template data, explicitly casting items
      const templateData: Omit<ITemplate, "_id"> = {
        template_name,
        description,
        items: filledItems as Item[], // Type assertion to ignore _id
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/template`,
        templateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.status === 200 || response.status === 201;
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
    setItems([
      ...items,
      {
        item_name: "",
        oid: "",
        type: "",
        unit: "",
        interval: 0,
      },
    ]);
  };

  const handleDeleteRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof NewTemplateItem,
    value: string | number
  ) => {
    setItems(
      items.map((item, i) =>
        i === index
          ? { ...item, [field]: field === "interval" ? Number(value) : value }
          : item
      )
    );
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

  return (
    <Box sx={{ p: 0, width: "100%" }}>
      {windowSize.width > 600 && (
        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 0 }} />
      )}

      <Paper elevation={0} sx={{ px: 3, backgroundColor: "#FFFFFB", mt: -2 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 3,
              gap: 2,
              border: "2px solid rgb(232, 232, 232)",
              borderRadius: 3,
              mt: 4,
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
              TEMPLATE
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "80%",
              }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "right", minWidth: 150 }}
              >
                <Typography color="error" {...typographyProps}>
                  *
                </Typography>
                <Typography sx={{ ml: 1 }} {...typographyProps}>
                  Template name
                </Typography>
              </Box>
              <TextField
                {...textFieldProps}
                required
                value={template_name}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "80%",
              }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "right", minWidth: 150 }}
              >
                <Typography sx={{ ml: 1 }} {...typographyProps}>
                  Description
                </Typography>
              </Box>
              <TextField
                {...textFieldProps}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Box>
          </Box>

          <Box
            sx={{
              gap: 2,
              border: "2px solid rgb(232, 232, 232)",
              borderRadius: 3,
              mt: 3,
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "row", mb: 2 }}>
              <Typography
                sx={{
                  fontSize: "1.2rem",
                  color: "black",
                  fontWeight: "medium",
                  width: "10%",
                }}
              >
                ITEMS
              </Typography>
              <Box width={"90%"} display={"flex"} justifyContent={"flex-end"}>
                <Button
                  onClick={handleAddRow}
                  sx={{
                    color: "white",
                    bgcolor: "#F25A28",
                    border: "1px solid #F25A28",
                    borderRadius: "8px",
                    width: "17%",
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
                  <Typography fontSize={14}>another item</Typography>
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item's name</TableCell>
                    <TableCell>OID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Update Interval</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          {...textFieldProps}
                          value={item.item_name}
                          onChange={(e) =>
                            handleItemChange(index, "item_name", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          {...textFieldProps}
                          value={item.oid}
                          onChange={(e) =>
                            handleItemChange(index, "oid", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          {...textFieldProps}
                          value={item.type}
                          onChange={(e) =>
                            handleItemChange(index, "type", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          {...textFieldProps}
                          value={item.unit}
                          onChange={(e) =>
                            handleItemChange(index, "unit", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          {...textFieldProps}
                          type="number"
                          value={item.interval}
                          onChange={(e) =>
                            handleItemChange(index, "interval", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleDeleteRow(index)}
                          disabled={items.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

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
      </Paper>
    </Box>
  );
};

export default AddTemplate;
