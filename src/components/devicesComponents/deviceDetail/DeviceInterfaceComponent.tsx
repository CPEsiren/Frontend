import React, { useState } from "react";
import { Grid, Box, Typography, Pagination } from "@mui/material";
import { IInterface } from "../../../interface/InterfaceCollection";

const DeviceInterfaceComponent = ({
  interfaces,
}: {
  interfaces: IInterface[];
}) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;
  const pageCount = Math.ceil(interfaces.length / itemsPerPage);

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <Box>
      {interfaces.length == 0 ? (
        <Typography
          sx={{ textAlign: "center", width: 1, fontSize: "1.2rem", py: 3 }}
        >
          No interfaces found
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {interfaces
            .slice((page - 1) * itemsPerPage, page * itemsPerPage)
            .map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    padding: 2,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    height: "80%",
                    backgroundColor: "#f9f9f9",
                    transition: "opacity 0.3s ease-in-out",
                    opacity: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.2,
                      maxHeight: "3.6em", // 3 lines * 1.2em line-height
                    }}
                  >
                    {item.interface_name}
                  </Typography>
                  <Typography>Type: {item.interface_type}</Typography>
                  <Typography>Speed: {item.interface_speed} bps</Typography>
                  <Typography>
                    Adminstatus: {item.interface_Adminstatus}
                  </Typography>
                  <Typography>
                    Operstatus: {item.interface_Operstatus}
                  </Typography>
                </Box>
              </Grid>
            ))}
        </Grid>
      )}
      {pageCount > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: 6,
            mb: 2,
          }}
        >
          <Pagination
            count={pageCount}
            page={page}
            onChange={handleChangePage}
          />
        </Box>
      )}
    </Box>
  );
};

export default DeviceInterfaceComponent;
