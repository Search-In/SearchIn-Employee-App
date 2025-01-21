import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  Backdrop,
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { HashLoader } from "react-spinners";
import searchinlogo from "../../assets/Searchin_Logo_Green.png";
import server from "../../Components/server";
import { api } from "../../api/api";

const primaryBtn = {
  backgroundColor: "rgba(26, 153, 142, 1)",
  color: "#fff",
  textTransform: "none",
  padding: "10px",
  fontSize: "16px",
  width: "100%",
  borderRadius: "25px",
  "&:hover": {
    backgroundColor: "rgba(26, 153, 142, 0.9)",
  },
};

const InputField = {
  marginBottom: "20px",
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#ddd",
    },
  },
};

const EmployeeLogin = () => {
  const navigate = useNavigate();

  const [showModal, setModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [employee, setEmployee] = useState();
  const [token, setToken] = useState();

  const handleLogin = async () => {
    if (phone === "" || password === "") {
      toast.error("Enter valid Login Credentials", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }

    try {
      setModal(true);
      const result = await api.auth.login({ phone, password });
      setModal(false);

      if (result?.data) {
        localStorage.setItem("employee", JSON.stringify(result.data?.user));
        localStorage.setItem("accessToken", result.data.accessToken);
        setEmployee(result?.data?.user);
        setToken(result?.data?.accessToken);
      } else {
        toast.error("Something Went Wrong", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      console.log(error);
      setModal(false);
      if (error.response && error.response.data) {
        return toast.error(error.response.data.message);
      }
      toast.error("An unexpected error occured. Please try again ", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  useEffect(() => {
    if (employee && token) {
      navigate("/employee-home");
    }
  }, [employee, token]);

  useEffect(() => {
    const employee = localStorage.getItem("employee");
    const accessToken = localStorage.getItem("accessToken");
    if (employee && accessToken) {
      navigate("/employee-home");
    }
  }, []);

  return (
    <>
      <ToastContainer />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={showModal}
      >
        <HashLoader color="#F37A20" size={100} />
      </Backdrop>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          boxSizing: "border-box",
          border: "1px solid #4caf50",
          padding: "20px",
          margin: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <img
            src={searchinlogo}
            alt="Logo"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "contain",
            }}
          />
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: "500",
              marginTop: "10px",
            }}
          >
            SearchIn
          </Typography>
          <Typography
            sx={{ fontSize: "24px", fontWeight: "500", marginTop: "10px" }}
          >
            Welcome Back!
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "#898A8A" }}>
            Please enter your Phone & password to sign in.
          </Typography>
        </Box>

        <Box sx={{ width: "100%", maxWidth: "400px" }}>
          <TextField
            variant="outlined"
            placeholder="Phone"
            fullWidth
            sx={InputField}
            onChange={(e) => setPhone(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            variant="outlined"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            fullWidth
            sx={InputField}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button sx={primaryBtn} onClick={handleLogin}>
            Sign In
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default EmployeeLogin;
