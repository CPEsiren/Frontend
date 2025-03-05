import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  AlertColor,
  FormControlLabel,
  TextField,
  RadioGroup,
  Radio,
  Tabs,
  CircularProgress,
  Tab,
  styled,
  Typography,
  Avatar,
  Paper,
  Divider,
  Checkbox,
  ListItemText,
  List,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from "@mui/material";
import liff from "@line/liff";
import axios from "axios";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoLine from "../../assets/btn_base.png";
import Profile404 from "../../assets/profile404.jpg";
import { useLocation } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { InfoOutlined } from "@mui/icons-material";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export interface Channel {
  type: string;
}

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (channels: Channel) => void;
}

const NotificationDialog: React.FC<NotificationDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const channel = params.get("selectedChannel");

    if (channel === "line" || channel === "email") {
      setSelectedChannel(channel);
    }
  }, [location]);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedChannel, setSelectedChannel] = useState<"email" | "line">(
    "email"
  );
  const [email, setemail] = useState("");
  const [activeTab, setActiveTab] = useState("noti");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const handleCloseSnackbar = (): void => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSave = async () => {
    let body: {
      type: string;
      user_id: string | null;
      recipient: { name: string | null; send_to: string | null };
      problem_title: string;
      problem_body: string;
      recovery_title: string;
      recovery_body: string;
    };

    try {
      if (selectedChannel === "line") {
        body = {
          type: selectedChannel,
          user_id: localStorage.getItem("user_id"),
          recipient: {
            name: nameLine,
            send_to: lineUserId,
          },
          problem_title: messageProblemTitle,
          problem_body: messageProblemBody,
          recovery_title: messageRecoveryTitle,
          recovery_body: messageRecoveryBody,
        };
      } else {
        body = {
          type: selectedChannel,
          user_id: localStorage.getItem("user_id"),
          recipient: {
            name: email,
            send_to: email,
          },
          problem_title: messageProblemTitle,
          problem_body: messageProblemBody,
          recovery_title: messageRecoveryTitle,
          recovery_body: messageRecoveryBody,
        };
      }

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/media`,
        body,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        setSnackbar({
          open: true,
          message: `Successfully add ${selectedChannel}`,
          severity: "success",
        });
      }
      // Clear all fields
      setSelectedChannel("email");
      setemail("");

      //email
      setOtp("");
      setOtpSent(false);
      setActiveTab("noti");
      setCooldownTime(0);
      setIsValidEmail(false);
      setIsOtpVerified(false);
      setIsVerifying(false);

      // Logout from Line
      if (liff.isLoggedIn()) {
        liff.logout();
      }
      setLineUserId(null);

      //Problem message
      setMessageProblemTitle("");
      setMessageProblemBody("");
      setIsDefaultProblemMessage(false);

      //Recovery message
      setMessageRecoveryTitle("");
      setMessageRecoveryBody("");
      setIsDefaultRecoveryMessage(false);

      onSave({ type: selectedChannel });
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSnackbar({
          open: true,
          message: error.response?.data.message || "Error saving notification",
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Error saving notification",
          severity: "error",
        });
      }
    }
  };

  //cancel button
  const [showConfirmCancle, setShowConfirmCancle] = useState(false);

  const handleCancel = () => {
    if (
      lineUserId ||
      isValidEmail ||
      messageProblemTitle ||
      messageProblemBody ||
      messageRecoveryTitle ||
      messageRecoveryBody
    ) {
      setShowConfirmCancle(true);
    } else {
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    // Clear all fields
    setSelectedChannel("email");
    setemail("");

    //email
    setOtp("");
    setOtpSent(false);
    setActiveTab("noti");
    setCooldownTime(0);
    setIsValidEmail(false);
    setIsOtpVerified(false);
    setIsVerifying(false);

    // Logout from Line
    if (liff.isLoggedIn()) {
      liff.logout();
    }
    setLineUserId(null);

    setShowConfirmCancle(false);

    //Problem message
    setMessageProblemTitle("");
    setMessageProblemBody("");
    setIsDefaultProblemMessage(false);

    //Recovery message
    setMessageRecoveryTitle("");
    setMessageRecoveryBody("");
    setIsDefaultRecoveryMessage(false);

    // Close the dialog
    onClose();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmCancle(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // OTP state
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
    if (value.length <= 6) {
      setOtp(value);
      setOtpError("");
    }
    if (value.length === 6) {
      // Optionally, you can trigger OTP verification here
    } else if (value.length > 0) {
      setOtpError("OTP must be 6 digits");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setemail(email);
    setIsValidEmail(validateEmail(email));
  };

  const handleSendOTP = async (email: string) => {
    if (!isValidEmail) {
      setSnackbar({
        open: true,
        message: "Please enter a valid email address",
        severity: "error",
      });
      return;
    }
    try {
      setCooldownTime(60);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/email`,
        { user_id: localStorage.getItem("user_id"), email },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        setOtpSent(true);
        setSnackbar({
          open: true,
          message: `OTP sent to ${email} successfully`,
          severity: "success",
        });
      }
    } catch (error) {
      setCooldownTime(0);
      setSnackbar({
        open: true,
        message: `Error sending OTP to ${email}. Please try again.`,
        severity: "error",
      });
    }
  };

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/email/verify`,
        { otp, user_id: localStorage.getItem("user_id"), email: email },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        setIsOtpVerified(true);
        setSnackbar({
          open: true,
          message: `OTP verified successfully`,
          severity: "success",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSnackbar({
          open: true,
          message: error.response?.data.message || "Error verifying OTP",
          severity: "error",
        });
        return;
      }
      setSnackbar({
        open: true,
        message: `Error verifying OTP. Please try again.`,
        severity: "error",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    let timer: number;
    if (cooldownTime > 0) {
      timer = window.setInterval(() => {
        setCooldownTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownTime]);

  //Line login
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [profileLine, setProfileLine] = useState<string | null>(null);
  const [nameLine, setNameLine] = useState<string | null>(null);

  const LineButton = styled(Button)(() => ({
    backgroundColor: "#06C755", // Base color
    color: "#FFFFFF", // Font/logo color
    "&:hover": {
      backgroundColor: "rgba(6, 199, 85, 0.9)", // Base color + 10% black
    },
    "&:active": {
      backgroundColor: "rgba(6, 199, 85, 0.7)", // Base color + 30% black
    },
    "&.Mui-disabled": {
      backgroundColor: "#FFFFFF", // Disabled background color
      color: "rgba(30, 30, 30, 0.2)", // Disabled font color
      border: "1px solid rgba(229, 229, 229, 0.6)", // Disabled border color
    },
  }));

  useEffect(() => {
    // Initialize LIFF app
    setIsInitializing(true);
    liff.init({ liffId: `${import.meta.env.VITE_LINE_LIFF_ID}` });
    liff.ready
      .then(() => {
        console.log("LIFF initialization successful");
        if (!liff.isLoggedIn()) {
          console.log("User not logged in, initiating login");
          liff.login();
        } else {
          console.log("User already logged in");
        }
        fetchLineProfile();
      })
      .catch((err) => {
        console.error("LIFF initialization failed", err);
      });
  }, []);

  const fetchLineProfile = async () => {
    setIsLoading(true);
    try {
      const profile = await liff.getProfile();
      setLineUserId(profile.userId);
      setProfileLine(profile.pictureUrl ?? Profile404);
      setNameLine(profile.displayName);
    } catch (err) {
      console.error("Error fetching Line profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineLogin = async () => {
    setIsLoading(true);
    if (!liff.isLoggedIn()) {
      try {
        liff.login();
      } catch (err) {
        console.error("Line login failed", err);
        setIsLoading(false);
      }
    } else {
      await fetchLineProfile();
    }
  };

  //Line Logout
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleLineLogout = async () => {
    setIsLoading(true);
    try {
      if (liff.isLoggedIn()) {
        await liff.logout();
        setLineUserId(null);
        setProfileLine(null);
        setNameLine(null);
      }
    } catch (err) {
      console.error("Line logout failed", err);
    } finally {
      setIsLoading(false);
      setShowConfirmLogout(false);
    }
  };

  const handleDisconnect = () => {
    setShowConfirmLogout(true);
  };

  const handleCancelDisconnect = () => {
    setShowConfirmLogout(false);
  };

  //message problem alert
  const [messageProblemTitle, setMessageProblemTitle] = useState("");
  const [messageProblemBody, setMessageProblemBody] = useState("");
  const [isDefaultProblemMessage, setIsDefaultProblemMessage] = useState(false);
  const [isPlaceholderProblemDialogOpen, setIsPlaceholderProblemDialogOpen] =
    useState(false);
  const [currentProblemField, setCurrentProblemField] = useState<
    "title" | "body"
  >("title");
  const [expandedProblem, setExpandedProblem] = React.useState<string | false>(
    false
  );
  const [
    showConfirmDefaultProblemMessage,
    setShowConfirmDefaultProblemMessage,
  ] = useState(false);

  const defaultProblemTitle = "{TRIGGER.NAME}";
  const defaultProblemBody = `Status: {EVENT.STATUS}\n\nHost: {HOST.NAME}\nIP Address: {HOST.IP}\nSeverity: {TRIGGER.SEVERITY}\nExpression: {TRIGGER.EXPRESSION}\n\n<------Last value------>\n {TRIGGER.ALL.ITEM&VALUE}\n\nProblem Date: {EVENT.PROBLEM.TIMESTAMP}`;

  const placeholderProblemGroups = [
    {
      name: "Trigger",
      placeholders: [
        { value: "{TRIGGER.EXPRESSION}", label: "Trigger Expression" },
        { value: "{TRIGGER.NAME}", label: "Trigger Name" },
        { value: "{TRIGGER.SEVERITY}", label: "Trigger Severity" },
        {
          value: "{TRIGGER.ALL.ITEM&VALUE}",
          label: "Trigger All Item & Value",
        },
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
      name: "Event",
      placeholders: [
        { value: "{EVENT.STATUS}", label: "Event Status" },
        {
          value: "{EVENT.PROBLEM.TIMESTAMP}",
          label: "Event Problem Timestamp",
        },
      ],
    },
  ];

  const handleProblemTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setMessageProblemTitle(newTitle);
    if (isDefaultProblemMessage && newTitle !== defaultProblemTitle) {
      setIsDefaultProblemMessage(false);
    }
  };

  const handleProblemBodyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBody = e.target.value;
    setMessageProblemBody(newBody);
    if (isDefaultProblemMessage && newBody !== defaultProblemBody) {
      setIsDefaultProblemMessage(false);
    }
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

  const openPlaceholderProblemDialog = (field: "title" | "body") => {
    setCurrentProblemField(field);
    setIsPlaceholderProblemDialogOpen(true);
  };

  const handleChangeProblem =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedProblem(isExpanded ? panel : false);
    };

  const handleDefaultProblemMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    if (checked && (messageProblemTitle || messageProblemBody)) {
      setShowConfirmDefaultProblemMessage(true);
    } else {
      applyDefaultProblemMessage(checked);
    }
  };

  const applyDefaultProblemMessage = (apply: boolean) => {
    setIsDefaultProblemMessage(apply);
    if (apply) {
      setMessageProblemTitle(defaultProblemTitle);
      setMessageProblemBody(defaultProblemBody);
    } else {
      setMessageProblemTitle("");
      setMessageProblemBody("");
    }
  };

  const handleConfirmDefaultProblemMessage = () => {
    applyDefaultProblemMessage(true);
    setShowConfirmDefaultProblemMessage(false);
  };

  //message Recovery alert
  const [messageRecoveryTitle, setMessageRecoveryTitle] = useState("");
  const [messageRecoveryBody, setMessageRecoveryBody] = useState("");
  const [isDefaultRecoveryMessage, setIsDefaultRecoveryMessage] =
    useState(false);
  const [isPlaceholderRecoveryDialogOpen, setIsPlaceholderRecoveryDialogOpen] =
    useState(false);
  const [currentRecoveryField, setCurrentRecoveryField] = useState<
    "title" | "body"
  >("title");
  const [expandedRecovery, setExpandedRecovery] = React.useState<
    string | false
  >(false);
  const [
    showConfirmDefaultRecoveryMessage,
    setShowConfirmDefaultRecoveryMessage,
  ] = useState(false);

  const defaultRecoveryTitle = "{TRIGGER.NAME}";
  const defaultRecoveryBody = `Status: {EVENT.STATUS}\n\nHost: {HOST.NAME}\nIP Address: {HOST.IP}\nSeverity: {TRIGGER.SEVERITY}\nExpression: {TRIGGER.EXPRESSION}\nResolved Expression: {TRIGGER.RESOLVED.EXPRESSION}\n\n<------Last value------>\n {TRIGGER.ALL.ITEM&VALUE}\n\nResolved Date: {EVENT.RESOLVED.TIMESTAMP}`;

  const placeholderRecoveryGroups = [
    {
      name: "Trigger",
      placeholders: [
        { value: "{TRIGGER.EXPRESSION}", label: "Trigger Expression" },
        { value: "{TRIGGER.NAME}", label: "Trigger Name" },
        {
          value: "{TRIGGER.RESOLVED.EXPRESSION}",
          label: "Trigger Resolved Expression",
        },
        { value: "{TRIGGER.SEVERITY}", label: "Trigger Severity" },
        {
          value: "{TRIGGER.ALL.ITEM&VALUE}",
          label: "Trigger All Item & Value",
        },
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
      name: "Event",
      placeholders: [
        { value: "{EVENT.STATUS}", label: "Event Status" },
        {
          value: "{EVENT.RESOLVED.TIMESTAMP}",
          label: "Event Resolved Timestamp",
        },
      ],
    },
  ];

  const handleRecoveryTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTitle = e.target.value;
    setMessageRecoveryTitle(newTitle);
    if (isDefaultRecoveryMessage && newTitle !== defaultRecoveryTitle) {
      setIsDefaultRecoveryMessage(false);
    }
  };

  const handleRecoveryBodyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBody = e.target.value;
    setMessageRecoveryBody(newBody);
    if (isDefaultRecoveryMessage && newBody !== defaultRecoveryBody) {
      setIsDefaultRecoveryMessage(false);
    }
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

  const openPlaceholderRecoveryDialog = (field: "title" | "body") => {
    setCurrentRecoveryField(field);
    setIsPlaceholderRecoveryDialogOpen(true);
  };

  const handleChangeRecovery =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedRecovery(isExpanded ? panel : false);
    };

  const handleDefaultRecoveryMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;
    if (checked && (messageRecoveryTitle || messageRecoveryBody)) {
      setShowConfirmDefaultRecoveryMessage(true);
    } else {
      applyDefaultRecoveryMessage(checked);
    }
  };

  const applyDefaultRecoveryMessage = (apply: boolean) => {
    setIsDefaultRecoveryMessage(apply);
    if (apply) {
      setMessageRecoveryTitle(defaultRecoveryTitle);
      setMessageRecoveryBody(defaultRecoveryBody);
    } else {
      setMessageRecoveryTitle("");
      setMessageRecoveryBody("");
    }
  };

  const handleConfirmDefaultRecoveryMessage = () => {
    applyDefaultRecoveryMessage(true);
    setShowConfirmDefaultRecoveryMessage(false);
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>Add Notification Channel</DialogTitle>
      <DialogContent>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab value={"noti"} label="Notification Channel" />
          <Tab value={"prob"} label="Problem Message" />
          <Tab value={"recov"} label="Resolved Message" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {activeTab === "noti" && (
            <>
              <RadioGroup
                value={selectedChannel}
                onChange={(e) => {
                  setSelectedChannel(e.target.value as "email" | "line");
                  setemail("");
                  if (e.target.value === "line") {
                    setOtp("");
                  }
                }}
              >
                <Box>
                  <FormControlLabel
                    value="email"
                    control={<Radio />}
                    label="Email"
                    disabled={!!lineUserId}
                  />
                  <FormControlLabel
                    value="line"
                    control={<Radio />}
                    label="Line"
                    disabled={isOtpVerified}
                  />
                </Box>
              </RadioGroup>
              {selectedChannel === "email" && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                    <TextField
                      sx={{ width: "50%", mr: 2 }}
                      label="Email Address"
                      value={email}
                      onChange={handleEmailChange}
                      disabled={isOtpVerified}
                      error={email !== "" && !isValidEmail}
                      helperText={
                        email !== "" && !isValidEmail
                          ? "Invalid email address"
                          : ""
                      }
                    />
                    <Button
                      variant="contained"
                      endIcon={<SendIcon />}
                      color="secondary"
                      onClick={() => handleSendOTP(email)}
                      sx={{ mb: 1 }}
                      disabled={
                        isOtpVerified || cooldownTime > 0 || !isValidEmail
                      }
                    >
                      {cooldownTime > 0
                        ? `Resend in ${cooldownTime}s`
                        : "Send OTP"}
                    </Button>
                  </Box>
                  {otpSent && (
                    <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                      <TextField
                        sx={{ mr: 2 }}
                        label="Enter OTP"
                        value={otp}
                        onChange={handleOtpChange}
                        disabled={isOtpVerified}
                        error={!!otpError}
                        helperText={otpError}
                        inputProps={{
                          maxLength: 6,
                          inputMode: "numeric",
                          pattern: "[0-9]*",
                        }}
                      />
                      {isOtpVerified ? (
                        <CheckCircleIcon
                          color="success"
                          sx={{ fontSize: 40, mb: 1 }}
                        />
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleVerifyOTP}
                          sx={{ mb: 1 }}
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <CircularProgress size={24} />
                          ) : (
                            "Verify OTP"
                          )}
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              )}
              {(selectedChannel === "line" || isInitializing) && (
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  {isLoading ? (
                    <CircularProgress />
                  ) : lineUserId ? (
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        textAlign: "center",
                        maxWidth: 300,
                        width: "100%",
                      }}
                    >
                      <Avatar
                        src={profileLine ?? Profile404}
                        sx={{ width: 100, height: 100, mb: 2, mx: "auto" }}
                      />
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {nameLine}
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleDisconnect}
                      >
                        Logout
                      </Button>
                    </Paper>
                  ) : (
                    <LineButton
                      variant="contained"
                      onClick={handleLineLogin}
                      sx={{ width: "200px", height: "50px" }}
                      startIcon={
                        <img src={LogoLine} alt="LINE" width="24" height="24" />
                      }
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Login with LINE"
                      )}
                    </LineButton>
                  )}
                </Box>
              )}
            </>
          )}
          {activeTab === "prob" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: 1,
                mt: 2,
                border: "1px solid #D3D3D3",
                borderRadius: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {/* Problem Message */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    // backgroundColor: (theme) => theme.palette.error.main + "20",
                    borderRadius: "8px",
                    width: 1,
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      px: 1,
                      pt: 2,
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <Typography
                      // variant="h5"
                      sx={{
                        alignItems: "left",
                        fontWeight: "bold",
                        color: "red",
                        fontSize: "1.7rem",
                      }}
                    >
                      Problem Message
                    </Typography>
                    <Tooltip
                      title="Message for alerting problem"
                      arrow
                      placement="right"
                    >
                      <IconButton>
                        <InfoOutlined />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider sx={{ width: "95%", mt: -1 }} />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isDefaultProblemMessage}
                        onChange={handleDefaultProblemMessageChange}
                        sx={{
                          "&.Mui-checked": {
                            color: "blue", // Set background color when checked
                          },
                          ml: 1,
                        }}
                      />
                    }
                    label="Use Default Message"
                  />
                  <Box
                    sx={{ display: "flex", alignItems: "center", ml: 1, mb: 2 }}
                  >
                    <TextField
                      id="alert-title"
                      label="Alert Title"
                      value={messageProblemTitle}
                      onChange={handleProblemTitleChange}
                      placeholder="Enter alert title"
                      sx={{ width: "90%" }}
                    />
                    <IconButton
                      sx={{ width: "5%", ml: 1.5, color: "#242D5D" }}
                      onClick={() => openPlaceholderProblemDialog("title")}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>

                  {/* <Divider sx={{ width: "95%" }} /> */}

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      ml: 1,
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
                      sx={{ width: "90%" }}
                    />
                    <IconButton
                      sx={{
                        width: "5%",
                        ml: 1.5,
                        color: "#242D5D",
                        height: "5%",
                      }}
                      onClick={() => openPlaceholderProblemDialog("body")}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Divider orientation="vertical" flexItem />
              </Box>
            </Box>
          )}
          {activeTab === "recov" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: 1,
                mt: 2,
                border: "1px solid #D3D3D3",
                borderRadius: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {/* resolved Message */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    borderRadius: "8px",
                    width: 1,
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      px: 1,
                      pt: 2,
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <Typography
                      sx={{
                        alignItems: "left",
                        fontWeight: "bold",
                        color: "green",
                        fontSize: "1.7rem",
                      }}
                    >
                      Resolved Message
                    </Typography>
                    <Tooltip
                      title="Message for alerting that the problem is resolved"
                      arrow
                      placement="right"
                    >
                      <IconButton>
                        <InfoOutlined />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Divider sx={{ width: "95%", mt: -1 }} />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isDefaultRecoveryMessage}
                        onChange={handleDefaultRecoveryMessageChange}
                        sx={{
                          "&.Mui-checked": {
                            color: "blue", // Set background color when checked
                          },
                          ml: 1,
                        }}
                      />
                    }
                    label="Use Default Message"
                  />
                  <Box
                    sx={{ display: "flex", alignItems: "center", ml: 1, mb: 2 }}
                  >
                    <TextField
                      id="alert-title"
                      label="Alert Title"
                      value={messageRecoveryTitle}
                      onChange={handleRecoveryTitleChange}
                      placeholder="Enter alert title"
                      sx={{ width: "90%" }}
                    />
                    <IconButton
                      sx={{ width: "5%", ml: 1.5, color: "#242D5D" }}
                      onClick={() => openPlaceholderRecoveryDialog("title")}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>

                  {/* <Divider /> */}

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      ml: 1,
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
                      sx={{ width: "90%" }}
                    />
                    <IconButton
                      sx={{
                        width: "5%",
                        ml: 1.5,
                        color: "#242D5D",
                        height: "5%",
                      }}
                      onClick={() => openPlaceholderRecoveryDialog("body")}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Divider orientation="vertical" flexItem />
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ mb: 1, mr: 1 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
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
          onClick={handleSave}
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
      </DialogActions>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmCancle} onClose={handleCancelConfirmation}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          Are you sure you want to cancel? Your LINE login information will be
          lost.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirmation} color="primary">
            No, Keep Changes
          </Button>
          <Button onClick={handleConfirmCancel} color="primary" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Disconnection */}
      <Dialog open={showConfirmLogout} onClose={handleCancelDisconnect}>
        <DialogTitle>Confirm Disconnection</DialogTitle>
        <DialogContent>
          Are you sure you want to disconnect your LINE account? Your login
          information will be lost.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDisconnect} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLineLogout} color="error" autoFocus>
            {isLoading ? <CircularProgress size={24} /> : "Disconnect"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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

      {/* Confirmation Dialog for Default Problem Message */}
      <Dialog
        open={showConfirmDefaultProblemMessage}
        onClose={() => setShowConfirmDefaultProblemMessage(false)}
      >
        <DialogTitle>Confirm Default Message</DialogTitle>
        <DialogContent>
          <Typography>
            Applying the default message will overwrite your current content.
            Are you sure you want to proceed?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDefaultProblemMessage(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDefaultProblemMessage} color="primary">
            Apply Default
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

      {/* Confirmation Dialog for Default Recovery Message */}
      <Dialog
        open={showConfirmDefaultRecoveryMessage}
        onClose={() => setShowConfirmDefaultRecoveryMessage(false)}
      >
        <DialogTitle>Confirm Default Message</DialogTitle>
        <DialogContent>
          <Typography>
            Applying the default message will overwrite your current content.
            Are you sure you want to proceed?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDefaultRecoveryMessage(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDefaultRecoveryMessage} color="primary">
            Apply Default
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default NotificationDialog;
