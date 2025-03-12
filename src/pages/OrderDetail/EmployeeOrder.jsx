import { ArrowBack } from "@mui/icons-material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import {
  Alert,
  Button,
  ButtonBase,
  Container,
  Grid,
  IconButton,
  Modal,
  Snackbar,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BarcodeScanner from "../../Components/Employee/BarcodeScanner";
import Instructions from "../../Components/Employee/LabelCode/Instructions";
import LabelCodeCard from "../../Components/Employee/LabelCode/LabelCodeCard";
import ProductCard from "../../Components/Employee/ProductCard";
import { useMqtt } from "../../context/MqttContext";
import TrolleyValues from "./Layout/TrolleyValues";
import { api } from "../../api/api";
import { objectIdToNumber } from "../../lib/mongo";
import BatchDrawer from "../../Components/BatchDrawer";

/**
 * @typedef {Object} ScannedBarcodeEntry
 * @property {string} barcode - The barcode of the product that was scanned.
 * @property {string} vendor_product - The vendor product associated with the barcode.
 * @property {number} scanned_count - The number of times the product has been scanned.
 */

const EmployeeOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vendor_order: vendor_order_id } = location.state || {};

  const isUpdateProductPage = !vendor_order_id;
  const { publish, isConnected } = useMqtt();
  const [id, setId] = useState();
  const [orderItems, setOrderItems] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [activeScanner, setActiveScanner] = useState("image");
  const [orderInfo, setOrderInfo] = useState({});
  const [productInfo, setProductInfo] = useState("");
  const [openLabelCard, setOpenLabelCard] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [dispatchOverrideRequest, setDispatchOverrideRequest] = useState({
    barcode: "",
    dispatchOverwriteReason: "",
  });

  /**
   * State for tracking scanned counts by barcode.
   * @type {[ScannedBarcodeEntry, React.Dispatch<React.SetStateAction<ScannedBarcodeEntry[]>>]}
   */
  const [barcodeScannedCount, setBarcodeScannedCount] = useState([]);

  const [batchDrawerProduct, setBatchDrawerProduct] = useState("");
  const batchDrawerScannedCount = barcodeScannedCount.filter(
    (scan) => scan.vendor_product === batchDrawerProduct
  );

  console.log({ batchDrawerProduct });

  const vendorProductScannedCount = barcodeScannedCount.reduce((acc, entry) => {
    const vendorProduct = entry.vendor_product;
    // If the vendor_product is already in the object, update its scanned_count
    if (acc[vendorProduct]) {
      // The value is the accumulated `scanned_count` (number)
      acc[vendorProduct] += entry.scanned_count;
    } else {
      // Otherwise, initialize the scanned_count for this vendor_product
      acc[vendorProduct] = entry.scanned_count;
    }
    return acc;
  }, {});

  const scannedOrderItems = orderItems.filter(
    (orderItem) =>
      vendorProductScannedCount[orderItem?.vendor_product?._id] >=
      orderItem.quantity
  );
  const allProductsScanned = scannedOrderItems.length === orderItems.length;

  console.log({ barcodeScannedCount });

  const scannedAmout = orderItems.reduce((total, product) => {
    let variantMultiplier = product?.variant || 1;
    if (variantMultiplier >= 100) variantMultiplier /= 1000;
    return (
      total +
      (vendorProductScannedCount[product?.vendor_product?._id] || 0) *
        (product?.price || 0) *
        variantMultiplier
    );
  }, 0);

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
    console.log("handleScan", { barcode });

    if (vendor_order_id) {
      const scannedBarcode = String(barcode).trim();

      try {
        // Look for existing entry for this barcode in the state
        const existingEntry = barcodeScannedCount.find(
          (entry) => entry.barcode === scannedBarcode
        );

        // If barcode is found, increment its scanned_count, otherwise create a new entry
        let newScannedCount = 1;
        if (existingEntry) {
          newScannedCount = existingEntry.scanned_count + 1;
        }

        // Call the API to update scanned count on the server
        const {
          vendor_order: updated_vendor_order,
          order_item: matched_order_item,
          message = "",
        } = await api.order.updateScannedCount({
          vendor_order: vendor_order_id,
          scannedCount: newScannedCount, // Pass the updated scanned count
          barcode: scannedBarcode,
        });

        // If the API response contains a message, show it
        if (message) {
          showSnackbar(message, "warning");
          // setScanResult(""); // Reset scan result immediately
          // return;
        }
        // Show success message when scan is successful
        showSnackbar("Your Product Scanned!", "info");

        // Update the total cart weight after scanning
        const netWeight = parseFloat(localStorage.getItem("virtualcartweight"));
        const trolley = localStorage.getItem("trolley");

        const productWeight =
          updated_vendor_order?.products?.find(
            (product) =>
              product.vendor_product === matched_order_item.vendor_product
          )?.vendor_product?.product?.weight || 0;
        const totalWeight = netWeight + productWeight;

        // Store the new total weight in local storage
        localStorage.setItem("virtualcartweight", totalWeight);

        // Publish the updated virtual cart weight
        publish("guestUser/updateVirtualCartWeight", {
          virtualWeight: totalWeight,
          trolleyId: trolley,
        });

        // Reset the scan result after a short delay
        // setTimeout(() => setScanResult(""), 300);

        // getOrders();
        setBarcodeScannedCount((prevCounts) => {
          const newArray = [...prevCounts];

          if (existingEntry) {
            const index = prevCounts.findIndex(
              (entry) => entry.barcode === scannedBarcode
            );
            // Update the existing entry
            newArray[index] = {
              ...newArray[index],
              scanned_count: newScannedCount,
              vendor_product: matched_order_item.vendor_product, // Ensure vendor_product is updated
            };
          } else {
            // Add a new entry
            newArray.push({
              barcode: scannedBarcode,
              vendor_product: matched_order_item.vendor_product,
              scanned_count: newScannedCount,
            });
          }

          return newArray;
        });

        // Update the orderItem state with new scanned count and status
        setOrderItems((prevItems) =>
          prevItems.map((item) =>
            item.vendor_product?._id === matched_order_item.vendor_product
              ? {
                  ...item,
                  scannedCount: (item.scannedCount ?? 0) + 1,
                }
              : item
          )
        );
      } catch (error) {
        // Handle errors from the API
        if (error?.response?.data?.message) {
          showSnackbar(error.response.data.message, "error");

          if (error?.response?.data?.message === "Product batch has expired")
            setDispatchOverrideRequest({
              barcode,
              dispatchOverwriteReason: "Product batch has expired",
            });
        } else {
          showSnackbar(
            "Unknown error occurred while processing the scan.",
            "error"
          );
        }

        console.log(error?.response?.data); // Log the error for debugging
      }
    } else {
      // Handle case where vendor order is not present

      await handleProductScan(barcode);
    }
  };

  // New function to handle the product scan when no vendor_order exists
  const handleProductScan = async (barcode) => {
    try {
      const vendor_product = await api.products.getByBarcode(barcode);
      if (vendor_product._id) {
        setProductInfo({ ...vendor_product, barcode });
        setOpenLabelCard(true);
      } else {
        showSnackbar("Product is Not in List!", "warning");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getOrders = async () => {
    if (!vendor_order_id) return;
    try {
      const { db_vendor_order, barcodeScans, employee_order } =
        await api.order.getOrdersByLabelcode(vendor_order_id);

      setOrderInfo({
        message: db_vendor_order?.message,
        orderNo: db_vendor_order?._id,
        totalAmount: db_vendor_order?.total_amount,
        vendor_order: db_vendor_order,
        employee_order,
      });
      setOrderItems(db_vendor_order?.products || []);
      setId(db_vendor_order?.order?._id);
      setBarcodeScannedCount(barcodeScans);
    } catch (error) {
      console.log("Error fetching order:", error);
    }
  };

  const updateEndScanTime = async () => {
    try {
      await api.order.updateEmployeeOrder(vendor_order_id, {
        endScanTime: new Date(),
      });
    } catch (error) {
      console.log("Error updating scan time:", error);
    }
  };

  const handleDispatch = async () => {
    if (isScanning)
      return showSnackbar("Please Turn Off the Camera", "warning");

    console.log({ employee_order: orderInfo.employee_order });

    if (
      !allProductsScanned &&
      !orderInfo.employee_order?.dispatchOverwriteApproved &&
      orderInfo.employee_order?.dispatchOverwriteReason !== "Insufficient Stock"
    ) {
      return setDispatchOverrideRequest({
        dispatchOverwriteReason: "Insufficient Stock",
      });
    } else if (
      allProductsScanned ||
      orderInfo.employee_order?.dispatchOverwriteApproved
    ) {
      await updateEndScanTime();
      navigate("/employee-dispatch", {
        state: {
          vendor_order: id,
          id: vendor_order_id,
          orderItems,
          vendorProductScannedCount,
          scannedOrderItems,
        },
      });
    } else {
      showSnackbar("Not all products are scanned.", "error");
    }
  };

  const onLabelCodeChange = async (productId, labelcode, weight) => {
    try {
      await api.products.updateLabelCode(productId, { labelcode, weight });
      await getOrders();
      setOpenLabelCard(false);
    } catch (error) {
      console.log("Error updating label code:", error);
    }
  };

  const updateScanTime = async () => {
    try {
      await api.order.updateEmployeeOrder(vendor_order_id, {
        startScanTime: new Date(),
      });
    } catch (error) {
      console.log("Error updating scan time:", error);
    }
  };

  useEffect(() => {
    if (vendor_order_id) {
      getOrders();
      updateScanTime();
    }
  }, [vendor_order_id]);

  const handleBackClick = () => {
    if (isScanning)
      return showSnackbar("Please Turned Off the Camera", "warning");
    navigate(vendor_order_id ? "/employee-orders" : "/employee-home");
  };

  const placeDispatchOverrideRequest = async (dispatchOverwriteReason) => {
    await api.order.updateEmployeeOrder(vendor_order_id, {
      dispatchOverwriteReason,
      dispatchOverwriteApproved: false,
    });
    await getOrders();
    setDispatchOverrideRequest({});
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
      {/* <BatchDrawer
        drawerOpen={!!batchDrawerProduct}
        batchData={batchDrawerScannedCount}
        onClose={() => setBatchDrawerProduct("")}
      /> */}
      <Modal open={!!dispatchOverrideRequest.dispatchOverwriteReason}>
        <div
          className={
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 " +
            "bg-white rounded-lg shadow-lg p-6 flex flex-col justify-center items-center w-[320px]"
          }
        >
          <p className="my-5 text-center text-2xl font-semibold">
            Raise {dispatchOverrideRequest.dispatchOverwriteReason} issue?
          </p>
          <div className="flex w-full gap-4 mx-auto justify-center">
            <button
              className="bg-red-500 text-white p-2 rounded-lg"
              onClick={() => setDispatchOverrideRequest({})}
            >
              Cancel
            </button>
            <button
              className="text-blue-500 p-2 rounded-lg border border-blue-500"
              onClick={() =>
                placeDispatchOverrideRequest(
                  dispatchOverrideRequest.dispatchOverwriteReason
                ).finally(() => {})
              }
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
      {isConnected && <TrolleyValues />}

      {/* <div className="absolute max-w-full top-0 z-10 flex items-center justify-center p-2 bg-white border-b border-gray-200 w-screen"> */}
      {/* <IconButton> */}
      <ArrowBack
        onClick={handleBackClick}
        // className="mx-2"
        className="fixed top-5 left-5 z-[10000]"
      />
      {/* </IconButton> */}
      {/* <Typography
          variant="h6"
          className="font-semibold font-quicksand w-full flex justify-center"
        >
          Scan Order
        </Typography> */}
      {/* </div> */}

      <div className="flex flex-col h-screen w-full overflow-scroll">
        {orderInfo?.vendor_order?.order_status == "confirmed" ? null : (
          // <div className="flex-[0.5] flex items-center justify-center border-b border-gray-200 bg-gray-100  w-full h-full">
          <div className="h-[35%] min-h-[250px] flex items-center justify-center border-b border-gray-200 bg-gray-100 overflow-hidden">
            <div className="flex items-center justify-center w-full h-full">
              <BarcodeScanner
                handleScan={handleScan}
                activeScanner={activeScanner}
                setActiveScanner={setActiveScanner}
                setIsScanning={setIsScanning}
                isScanning={isScanning}
              />
            </div>
            {/* {objectIdToNumber("673f88a4cecc8568404a9896")} */}
          </div>
        )}

        {vendor_order_id && (
          <div className="flex justify-between items-center border-b-2 border-gray-200 p-3 text-md">
            <p
              variant="h6"
              className="flex flex-wrap font-semibold text-gray-800 max-w-[50%]"
            >
              Order #
              {vendor_order_id
                ? objectIdToNumber(vendor_order_id)
                : "Not created"}
            </p>
            <div className="flex justify-between gap-2 font-semibold text-gray-800">
              <p className="text-md flex flex-wrap max-w-[100px]">Scanned:</p>
              <p className="flex w-full my-auto justify-center">
                {scannedOrderItems.length} / {orderItems.length}
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-white">
          {isUpdateProductPage && <Instructions />}

          {openLabelCard && (
            <>
              {/* Background Overlay */}
              <div className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-50 backdrop-blur-md"></div>

              {/* Centered Modal */}
              <div className="absolute inset-0 flex justify-center items-center z-50">
                <div className="w-full max-w-lg p-3 bg-white rounded-lg shadow-lg">
                  <LabelCodeCard
                    product={productInfo}
                    onLabelCodeChange={onLabelCodeChange}
                    onRemove={() => setOpenLabelCard(false)}
                  />
                </div>
              </div>
            </>
          )}

          {orderInfo.message && (
            <div className="border border-gray-200 rounded p-2 bg-gray-50">
              <Typography
                variant="h6"
                className="font-semibold text-sm text-left mb-2 font-quicksand"
              >
                Customer's Special Message
              </Typography>
              <div className="max-h-20 overflow-auto">
                <Typography variant="body2" className="text-gray-700">
                  {orderInfo.message}
                </Typography>
              </div>
            </div>
          )}

          <Container maxWidth={false} disableGutters>
            <Grid container spacing={0}>
              {orderItems.map((product, index) => (
                <Grid item xs={12} key={index}>
                  <ProductCard
                    product={{
                      ...product,
                      scannedCount:
                        vendorProductScannedCount?.[
                          product?.vendor_product?._id
                        ],
                    }}
                    onClick={() =>
                      setBatchDrawerProduct(product?.vendor_product?._id)
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </Container>
        </div>

        {vendor_order_id && (
          <div className="sticky bottom-0 bg-white p-2 z-50 ">
            <button
              variant="contained"
              color="primary"
              onClick={handleDispatch}
              className={
                (vendor_order_id === undefined ||
                !!orderInfo?.employee_order?.dispatchTime ||
                orderInfo?.vendor_order?.order_status == "confirmed"
                  ? "bg-orange-400"
                  : "bg-orange-600") +
                " " +
                "w-full h-12  text-white rounded-lg flex justify-center items-center font-semibold px-8"
              }
              disabled={
                vendor_order_id === undefined ||
                !!orderInfo?.employee_order?.dispatchTime ||
                orderInfo?.vendor_order?.order_status == "confirmed"
              }
            >
              <ButtonBase>
                <span className="mr-3">
                  {orderInfo?.employee_order?.dispatchTime
                    ? ""
                    : "Confirm Order"}
                  ₹{scannedAmout.toFixed(2) || 0} / ₹
                  {orderInfo.totalAmount.toFixed(2)}
                </span>
              </ButtonBase>
              <ArrowForwardRoundedIcon className="absolute right-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default EmployeeOrder;
