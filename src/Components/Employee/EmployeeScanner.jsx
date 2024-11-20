// import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { Box, Button } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function EmployeeScanner({
  handleScan,
  scanResult,
  setScanResult,
  activeScanner,
  setActiveScanner,
}) {
  const navigate = useNavigate();

  const [scanner, setScanner] = useState(null); // State to hold the scanner instance
  const [scannerStarted, setScannerStarted] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    setScanner(scanner);
    scanner.render(success, error);

    function success(result) {
      // scanner.clear();
      setScanResult(result);
    }

    function error(err) {
      // console.warn(err);
    }

    // return () => {
    //   // scanner.stop().catch((err) => {
    //   //   console.error("Error stopping scanner:", err);
    //   // });
    //   scanner
    //     .clear()
    //     .catch((err) => console.error("Error clearing scanner:", err));
    // };
  };

  useEffect(() => {
    if (activeScanner === "barcode" && scanResult === "" && scannerStarted) {
      const cleanup = startScanner();
      return cleanup;
    }
  }, [activeScanner, scanResult, scannerStarted]);

  useEffect(() => {
    if (scanResult) {
      async function fetchData() {
        if (scanResult) {
          handleScan(scanResult);
        }
      }
      fetchData();
    }
  }, [scanResult]);

  const renderScanner = () => {
    if (activeScanner === "barcode") {
      return <div id="reader"></div>;
    } else if (activeScanner === "image") {
      return console.log("imagescanner");
    }
    return null;
  };

  return (
    <div
      style={{
        // position: "relative",
        // height: "100vh",
        margin: "0",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <Box display="flex" justifyContent="center" mb={10}>
        {renderScanner()}
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (activeScanner == "image") {
              setActiveScanner("barcode");
            } else if (activeScanner === "barcode") {
              setActiveScanner("image");
            }
            setScanResult("");
            setScannerStarted(true);
          }}
          sx={{
            position: "absolute",
            top: 7,
            left: "85%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          {activeScanner == "barcode" ? "stop" : "start"}
        </Button>
      </Box>
    </div>
  );
}

export default EmployeeScanner;
