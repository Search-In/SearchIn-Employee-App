import {
  Alert,
  Backdrop,
  Box,
  Button,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HashLoader, PacmanLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import server from "../../Components/server";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMqtt } from "../../../src/context/MqttContext";
import { Html5Qrcode } from "html5-qrcode";

function TrolleyLink() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = location?.state;

  const [scanResult, setScanResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [trolleyLoading, setTrolleyLoading] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [hardwareSnackbarOpen, setHardwareSnackbarOpen] = useState(false);
  const [guestUserInfo, setGuestUserInfo] = useState({});
  const [trolleyWaititng, setTrolleyWaiting] = useState(null);
  const employee = localStorage.getItem("employee");
  const accessToken = localStorage.getItem("accessToken");
  const readerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  const {
    client,
    publish,
    isConnected,
    connect,
    disconnect,
    joinUserSession,
    setGuestUserId,
    setQrCode,
    setIsSessionEnded,
    trolleyStatus,
  } = useMqtt();

  // const startScanner = () => {
  //   if (scanner) {
  //     return
  //   }
  //   const scannerInstance = new Html5QrcodeScanner("reader", {
  //     qrbox: {
  //       width: 250,
  //       height: 250,
  //     },
  //     fps: 5,
  //   })

  //   setScanner(scannerInstance)
  //   scannerInstance.render(success, error)

  //   function success(result) {
  //     setScanResult(result)
  //     scannerInstance.clear() // Clear the scanner immediately after successful scan
  //   }

  //   function error(err) {
  //     // console.error("Scanner error:", err);
  //   }
  //   return () => {
  //     scannerInstance
  //       .clear()
  //       .catch((err) => console.error("Error clearing scanner:", err))
  //   }
  // }

  // const stopScanner = () => {
  //   if (scanner) {
  //     scanner
  //       .clear()
  //       .catch((err) => console.error("Error clearing scanner:", err))
  //     setScanner(null)
  //   }
  // }

  const guestUserSignIn = async () => {
    try {
      trolleyWaititng ? null : setLoading(true);
      const result = await axios.get(
        `${server}/trolley/connect-trolley/${scanResult}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log("guest uesr login ", result);
      if (result?.data) {
        localStorage.setItem("trolley", result?.data?.trolley?._id);
        sessionStorage.setItem("qrCode", scanResult);
        setQrCode(scanResult);
        setTrolleyLoading(false);
        connect();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      console.log("error is ", error);
      if (error?.response?.data?.message === "Trolley is Yet to Connect") {
        setTrolleyWaiting(true);
      } else {
        toast.error(error?.response?.data?.message || "An error occurrred");
        console.log("toast is ", error?.response?.data?.message);
        console.log("setting scan result to empty");
        setScanResult("");
        // setScanResult("");
      }
      // setScanResult("");
      // startScanner();
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   startScanner()
  //   return () => stopScanner()
  // }, [])

  useEffect(() => {
    if (scanResult && scanResult !== "") {
      if (employee && accessToken) {
        setLoading(true);
        guestUserSignIn();
        // connect()
      }
      //   else {
      //     guestUserSignIn()
      //   }
    }
  }, [scanResult]);

  useEffect(() => {
    if (isConnected) {
      if (employee && accessToken) {
        console.log("publishign the joinsession ", employee);
        publish("guestUser/joinSession", {
          guestUserId: employee,
          qrCode: scanResult,
        });
        const getTrolley = async () => {
          if (scanResult !== "") {
            const trolleyData = await axios.get(
              `${server}/trolley/get-trolley-trolleyqrCode/${scanResult}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );
            console.log("saved data", trolleyData?.data?._id);
            localStorage.setItem("trolley", trolleyData?.data?._id);
          }
        };
        getTrolley();
        localStorage.setItem("virtualcartweight", 0);
        setIsSessionEnded(false);
        setLoading(false);
        navigate("/employee-order", { state: { vendor_order: orderId } });
      }
    }
  }, [navigate, isConnected]);

  useEffect(() => {
    if (trolleyWaititng) {
      setTrolleyLoading(true);
      let attempts = 0;
      const intervalId = setInterval(() => {
        if (attempts >= 10) {
          clearInterval(intervalId);
          setTrolleyLoading(false);
          console.log("Timeout: Trolley did not join within 10 seconds");
          setHardwareSnackbarOpen(true);
          // startScanner()
          return;
        }
        attempts += 1;
        guestUserSignIn();
      }, 2000);

      return () => clearInterval(intervalId);
    }
  }, [trolleyWaititng, scanResult]);

  const getQrBoxSize = () => {
    // if (readerRef.current) {
    //   const width = readerRef.current.clientWidth
    //   const height = readerRef.current.clientHeight
    //   console.log("math ", Math.min(width, height) * 0.8)
    //   return `${Math.min(width, height)}`
    // }
    // console.log("250")
    return 250;
  };

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
                width: 150,
                height: 150,
              },
              // qrbox: getQrBoxSize(),
            },
            (decodedText) => {
              setScanResult(decodedText);
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

  console.log("scanreulst ", scanResult);
  return (
    <>
      {" "}
      <ToastContainer />
      <div
        style={{
          position: "relative",
          height: "100vh",
          margin: "0",
          padding: "0",
          overflow: "hidden",
          background: "#f5f5f5",
          border: "1px solid red",
        }}
      >
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <HashLoader color="#5EC401" size={100} />
        </Backdrop>
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={trolleyLoading}
        >
          <PacmanLoader color="#FFC107" size={50} />
        </Backdrop>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "10px",
            backgroundColor: "#ffffff",
            boxShadow: "0px 4px 2px -2px gray",
            position: "fixed",
            width: "100%",
            top: 0,
            zIndex: 1000,
          }}
        >
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            Scan the QR on Trolley
          </Typography>
        </Box>
        {/* <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <div id="reader"></div>
      </Box> */}

        {/* barcodescanner */}
        <div
          id="reader"
          ref={readerRef}
          // style={{ width: "100%", height: "100%" }}
        ></div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleScanner}
          sx={{
            backgroundColor: isScanning ? "#E40101" : "#5EC401",
            color: "#fff",
            textTransform: "none",
            fontSize: "18px",
            fontFamily: "Poppins",
            "&.MuiButtonBase-root:hover": {
              backgroundColor: isScanning ? "#C40000" : "#64cf00",
            },
            position: "absolute",
            top: 150,
            left: "85%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          {isScanning ? "Stop" : "Start"}
        </Button>

        <Snackbar
          open={hardwareSnackbarOpen}
          autoHideDuration={6000}
          onClose={() => setHardwareSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={() => setHardwareSnackbarOpen(false)} severity="info">
            Trolley Failed to Connect:Timed Out!
          </Alert>
        </Snackbar>
      </div>
    </>
  );
}

export default TrolleyLink;
