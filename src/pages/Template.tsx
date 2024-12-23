import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Box } from "@mui/system";
import useWindowSize from "../hooks/useWindowSize";
import AddTemplate from "../components/Modules/AddTemplate";

const Templates: React.FC = () => {
  const windowSize = useWindowSize();
  const [isModalOpen, setModalOpen] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]); // State to store templates
  const [loading, setLoading] = useState(true); // State for loading

  // Fetch data from the API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("http://localhost:3000/host"); // API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        const result = await response.json();
        setTemplates(result.data); // Access the "data" property in the response
        setLoading(false); // Turn off loading
      } catch (error) {
        console.error("Error fetching templates:", error);
        setLoading(false); // Turn off loading
      }
    };

    fetchTemplates();
  }, []);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      {windowSize.width > 600 && (
        <Box
          sx={{
            width: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 5,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight={600}
            color={"#242D5D"}
          >
            TEMPLATES
          </Typography>
          <Button
            onClick={toggleModal}
            sx={{
              color: "#FFFFFB",
              backgroundColor: "#F25A28",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "70px",
              width: "9rem",
              height: "2.5rem",
              "&:hover": {
                backgroundColor: "#F37E58",
              },
            }}
          >
            Add Template
          </Button>
        </Box>
      )}

      {/* Show loading or templates */}
      <Box sx={{ marginTop: 2 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Grid container spacing={2}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template._id}>
                <Box
                  sx={{
                    padding: 2,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Hostname: {template.hostname}
                  </Typography>
                  <Typography variant="body2">
                    IP Address: {template.ip_address}
                  </Typography>
                  <Typography variant="body2">
                    SNMP Version: {template.snmp_version}
                  </Typography>
                  <Typography variant="body2">
                    Host Group: {template.hostgroup}
                  </Typography>
                  <Typography variant="body2">
                    Status: {template.status === 0 ? "Inactive" : "Active"}
                  </Typography>
                  <Typography variant="body2">
                    Items: {template.items.length}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Modal for Add Template */}
      <Dialog open={isModalOpen} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle sx={{ borderBottom: 1, borderColor: "#a9a9a9" }}>
          <Typography variant="h6" component="div">
            New Template
          </Typography>
        </DialogTitle>
        <DialogContent>
          <AddTemplate onClose={handleClose} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Templates;
