import { Button } from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { delay } from "../../lib/time";

function EmployeeScanner({ handleScan, setIsScanning, isScanning }) {
  const [scanner, setScanner] = useState(null);
  // const [isScanning, setIsScanning] = useState(false)
  const readerRef = useRef(null);
  const [scanResult, setScanResult] = useState("");
  const [inputValue, setInputValue] = useState(""); // New state for input value
  const showInput = false;

  const getQrBoxSize = () => {
    if (readerRef.current) {
      const width = readerRef.current.clientWidth;
      const height = readerRef.current.clientHeight;
      console.log("math ", Math.min(width, height) * 0.8);
      return `${Math.min(width, height) * 0.8}`;
    }
    console.log("250");
    return 250;
  };

  // Debounce the handleScan function
  const [debouncedScanResult] = useDebounce(scanResult, 800); // 500ms debounce delay
  const [isThrottled, setIsThrottled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isThrottled) return;
        setIsThrottled(true);
        await handleScan(debouncedScanResult);
        await delay(3000);
        setScanResult("");
        setIsThrottled(false);
      } catch (error) {
        console.log("Error handling scan:", error);
      }
    };

    if (debouncedScanResult) fetchData();
  }, [debouncedScanResult]);

  const handleScanner = async () => {
    if (isScanning) {
      scanner
        .stop()
        .then(() => {
          console.log("Scanner stopped.");
          setIsScanning(false);
        })
        .catch((err) => {
          console.log("Failed to stop scanner: ", err);
        });
    } else {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          const backCamera = devices.find((device) =>
            device.label.toLowerCase().includes("back")
          );
          const frontCamera = devices.find((device) =>
            device.label.toLowerCase().includes("front")
          );
          const cameraId = backCamera
            ? backCamera.id
            : frontCamera
            ? frontCamera.id
            : devices[0].id;
          //   const cameraId = devices[0].id; // Use the first available camera
          const html5QrCode = new Html5Qrcode(readerRef.current.id);

          await html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: {
                width: getQrBoxSize(),
                height: getQrBoxSize(),
              },
              // qrbox: getQrBoxSize(),
            },
            (decodedText) => {
              // setScanResult(decodedText);
              // handleScan(decodedText);
              if (decodedText !== scanResult) {
                setScanResult(decodedText); // Use debounced version
              }

              console.log(`QR Code detected: ${decodedText}`);
            },
            (errorMessage) => {
              //   console.log(`QR Code scanning error: ${errorMessage}`);
            }
          );

          setScanner(html5QrCode);
          setIsScanning(true);
        } else {
          console.log("No cameras found.");
        }
      } catch (error) {
        console.log("Error starting scanner: ", error);
      }
    }
  };

  // useEffect(() => {
  //   return () => {
  //     const stopScanner = async () => {
  //       if (scanner && isScanning) {
  //         try {
  //           await scanner.stop()
  //           console.log("Scanner stopped..")
  //           setIsScanning(false)
  //         } catch (err) {
  //           console.log("Failed to stop scanner: ", err)
  //         }
  //       }
  //     }
  //     stopScanner()
  //   }
  // }, [scanner, isScanning])

  return (
    <>
      <div
        id="reader"
        ref={readerRef}
        style={{ width: "100%", height: "156%" }}
      ></div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleScanner}
        sx={{
          backgroundColor: isScanning ? "#E40101" : "#F37A20",
          color: "#fff",
          textTransform: "none",
          fontSize: "24px",
          fontFamily: "Poppins",
          "&.MuiButtonBase-root:hover": {
            backgroundColor: isScanning ? "#C40000" : "#F37A20",
          },
          position: "absolute",
          top: "15%",
          right: "0%",
          transform: "translateX(-50%)",
          zIndex: 10,
          padding: "5px",
        }}
      >
        {isScanning ? "Stop" : "Start"}
      </Button>
      {showInput ? (
        <div className="relative flex justify-between">
          <input
            placeholder="Enter barcode"
            variant="outlined"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            fullWidth
            sx={{
              zIndex: 10,
              backgroundColor: "#fff",
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={() => setScanResult(inputValue)}
            sx={{
              transform: "translateX(-50%)",
              zIndex: 10,
              padding: "10px 20px",
            }}
          >
            Submit
          </Button>
        </div>
      ) : null}
    </>
  );
}

export default EmployeeScanner;
