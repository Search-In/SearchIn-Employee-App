import React, { useState } from "react";
import {
  Drawer,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const UserDrawer = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  handleSubmit,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Drawer anchor="bottom" open={isOpen} onClose={onClose}>
      <Box
        sx={{
          height: 250,
          padding: 3,
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          //   justifyContent: "space-between",
        }}
      >
        {/* Close Icon */}
        <Box sx={{ position: "absolute", top: 10, right: 10 }}>
          <IconButton onClick={onClose} sx={{ backgroundColor: "#00000066" }}>
            <CloseIcon sx={{ color: "#FFFFFF" }} />
          </IconButton>
        </Box>

        {/* Header */}
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Poppins",
            fontWeight: 600,
            textAlign: "center",
            marginBottom: 1, // Reduced spacing
          }}
        >
          Enter User Details
        </Typography>

        {/* Input Fields */}
        <Box sx={{ marginTop: 1 }}>
          {" "}
          {/* Reduced top margin */}
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            margin="dense" // Reduced margin for input fields
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: "12px",
              },
            }}
          />
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            margin="dense" // Reduced margin for input fields
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: "12px",
              },
            }}
          />
        </Box>

        {/* Submit Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          sx={{
            height: 45,
            borderRadius: "12px",
            backgroundColor: "#F37A20",
            backgroundColor: "#F37A20",
            color: "#FFFFFF",
            fontFamily: "Poppins",
            fontSize: "16px",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#D5661C",
            },
          }}
        >
          Submit
        </Button>
      </Box>
    </Drawer>
  );
};

export default UserDrawer;
