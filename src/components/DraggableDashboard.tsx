import React, { useState, useRef } from "react";
import { Box, Grid, Paper, IconButton, PaperProps } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { styled } from "@mui/material/styles";

// Define component configuration interface
interface ComponentConfig {
  id: string;
  name: string;
  icon: JSX.Element;
  component: React.ComponentType<any>;
  defaultSize: {
    xs: number;
    sm?: number;
    md?: number;
  };
  allowMultiple: boolean;
}

interface GraphSelection {
  graphName: string;
}

interface ActiveComponent {
  id: string;
  position: number;
  graphSelection?: GraphSelection;
}

interface DraggableItemProps extends PaperProps {
  isDragging?: boolean;
  isDragOver?: boolean;
  dragPosition?: "before" | "after" | null;
}

const DraggableItem = styled(Paper, {
  shouldForwardProp: (prop) =>
    !["isDragging", "isDragOver", "dragPosition"].includes(prop as string),
})<DraggableItemProps>(({ theme, isDragging, isDragOver, dragPosition }) => ({
  position: "relative",
  height: "100%",
  backgroundColor: "white",
  borderRadius: theme.shape.borderRadius * 2,
  padding: 0,
  border: "1px solid #eee",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  transform: isDragging ? "scale(1.02)" : "scale(1)",
  opacity: isDragging ? 0.5 : 1,
  boxShadow: isDragging
    ? "0 8px 16px rgba(0,0,0,0.1)"
    : "0 1px 3px rgba(0,0,0,0.05)",
  "&:hover": {
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    transform: "translateY(-2px)",
    // "& .dragHandle": {
    //   opacity: 1,
    // },
  },
  "&::before":
    dragPosition === "before"
      ? {
          content: '""',
          position: "absolute",
          top: 0,
          left: -4,
          width: 4,
          height: "100%",
          backgroundColor: theme.palette.primary.main,
          borderRadius: 2,
          zIndex: 2,
        }
      : undefined,
  "&::after":
    dragPosition === "after"
      ? {
          content: '""',
          position: "absolute",
          top: 0,
          right: -4,
          width: 4,
          height: "100%",
          // backgroundColor: "blue",
          backgroundColor: theme.palette.primary.main,
          borderRadius: 2,
          zIndex: 2,
        }
      : undefined,
}));

const DragHandle = styled(Box)(({ theme }) => ({
  position: "absolute",
  left: theme.spacing(0),
  top: "50%",
  transform: "translateY(-50%)",
  opacity: 1,
  transition: "opacity 0.2s ease-in-out",
  cursor: "move",
  zIndex: 2,
  display: "flex",
  alignItems: "center",
}));

interface DraggableDashboardProps {
  components: ComponentConfig[];
  activeComponents: ActiveComponent[];
  onReorder: (newLayout: ActiveComponent[]) => void;
  isEditing: boolean;
  onRemoveComponent: (position: number) => void;
  renderComponent: (
    activeComp: ActiveComponent,
    componentConfig: ComponentConfig,
    index: number
  ) => React.ReactNode;
}

const DraggableDashboard: React.FC<DraggableDashboardProps> = ({
  components,
  activeComponents,
  onReorder,
  isEditing,
  onRemoveComponent,
  renderComponent,
}) => {
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<"before" | "after" | null>(
    null
  );
  const dragTimer = useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = (e: React.DragEvent, position: number) => {
    setDragging(position);
    // Set dragging data for the ghost image
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    if (dragging === position) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position_new = e.clientY < midY ? "before" : "after";

    setDragOverItem(position);
    setDragPosition(position_new);

    // Clear existing timer
    if (dragTimer.current) {
      clearTimeout(dragTimer.current);
    }

    // Set new timer
    dragTimer.current = setTimeout(() => {
      setDragOverItem(null);
      setDragPosition(null);
    }, 100);
  };

  const handleDrop = (e: React.DragEvent, dropPosition: number) => {
    e.preventDefault();

    if (dragging === null || dragging === dropPosition) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertAfter = e.clientY > midY;

    const newComponents = [...activeComponents];
    const dragItem = newComponents[dragging];

    // Remove dragged item
    newComponents.splice(dragging, 1);

    // Calculate new position
    const actualDropPosition = insertAfter ? dropPosition : dropPosition - 1;
    const insertPosition =
      actualDropPosition < dragging
        ? actualDropPosition + 1
        : actualDropPosition;

    // Insert at new position
    newComponents.splice(insertPosition, 0, dragItem);

    // Update positions
    newComponents.forEach((comp, index) => {
      comp.position = index;
    });

    onReorder(newComponents);
    setDragging(null);
    setDragOverItem(null);
    setDragPosition(null);

    if (dragTimer.current) {
      clearTimeout(dragTimer.current);
    }
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOverItem(null);
    setDragPosition(null);

    if (dragTimer.current) {
      clearTimeout(dragTimer.current);
    }
  };

  return (
    <Grid container spacing={2}>
      {activeComponents.map((activeComp, index) => {
        const componentConfig = components.find((c) => c.id === activeComp.id);
        if (!componentConfig) return null;

        const { defaultSize } = componentConfig;

        return (
          <Grid item key={activeComp.position} {...defaultSize}>
            <DraggableItem
              draggable={isEditing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              isDragging={dragging === index}
              isDragOver={dragOverItem === index}
              dragPosition={dragOverItem === index ? dragPosition : null}
              elevation={0}
            >
              {isEditing && (
                <DragHandle className="dragHandle">
                  <IconButton sx={{ cursor: "move" }}>
                    <DragIndicatorIcon
                      sx={{ fontSize: "1rem", color: "black" }}
                    />
                  </IconButton>
                </DragHandle>
              )}
              <Box sx={{ height: "100%", pl: isEditing ? 4 : 0 }}>
                {renderComponent(activeComp, componentConfig, index)}
              </Box>
            </DraggableItem>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default DraggableDashboard;
