import React, { useState } from "react";
import { Box, Stack, IconButton } from "@mui/material";
import useWindowSize from "../hooks/useWindowSize";
import SirenLogo from "../assets/SirenLogo.svg"; 
import CPESirenLogo from "../assets/CPESiren.svg"; 
import MenuOpenImage from "../assets/menuOpen.png";
import MenuCloseImage from "../assets/menuClose.png";

interface HeaderProps {
  isHideSidebar: boolean;
  handleHideSidebar: (width: number) => void;
}

const Header: React.FC<HeaderProps> = ({
  isHideSidebar,
  handleHideSidebar,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true); 
  const windowSize = useWindowSize();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); 
    handleHideSidebar(windowSize.width);
  };

  return (
    <>
      <Stack
        direction="row"
        spacing={4}
        sx={{
          mb: "30px",
          marginLeft: 1,
        }}
      >
       
        {!isHideSidebar && windowSize.width >= 1100 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            {/* SirenLogo */}
            <img
              src={SirenLogo}
              alt="Siren Logo"
              style={{
                width: 40,
                height: "auto",
                marginRight: isMenuOpen ? -18 : 0,
                marginTop: -20,
              }}
            />
            
            {isMenuOpen && (
              <img
                src={CPESirenLogo}
                alt="CPE Siren Logo"
                style={{
                  width: 100,
                  height: "auto",
                  marginTop: -1,
                  marginRight: 30,
                }}
              />
            )}
          </Box>
        )}

        <IconButton
          onClick={toggleMenu} 
          sx={{
            "&:focus": {
              outline: "none",
              color: "#242D5D",
            },
            "&:hover": {
              color: "#242D5D",
            },
            width: 50,
            height: 50,
            padding: 0,
          }}
        >
          <Box
            component="img"
            src={isMenuOpen ? MenuOpenImage : MenuCloseImage} 
            alt="Menu Toggle"
            sx={{
              width: "55%",
              height: "55%",
              objectFit: "contain",
            }}
          />
        </IconButton>
      </Stack>
    </>
  );
};

export default Header;
