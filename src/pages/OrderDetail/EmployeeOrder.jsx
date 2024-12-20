import { ArrowBack } from "@mui/icons-material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import server from "../../Components/server";
import BarcodeScanner from "../../Components/Employee/BarcodeScanner";
import Instructions from "../../Components/Employee/LabelCode/Instructions";
import LabelCodeCard from "../../Components/Employee/LabelCode/LabelCodeCard";
import ProductCard from "../../Components/Employee/ProductCard";
import { useMqtt } from "../../context/MqttContext";
import TrolleyValues from "./Layout/TrolleyValues";

const EmployeeOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = location.state || {};
  const { publish, isConnected } = useMqtt();
  const [id, setId] = useState();
  const [allProducts, setProducts] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [scanResult, setScanResult] = useState("");
  const [activeScanner, setActiveScanner] = useState("image");
  const [orderInfo, setOrderInfo] = useState({});
  const [productInfo, setProductInfo] = useState("");
  const [openLabelCard, setOpenLabelCard] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const employeeId = JSON.parse(localStorage.getItem("employee"))?._id;

  const getProductByBarcode = async (barcode) => {
    try {
      setOpenLabelCard(false);
      const result = await axios.get(
        `${server}/vendor/products/barcode/${barcode}`,
        {
          params: { vendor: localStorage.getItem("vendorID") },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (result?.data.length > 0) {
        setProductInfo(result.data[0]);
        setOpenLabelCard(true);
      } else {
        showSnackbar("Product is Not in List!", "warning");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateLabelCode = async (productId, labelCode, weight) => {
    try {
      const payload = { labelcode: labelCode, weight };
      await axios.put(`${server}/products/update/${productId}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      showSnackbar("Product Updated", "info");
    } catch (error) {
      showSnackbar("Failed to update!", "warning");
    }
  };

  const getOrders = async () => {
    const result = await axios.get(`${server}/employee-labelcode/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    setOrderInfo({
      message: result?.data?.message,
      orderNo: result?.data?.orderId,
      totalAmount: result?.data?.total_amount,
    });
    setProducts(result.data?.products || []);
    setId(result?.data?.order?._id);
  };

  const handleSnackbarClose = () => setOpenSnackbar(false);

  const vibrateDevice = (pattern) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
    if (severity === "warning") vibrateDevice([200, 100, 200]);
  };

  const handleScan = async (barcode) => {
    if (orderId) {
      const productBarcode = String(barcode).trim();
      let foundProduct = false;

      const updatedProducts = await Promise.all(
        allProducts.map(async (product) => {
          const productBarcodes = Array.isArray(
            product.vendor_product?.product?.barcode
          )
            ? product.vendor_product?.product?.barcode.map(String)
            : [];

          if (productBarcodes.includes(productBarcode)) {
            foundProduct = true;

            if (product.scannedCount >= product.quantity) {
              showSnackbar("Product is Already Scanned!", "warning");
              setScanResult("");
              return product;
            }

            const newScannedCount = product.scannedCount + 1;
            const isScanned = newScannedCount === product.quantity;

            await axios.patch(
              `${server}/orders/update-scannedCount?orderId=${orderId}&productId=${product.vendor_product?._id}`,
              {
                scannedCount: newScannedCount,
                isScanned,
                barcode: productBarcode,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );

            showSnackbar("Your Product Scanned!", "info");

            const netWeight = parseFloat(
              localStorage.getItem("virtualcartweight")
            );
            const trolley = localStorage.getItem("trolley");
            const productWeight = product.vendor_product?.product?.weight;
            const totalWeight = netWeight + productWeight;

            localStorage.setItem("virtualcartweight", totalWeight);
            publish("guestUser/updateVirtualCartWeight", {
              virtualWeight: totalWeight,
              trolleyId: trolley,
            });

            setTimeout(() => setScanResult(""), 3000);

            return { ...product, scannedCount: newScannedCount, isScanned };
          }

          return product;
        })
      );

      if (!foundProduct) showSnackbar("Product is Not in List!", "warning");
      setProducts(updatedProducts);
    } else {
      setTimeout(() => setScanResult(""), 2000);
      await getProductByBarcode(barcode);
    }
  };

  const allProductsScanned = allProducts.every(
    (product) => product.scannedCount >= product.quantity
  );

  const updateEndScanTime = async () => {
    try {
      await axios.patch(
        `${server}/update-employee-order/employeeOrder?employeeId=${employeeId}&orderId=${orderId}`,
        { endScanTime: new Date() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleDispatch = async () => {
    if (allProductsScanned) {
      if (isScanning)
        return showSnackbar("Please Turned Off the Camera", "warning");
      await updateEndScanTime();
      navigate("/employee-dispatch", { state: { orderId: id, id: orderId } });
    } else {
      console.log("Not all products are scanned.");
    }
  };

  const onLabelCodeChange = async (productId, labelCode, weight) => {
    await updateLabelCode(productId, labelCode, weight);
    getOrders();
    setOpenLabelCard(false);
  };

  const updateScanTime = async () => {
    try {
      await axios.patch(
        `${server}/update-employee-order/employeeOrder?employeeId=${employeeId}&orderId=${orderId}`,
        { startScanTime: new Date() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
    } catch (error) {
      console.log(error.response.data);
    }
  };

  useEffect(() => {
    if (orderId) {
      getOrders();
      updateScanTime();
    }
  }, [orderId]);
  useEffect(() => {
    if (allProducts.length > 0) {
      const scannedCount = allProducts.filter(
        (product) => product.scannedCount === product.quantity
      ).length;

      const totalPrice = allProducts.reduce((total, product) => {
        let variantMultiplier = product?.variant || 1;
        if (variantMultiplier >= 100) variantMultiplier /= 1000;
        return (
          total +
          product.scannedCount * (product?.price || 0) * variantMultiplier
        );
      }, 0);

      setOrderInfo((prev) => ({
        ...prev,
        scannedTotal: scannedCount,
        scannedAmout: totalPrice,
      }));
    }
  }, [allProducts]);

  const handleBackClick = () => {
    if (isScanning)
      return showSnackbar("Please Turned Off the Camera", "warning");
    navigate(orderId ? "/employee-orders" : "/employee-home");
  };

  return (
    <div style={styles.container}>
      {isConnected && <TrolleyValues />}
      <Box sx={styles.header}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="back"
          onClick={handleBackClick}
          sx={{ position: "absolute", top: "4px", left: "10px" }}
        >
          <ArrowBack />
        </IconButton>
      </Box>
      <div style={styles.topHalf}>
        <div style={styles.scannerContainer}>
          <BarcodeScanner
            handleScan={handleScan}
            scanResult={scanResult}
            setScanResult={setScanResult}
            activeScanner={activeScanner}
            setActiveScanner={setActiveScanner}
            setIsScanning={setIsScanning}
            isScanning={isScanning}
          />
        </div>
      </div>
      {orderId && (
        <Box sx={styles.TopDiv}>
          <Typography variant="h6" sx={styles.TotalTotal}>
            Order #{orderInfo.orderNo}
          </Typography>
          <Typography sx={styles.TotalTotal}>Total Products</Typography>
          <Typography sx={styles.TotalTotal}>
            {orderInfo.scannedTotal} / {allProducts.length}
          </Typography>
        </Box>
      )}

      <div style={styles.bottomHalf}>
        {!orderId && <Instructions />}
        {openLabelCard && (
          <>
            <div style={styles.overlay}></div>
            <Box style={{ position: "absolute", bottom: 170, zIndex: 999 }}>
              <LabelCodeCard
                product={productInfo}
                onLabelCodeChange={onLabelCodeChange}
                onRemove={() => setOpenLabelCard(false)}
              />
            </Box>
          </>
        )}

        {orderInfo.message && (
          <Box sx={styles.messageSection}>
            <Typography variant="h6" sx={styles.messageHeading}>
              Customer's Special Message
            </Typography>
            <Box sx={styles.messageBody}>
              <Typography variant="body2">{orderInfo.message}</Typography>
            </Box>
          </Box>
        )}

        <Container maxWidth={false} disableGutters>
          <Grid container spacing={0}>
            {allProducts.map((product, index) => (
              <Grid item xs={12} key={index}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>

      {orderId && (
        <Box sx={styles.bottomStickyContainer}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDispatch}
            sx={styles.bottomButton}
            disabled={!allProductsScanned || orderId === undefined}
          >
            Confirm Order ₹{orderInfo.scannedAmout} / ₹{orderInfo.totalAmount}
            <ArrowForwardRoundedIcon
              sx={{ position: "absolute", right: "20px" }}
            />
          </Button>
        </Box>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

const styles = {
  CategoryTitle: {
    fontWeight: "600",
    fontFamily: "Quicksand",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent dark background
    backdropFilter: "blur(5px)", // Blur effect
    zIndex: 998, // Make sure it's behind the card but above the other content
  },
  header: {
    position: "absolute",
    top: 0,
    zIndex: 10,
  },
  arrowStyle: {
    position: "absolute",
    left: "20px",
  },

  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
  },
  topHalf: {
    height: "35%",
    minHeight: "250px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1px solid #ccc",
    backgroundColor: "#f5f5f5",
    overflowY: "hidden",
  },
  scannerContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomHalf: {
    height: "65%",
    overflowY: "auto",
    backgroundColor: "#ffffff",
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: 10,
  },

  bottomStickyContainer: {
    position: "sticky",
    bottom: 0,
    backgroundColor: "#fff",
    padding: "10px 20px",
    zIndex: 999,
  },
  bottomButton: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    backgroundColor: "#3f51b5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  TopDiv: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #F0F0F0",
    padding: "10px 20px",
  },
  TotalDivTotal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "10px 0px",
    borderBottom: "2px solid #EAEAEA",
    borderTop: "2px solid #EAEAEA",
    padding: "10px 0px",
  },
  TotalDivTotal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "10px 10px",
    borderBottom: "2px solid #EAEAEA",
    borderTop: "2px solid #EAEAEA",
    padding: "10px 0px",
  },
  TotalTotal: {
    fontSize: "15px",
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  messageSection: {
    margin: 0,
    border: "1px solid #EAEAEA",
    borderRadius: "4px",
    padding: "10px",
    backgroundColor: "#fafafa",
  },
  messageHeading: {
    marginBottom: "8px",
    fontWeight: "600",
    fontFamily: "Quicksand",
    fontSize: "13px",
    lineHeight: "16.25px",
    textalign: "left",
  },
  messageBody: {
    maxHeight: "80px",
    overflowY: "auto",
  },
};

export default EmployeeOrder;
