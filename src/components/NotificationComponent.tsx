import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  TextField,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { INotifacationDetails } from "../pages/Account";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface NotificationComponentProps {
  notifications: INotifacationDetails[];
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    problem_title: string,
    problem_body: string,
    recovery_title: string,
    recovery_body: string,
    enabled: boolean
  ) => void;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({
  notifications,
  onDelete,
  onUpdate,
}) => {
  // State for delete
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setOpenDialog(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };

  // State for edit
  const [notificationToEdit, setNotificationToEdit] =
    useState<INotifacationDetails | null>();
  const [enabled, setEnabled] = useState(true);
  const [openDialogEdit, setOpenDialogEdit] = useState(false);

  const handleEditSave = async () => {
    if (notificationToEdit) {
      onUpdate(
        notificationToEdit._id,
        messageProblemTitle,
        messageProblemBody,
        messageRecoveryTitle,
        messageRecoveryBody,
        enabled
      );
      setOpenDialogEdit(false);
      setNotificationToEdit(null);
    }
  };

  const handleEditClick = (notification: INotifacationDetails) => {
    setNotificationToEdit(notification);
    setMessageProblemTitle(notification.problem_title);
    setMessageProblemBody(notification.problem_body);
    setMessageRecoveryTitle(notification.recovery_title);
    setMessageRecoveryBody(notification.recovery_body);
    setEnabled(notification.enabled);
    setOpenDialogEdit(true);
  };

  const handleEditCancel = () => {
    setOpenDialogEdit(false);
  };

  //Problem Message
  const [messageProblemTitle, setMessageProblemTitle] = useState("");
  const [messageProblemBody, setMessageProblemBody] = useState("");
  const [currentProblemField, setCurrentProblemField] = useState<
    "title" | "body"
  >("title");
  const [isPlaceholderProblemDialogOpen, setIsPlaceholderProblemDialogOpen] =
    useState(false);
  const [expandedProblem, setExpandedProblem] = React.useState<string | false>(
    false
  );

  const handleProblemTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setMessageProblemTitle(newTitle);
  };

  const openPlaceholderProblemDialog = (field: "title" | "body") => {
    setCurrentProblemField(field);
    setIsPlaceholderProblemDialogOpen(true);
  };

  const handleProblemBodyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBody = e.target.value;
    setMessageProblemBody(newBody);
  };

  const placeholderProblemGroups = [
    {
      name: "Trigger",
      placeholders: [
        { value: "{TRIGGER.EXPRESSION}", label: "Trigger Expression" },
        { value: "{TRIGGER.NAME}", label: "Trigger Name" },
        {
          value: "{TRIGGER.RECOVERY_EXPRESSION}",
          label: "Trigger Recovery Expression",
        },
        { value: "{TRIGGER.SEVERITY}", label: "Trigger Severity" },
        { value: "{TRIGGER.STATUS}", label: "Trigger Status" },
      ],
    },
    {
      name: "Host",
      placeholders: [
        { value: "{HOST.IP}", label: "Host IP" },
        { value: "{HOST.NAME}", label: "Host Name" },
      ],
    },
    {
      name: "Item",
      placeholders: [
        { value: "{ITEM.NAME}", label: "Item Name" },
        { value: "{ITEM.VALUE}", label: "Item Value" },
      ],
    },
    {
      name: "Event",
      placeholders: [
        { value: "{EVENT.ID}", label: "Event ID" },
        { value: "{EVENT.HOSTNAME}", label: "Event Hostname" },
        { value: "{EVENT.LASTVALUE}", label: "Event Last Value" },
        { value: "{EVENT.STATUS}", label: "Event Status" },
        { value: "{EVENT.TIMESTAMP}", label: "Event Timestamp" },
      ],
    },
  ];

  const handleChangeProblem =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedProblem(isExpanded ? panel : false);
    };

  const handleInsertProblemPlaceholder = (value: string) => {
    const textarea = document.getElementById(
      currentProblemField === "title" ? "alert-title" : "alert-body"
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text =
        currentProblemField === "title"
          ? messageProblemTitle
          : messageProblemBody;
      const newText = text.substring(0, start) + value + text.substring(end);
      if (currentProblemField === "title") {
        setMessageProblemTitle(newText);
      } else {
        setMessageProblemBody(newText);
      }
      setIsPlaceholderProblemDialogOpen(false);
      // Set cursor position after the inserted placeholder
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + value.length;
        textarea.focus();
      }, 0);
    }
  };

  //Recovery Message
  const [messageRecoveryTitle, setMessageRecoveryTitle] = useState("");
  const [messageRecoveryBody, setMessageRecoveryBody] = useState("");
  const [isPlaceholderRecoveryDialogOpen, setIsPlaceholderRecoveryDialogOpen] =
    useState(false);
  const [expandedRecovery, setExpandedRecovery] = React.useState<
    string | false
  >(false);
  const [currentRecoveryField, setCurrentRecoveryField] = useState<
    "title" | "body"
  >("title");

  const handleRecoveryTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTitle = e.target.value;
    setMessageRecoveryTitle(newTitle);
  };

  const openPlaceholderRecoveryDialog = (field: "title" | "body") => {
    setCurrentRecoveryField(field);
    setIsPlaceholderRecoveryDialogOpen(true);
  };

  const handleRecoveryBodyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBody = e.target.value;
    setMessageRecoveryBody(newBody);
  };

  const handleInsertRecoveryPlaceholder = (value: string) => {
    const textarea = document.getElementById(
      currentRecoveryField === "title" ? "alert-title" : "alert-body"
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text =
        currentRecoveryField === "title"
          ? messageRecoveryTitle
          : messageRecoveryBody;
      const newText = text.substring(0, start) + value + text.substring(end);
      if (currentRecoveryField === "title") {
        setMessageRecoveryTitle(newText);
      } else {
        setMessageRecoveryBody(newText);
      }
      setIsPlaceholderRecoveryDialogOpen(false);
      // Set cursor position after the inserted placeholder
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + value.length;
        textarea.focus();
      }, 0);
    }
  };

  const placeholderRecoveryGroups = [
    {
      name: "Trigger",
      placeholders: [
        { value: "{TRIGGER.EXPRESSION}", label: "Trigger Expression" },
        { value: "{TRIGGER.NAME}", label: "Trigger Name" },
        {
          value: "{TRIGGER.RECOVERY_EXPRESSION}",
          label: "Trigger Recovery Expression",
        },
        { value: "{TRIGGER.SEVERITY}", label: "Trigger Severity" },
        { value: "{TRIGGER.STATUS}", label: "Trigger Status" },
      ],
    },
    {
      name: "Host",
      placeholders: [
        { value: "{HOST.IP}", label: "Host IP" },
        { value: "{HOST.NAME}", label: "Host Name" },
      ],
    },
    {
      name: "Item",
      placeholders: [
        { value: "{ITEM.NAME}", label: "Item Name" },
        { value: "{ITEM.VALUE}", label: "Item Value" },
      ],
    },
    {
      name: "Event",
      placeholders: [
        { value: "{EVENT.ID}", label: "Event ID" },
        { value: "{EVENT.HOSTNAME}", label: "Event Hostname" },
        { value: "{EVENT.LASTVALUE}", label: "Event Last Value" },
        { value: "{EVENT.STATUS}", label: "Event Status" },
        { value: "{EVENT.TIMESTAMP}", label: "Event Timestamp" },
      ],
    },
  ];

  const handleChangeRecovery =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedRecovery(isExpanded ? panel : false);
    };

  return (
    <>
      {notifications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">No notifications found</Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            backgroundColor: "transparent",
          }}
        >
          {notifications.length > 0 ? (
            <Table
              sx={{
                "& .MuiTableCell-root": {
                  borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
                  padding: "16px",
                },
                "& .MuiTableRow-root:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                "& .MuiTableCell-head": {
                  borderBottom: "1px solid #dbdbdb",
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center">Type</TableCell>
                  <TableCell align="center">Recipient</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">⚙️</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.map((notification: INotifacationDetails) => (
                  <TableRow key={notification._id}>
                    <TableCell align="center">
                      <Chip
                        icon={
                          notification.type === "email" ? (
                            <EmailIcon />
                          ) : (
                            <ChatIcon />
                          )
                        }
                        label={notification.type.toUpperCase()}
                        color={
                          notification.type === "email" ? "primary" : "success"
                        }
                        sx={{ px: 1 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {notification.recipient.name}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={notification.enabled ? "Enable" : "Disable"}
                        color={notification.enabled ? "success" : "error"}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: "bold", border: "2px solid" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        aria-label="edit"
                        onClick={() => handleEditClick(notification)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDeleteClick(notification._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Type</TableCell>
                  <TableCell align="center">Recipient</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">⚙️</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body1" color="text.secondary">
                      No notifications available. Add a notification to get
                      started.
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}

      <Dialog
        open={openDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this notification?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openDialogEdit}
        onClose={() => setOpenDialogEdit(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Notification Channel</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "raw",
                gap: 2,
              }}
            >
              {/* Problem Message */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  width: "50%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    id="alert-title"
                    label="Alert Title"
                    value={messageProblemTitle}
                    onChange={handleProblemTitleChange}
                    placeholder="Enter alert title"
                    fullWidth
                    sx={{  mr: 1 }}
                  />
                  <IconButton
                    sx={{ width: "2rem", height: "2rem" }}
                    onClick={() => openPlaceholderProblemDialog("title")}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <TextField
                    id="alert-body"
                    label="Alert Body"
                    value={messageProblemBody}
                    onChange={handleProblemBodyChange}
                    placeholder="Enter alert body"
                    multiline
                    rows={10}
                    maxRows={20}
                    fullWidth
                    sx={{ mr: 1 }}
                  />
                  <IconButton
                    sx={{ width: "2rem", height: "2rem" }}
                    onClick={() => openPlaceholderProblemDialog("body")}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem />

              {/* Recovery Message */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  width: "50%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    id="alert-title"
                    label="Alert Title"
                    value={messageRecoveryTitle}
                    onChange={handleRecoveryTitleChange}
                    placeholder="Enter alert title"
                    fullWidth
                    sx={{mr: 1 }}
                  />
                  <IconButton
                    sx={{ width: "2rem", height: "2rem"}}
                    onClick={() => openPlaceholderRecoveryDialog("title")}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <TextField
                    id="alert-body"
                    label="Alert Body"
                    value={messageRecoveryBody}
                    onChange={handleRecoveryBodyChange}
                    placeholder="Enter alert body"
                    multiline
                    rows={10}
                    maxRows={20}
                    fullWidth
                    sx={{mr: 1 }}
                  />
                  <IconButton
                    sx={{ width: "2rem", height: "2rem" }}
                    onClick={() => openPlaceholderRecoveryDialog("body")}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
            <Box sx={{display:"flex",flexDirection:"row",alignItems:"center",ml:2}}>
              <Typography>Enable</Typography>
            <Switch
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              inputProps={{ "aria-label": "notification toggle" }}
            /></Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} color="error">
            Cancel
          </Button>
          <Button onClick={handleEditSave} variant="contained" color="success">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isPlaceholderProblemDialogOpen}
        onClose={() => setIsPlaceholderProblemDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Placeholder</DialogTitle>
        <DialogContent>
          {placeholderProblemGroups.map((group) => (
            <Accordion
              key={group.name}
              expanded={expandedProblem === group.name}
              onChange={handleChangeProblem(group.name)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{group.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {group.placeholders.map((placeholder) => (
                    <ListItemButton
                      key={placeholder.value}
                      onClick={() =>
                        handleInsertProblemPlaceholder(placeholder.value)
                      }
                    >
                      <ListItemText
                        primary={placeholder.label}
                        secondary={placeholder.value}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPlaceholderProblemDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isPlaceholderRecoveryDialogOpen}
        onClose={() => setIsPlaceholderRecoveryDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Placeholder</DialogTitle>
        <DialogContent>
          {placeholderRecoveryGroups.map((group) => (
            <Accordion
              key={group.name}
              expanded={expandedRecovery === group.name}
              onChange={handleChangeRecovery(group.name)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{group.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {group.placeholders.map((placeholder) => (
                    <ListItemButton
                      key={placeholder.value}
                      onClick={() =>
                        handleInsertRecoveryPlaceholder(placeholder.value)
                      }
                    >
                      <ListItemText
                        primary={placeholder.label}
                        secondary={placeholder.value}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPlaceholderRecoveryDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationComponent;
