import InfoIcon from "@mui/icons-material/Info";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Instructions = () => {
  return (
    <Box
      sx={{
        padding: 2,
        border: "1px solid #ddd",
        borderRadius: 2,
        maxWidth: 600,
        margin: "auto",
        boxShadow: 3,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          marginBottom: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <InfoIcon sx={{ marginRight: 1 }} /> Instructions
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 2 }}>
        Follow these steps to update the label code:
      </Typography>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          1. Start Scanning:
        </Typography>
        <Typography variant="body2">
          Click the "Start" button to begin scanning the barcode of the product.
        </Typography>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          2. Scan the Barcode:
        </Typography>
        <Typography variant="body2">
          Use the scanner to read the barcode on the product.
        </Typography>
      </Box>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          3. Update Label Code:
        </Typography>
        <Typography variant="body2">
          Enter the label code values in the fields provided.
        </Typography>
      </Box>
      <Box>
        <Typography variant="body2">
          The label code format is: Area-Bay No-Rack-Shelf.
        </Typography>
        <Typography variant="body2">
          Press "Enter" to move to the next field, or click the "Update Label
          Code" button to save changes.
        </Typography>
      </Box>
    </Box>
  );
};

export default Instructions;
