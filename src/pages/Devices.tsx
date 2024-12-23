import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Typography,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import useWindowSize from "../hooks/useWindowSize";
import DevicesComponents from "../components/devicesComponents/DevicesComponents";
import { IDevice } from "../interface/InterfaceCollection";
import AddDevice from "../components/Modules/AddDevice";

const Devices: React.FC = () => {
  const windowSize = useWindowSize();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch("http://localhost:3000/host");
        if (!response.ok) {
          throw new Error("Failed to fetch devices");
        }
        const result = await response.json();
        setDevices(result.data);
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
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
            color="#242D5D"
          >
            DEVICES
          </Typography>
          <Button
            onClick={toggleModal}
            sx={{
              color: "#FFFFFB",
              backgroundColor: "#F25A28",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "70px",
              width: "7rem",
              height: "2.5rem",
              "&:hover": {
                backgroundColor: "#F37E58",
              },
            }}
          >
            + Device
          </Button>
        </Box>
      )}

      <Box sx={{ marginTop: 2, paddingBottom: 3 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : devices.length > 0 ? (
          <DevicesComponents devices={devices} />
        ) : (
          <Typography>No devices available</Typography>
        )}
      </Box>

      <Dialog open={isModalOpen} onClose={toggleModal} fullWidth maxWidth="lg">
        <DialogTitle sx={{ borderBottom: 1, borderColor: "#a9a9a9" }}>
          <Typography variant="h6">New Device</Typography>
        </DialogTitle>
        <DialogContent>
          <AddDevice onClose={toggleModal} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Devices;
