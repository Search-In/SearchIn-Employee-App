import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  AppBar,
  Avatar,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMqtt } from "../../context/MqttContext";

const EmployeeHome = () => {
  const { disconnect, isConnected, connect, publish, setIsSessionEnded } =
    useMqtt();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const data = localStorage.getItem("employee");
  const employeeData = JSON.parse(data);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleLogout = async (e) => {
    if (isConnected) {
      e.preventDefault();
      setOpen(false);
      localStorage.removeItem("employee");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("virtualcartweight");
      const session = localStorage.getItem("session");
      publish("guestUser/endSession", { sessionId: session });
      setIsSessionEnded(true);
      disconnect();
      localStorage.removeItem("session");
      localStorage.removeItem("trolley");
      navigate("/employee-login");
    } else {
      e.preventDefault();
      setOpen(false);
      localStorage.removeItem("employee");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("trolley");
      localStorage.removeItem("session");
      navigate("/employee-login");
    }
  };

  return (
    <div>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#F37A20", color: "#fff", opacity: 0.8 }}
      >
        <Toolbar>
          <AccountCircleIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {employeeData?.name}
          </Typography>
          <Button color="inherit" onClick={handleClickOpen}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ padding: 2, textAlign: "center" }}>
              <Avatar
                alt={employeeData?.name}
                src={employeeData?.imageUrl}
                sx={{ width: 100, height: 100, margin: "auto", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                {employeeData?.name}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {employeeData?.position || "Employee"}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {employeeData?.department || "Dispatch"}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>
                Employee Information
              </Typography>
              <Typography variant="body1">
                <strong>Mobile:</strong> {employeeData?.mobile}
              </Typography>
              <Typography variant="body1">
                <strong>Pincode:</strong> {employeeData?.pincode || "411046"}
              </Typography>
              <Typography variant="body1">
                <strong>Department:</strong>{" "}
                {employeeData?.department || "Dispatch"}
              </Typography>
              <Typography variant="body1">
                <strong>Position:</strong>{" "}
                {employeeData?.position || "Employee"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Logout"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EmployeeHome;
