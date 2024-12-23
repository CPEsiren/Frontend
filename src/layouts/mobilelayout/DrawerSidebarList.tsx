import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { SlideBarItems } from "../Sidebar";
import { useLocation, useNavigate } from "react-router-dom";

interface DrawerSidebarListProps {
  onClick: () => void;
}

const DrawerSidebarList = ({ onClick }: DrawerSidebarListProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate(path);
    onClick();
  };

  return (
    <List>
      {SlideBarItems.map((slide) => (
        <ListItem key={slide.id}>
          <ListItemButton
            // onClick={() => handleClick(slide.path)}
            selected={location.pathname === slide.path}
          >
            <ListItemIcon>{slide.icon}</ListItemIcon>
            <ListItemText primary={slide.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default DrawerSidebarList;
