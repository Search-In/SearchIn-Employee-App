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
    <>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          className="w-full"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {isConnected && <TrolleyValues />}

      <div className="fixed top-0 z-10 flex items-center justify-center p-5 bg-white border-b border-gray-200 w-screen">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="back"
          onClick={handleBackClick}
          // className="mx-2"
        >
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h6"
          className="font-semibold font-quicksand w-full flex justify-center"
        >
          Fullfillment Orders
        </Typography>
      </div>
      <div className="flex flex-col h-screen w-full">
        <div className="flex-1 flex items-center justify-center border-b border-gray-200 bg-gray-100">
          <div className="flex items-center justify-center w-full h-full">
            <BarcodeScanner
              handleScan={handleScan}
              scanResult={null} // Your state for scanResult
              setScanResult={() => {}}
              activeScanner={null} // Your state for activeScanner
              setActiveScanner={() => {}}
              setIsScanning={() => {}}
              isScanning={false} // Your state for isScanning
            />
          </div>
        </div>

        {orderId && (
          <Box className="flex justify-between items-center border-b-2 border-gray-200 p-5">
            <Typography variant="h6" className="font-semibold text-gray-800">
              Order #{orderInfo.orderNo}
            </Typography>
            <Typography className="font-semibold text-gray-800">
              Total Products
            </Typography>
            <Typography className="font-semibold text-gray-800">
              {orderInfo.scannedTotal} / {allProducts.length}
            </Typography>
          </Box>
        )}

        <div className="flex-1 overflow-auto bg-white">
          {!orderId && <Instructions />}

          {openLabelCard && (
            <>
              <div className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-50 backdrop-blur-md"></div>
              <Box className="absolute bottom-40 z-50">
                <LabelCodeCard
                  product={productInfo}
                  onLabelCodeChange={onLabelCodeChange}
                  onRemove={() => setOpenLabelCard(false)}
                />
              </Box>
            </>
          )}

          {orderInfo.message && (
            <Box className="border border-gray-200 rounded p-5 bg-gray-50">
              <Typography
                variant="h6"
                className="font-semibold text-sm text-left mb-2 font-quicksand"
              >
                Customer's Special Message
              </Typography>
              <Box className="max-h-20 overflow-auto">
                <Typography variant="body2" className="text-gray-700">
                  {orderInfo.message}
                </Typography>
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
          <Box className="sticky bottom-0 bg-white p-5 z-50">
            <Button
              variant="contained"
              color="primary"
              onClick={handleDispatch}
              className="w-full h-12 rounded-lg bg-indigo-600 flex justify-between items-center"
              disabled={!allProductsScanned || orderId === undefined}
            >
              Confirm Order ₹{orderInfo.scannedAmout} / ₹{orderInfo.totalAmount}
              <ArrowForwardRoundedIcon className="absolute right-5" />
            </Button>
          </Box>
        )}
      </div>
    </>
  );
};

export default EmployeeOrder;
