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
                    border: "3px solid #5b71a5",
                    borderRadius: 2,
                    height: "80%",
                    backgroundColor: "#FBFDFF",
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
                      maxHeight: "3.6em", 
                       mb: 1,
                        width:"90%"
                    }}
                  >
                    {item.interface_name}
                  </Typography>
                  <Typography sx={{mb:0.5}}>Type: {item.interface_type}</Typography>
                  <Typography sx={{mb:0.5}}>Speed: {item.interface_speed} bps</Typography>
                  <Typography sx={{mb:0.5}}>
                    Adminstatus: {item.interface_Adminstatus}
                  </Typography>
                  <Typography sx={{mb:0.5}}>
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
