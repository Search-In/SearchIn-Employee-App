import {
  Box,
  Button,
  IconButton,
  Typography,
  Container,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import React, { useState } from "react";
import BarcodeScanner from "../../Components/Employee/BarcodeScanner";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ProductCard from "../../Components/Employee/ProductCard";
import axios from "axios";
import UserDrawer from "../../Components/Employee/Drawer/UserInfoDrawer";
import server from "../../Components/server";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const CreateOrder = () => {
  const navigate = useNavigate();
  const [scannedProductList, setScannedProductList] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [allProducts, setProducts] = useState([]);
  const [activeScanner, setActiveScanner] = useState("image");
  const [scanResult, setScanResult] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
  });
  const [netPrice, setNetPrice] = useState(0);

  const handleOpenDrawer = () => setDrawerOpen(true);
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setFormData("");
  };
  const handleSubmit = async () => {
    const response = await createInstoreOrder();
    console.log("RESponse is ", response);
    console.log("Form Data:", formData);
    setFormData("");
    handleCloseDrawer(); // Close the drawer after submission
    if (response) {
      const Employee = JSON.parse(localStorage.getItem("employee"));
      console.log("Employee", Employee);
      // const employeeOrder = await createEmployeeOrder(
      //   Employee?._id,
      //   response._id
      // )
      // console.log("Emp order--", employeeOrder)
      navigate("/dispatch-success", { state: { createOrder: true } });
      toast.success("Order Created Successfully!");
    } else {
      toast.error("Failed to create Order!");
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  const vibrateDevice = (pattern) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const showWarningSnackbar = () => {
    setSnackbarMessage("Product is Already Scanned!");
    setSnackbarSeverity("warning");
    setOpenSnackbar(true);
    vibrateDevice([200, 100, 200]);
  };
  const showProductScan = () => {
    setSnackbarMessage("Your Product Scanned!");
    setSnackbarSeverity("info");
    setOpenSnackbar(true);
    // vibrateDevice([200, 100, 200]);
  };
  const showProductNotFound = () => {
    setSnackbarMessage("Product is Not in List!");
    setSnackbarSeverity("warning");
    setOpenSnackbar(true);
    vibrateDevice([200, 100, 200]);
  };
  const showTurnedOffCamera = () => {
    setSnackbarMessage("Please Turned Off the Camera");
    setSnackbarSeverity("warning");
    setOpenSnackbar(true);
  };

  const getVendorProductByBarcode = async (barcode) => {
    try {
      const result = await axios.get(
        `${server}/vendor/products/barcode/${barcode}`,
        {
          params: {
            vendor: localStorage.getItem("vendorID"),
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log("rsult is ", result);
      if (result?.data) {
        console.log("get vendor product by barcode ", result.data);
        return result.data;
      }
      //   else {
      //     showProductNotFound()
      //   }
    } catch (error) {
      console.log(error);
    }
  };

  const createEmployeeOrder = async (employeeId, orderId) => {
    try {
      const result = await axios.post(
        `${server}/employee-orders?employeeId=${employeeId}&orderId=${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log("Created Employee ", result);
      return result;
    } catch (error) {
      console.log(error);
    }
  };

  //   const handleScan = (barcode) => {
  //     console.log("barcode is ", barcode)
  //   }

  const createInstoreOrder = async () => {
    const productList = scannedProductList.map((item) => ({
      productId: item.product._id,
      itemCount: item.count,
      variant: item.product.variants ? item.product.variants[0] : null,
      // price: item.product.product.price,
      // barcode: item.product.barcode,
    }));
    const totalPrice = scannedProductList.reduce((accumulator, item) => {
      return accumulator + item.count * item.product.price;
    }, 0);
    const orderData = {
      productList: productList,
      mobile: formData.mobile,
      totalAmount: totalPrice,
    };
    console.log("scnnaed P>L ", scannedProductList);
    // Calculate the total price

    console.log("Total Price:", totalPrice);
    console.log("user Info is ", formData);

    console.log("request body is ", productList);
    try {
      const response = await axios.post(`${server}/orders/instore`, orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      console.log("Order created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating order:",
        error.response?.data || error.message
      );
    }
  };

  // const handleScan = async (barcode) => {
  //   const productBarcode = String(barcode).trim()
  //   let foundProduct = false

  //   // Filter vendor products based on the barcode
  //   const scannedProduct = vendorProducts.filter((product) =>
  //     product.product.barcode.includes(productBarcode)
  //   )
  //   console.log("scanned products ", scannedProduct)
  //   if (scannedProduct.length > 0) {
  //     const product = scannedProduct[0] // Since barcode is unique, there will be only one match
  //     // Check if the product already exists in allProducts
  //     setScannedProductList((prevProducts) => {
  //       const existingProduct = prevProducts.find(
  //         (item) => item.product.barcode === product.barcode
  //       )

  //       if (existingProduct) {
  //         // If the product exists, update the count
  //         return prevProducts.map((item) =>
  //           item.product.barcode === product.barcode
  //             ? { ...item, count: item.count + 1 }
  //             : item
  //         )
  //       } else {
  //         // If the product doesn't exist, add it to the list with count set to 1
  //         return [...prevProducts, { product, count: 1 }]
  //       }
  //     })
  //     foundProduct = true
  //     showProductScan()
  //     setTimeout(() => {
  //       setScanResult("")
  //     }, 3000)
  //   } else {
  //     console.log("Product with barcode not found")
  //   }

  //   if (!foundProduct) {
  //     showProductNotFound()
  //   }

  //   setTimeout(() => {
  //     setScanResult("")
  //   }, 3000)
  // }

  const handleScan = async (barcode) => {
    const productBarcode = String(barcode).trim();
    let foundProduct = false;

    try {
      // Fetch the product details using the getVendorProductByBarcode function
      const product = await getVendorProductByBarcode(productBarcode);
      console.log("found product", product);

      if (product) {
        // Product found, update the scanned product list
        setScannedProductList((prevProducts) => {
          const existingProduct = prevProducts.find(
            (item) => item.product.barcode === product.barcode
          );

          if (existingProduct) {
            // If the product exists, update the count
            return prevProducts.map((item) =>
              item.product.barcode === product.barcode
                ? { ...item, count: item.count + 1 }
                : item
            );
          } else {
            // If the product doesn't exist, add it to the list with count set to 1
            return [...prevProducts, { product, count: 1 }];
          }
        });

        foundProduct = true;
        showProductScan(); // Show the product scan success message
      } else {
        console.log("Product with barcode not found");
        showProductNotFound(); // Show product not found message
      }
    } catch (error) {
      console.error("Error fetching product by barcode:", error);
      showProductNotFound(); // Handle error by showing product not found message
    }

    // Clear the scan result after a delay
    setTimeout(() => {
      setScanResult("");
    }, 3000);
  };

  const handleDispatch = () => {
    handleOpenDrawer();
  };
  const handleBackClick = () => {
    if (isScanning) {
      console.log("turned off the camera");
      return showTurnedOffCamera();
    }
    navigate("/employee-home");
  };

  useState(() => {
    const totalPrice = scannedProductList.reduce((accumulator, item) => {
      return accumulator + item.count * item.product.price;
    }, 0);
    console.log("setting is ", totalPrice);
    setNetPrice(totalPrice);
  }, [scannedProductList, handleScan]);

  return (
    <>
      <ToastContainer />
      <UserDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
      />
      <div style={styles.container}>
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

        <Box sx={styles.TopDiv}>
          <Typography variant="h6" sx={styles.TotalTotal}>
            {/* Order #{orderInfo.orderNo} */}
          </Typography>
          <Typography sx={styles.TotalTotal}>Total Products</Typography>
          <Typography sx={styles.TotalTotal}>
            {/* {orderInfo.scannedTotal} / {allProducts?.length} */}
          </Typography>
        </Box>

        {/* Bottom Half: Product Cards */}
        <div style={styles.bottomHalf}>
          <Container maxWidth={false} disableGutters>
            <Grid container spacing={0}>
              {scannedProductList?.map((product, index) => (
                <Grid item xs={12} key={index}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </div>

        <Box sx={styles.bottomStickyContainer}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDispatch}
            sx={styles.ButtonCart}
            // disabled={!allProductsScanned || orderId === undefined}
          >
            {/* Confirm Order ₹{orderInfo.scannedAmout}/₹{orderInfo.totalAmount} */}
            confirm Order
            <ArrowForwardRoundedIcon
              sx={{ position: "absolute", right: "20px" }}
            />
          </Button>
        </Box>

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
    </>
  );
};

export default CreateOrder;

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
    overflowX: "hidden",
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

  ButtonCart: {
    backgroundColor: "#F37A20",
    color: "#fff",
    textTransform: "none",
    fontSize: "18px",
    fontWeight: "500",
    fontFamily: "Poppins",
    width: "95%",
    "&.MuiButtonBase-root:hover": {
      background: "#F37A20",
    },
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
  bottomStickyContainer: {
    position: "sticky",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTop: "1px solid #EAEAEA",
    padding: "10px",
    textAlign: "left",
  },
};

const productList = [
  {
    productId: {
      _id: "6545176ef34a53a2a4f11051",
      rwId: 2503,
      categoryId: "6543bfd1f7e3ae87941ab66f",
      subCategoryId: "65ccd7f0eca383e82c93349e",
      name: "LOOSE CHANNA DAL KG (PISTOL)",
      imageUrl:
        "https://urban-prod-images.s3.ap-south-1.amazonaws.com/LOOSE%20CHANNA%20DAL%20KG%20%28PISTOL%29.jpg",
      price: 94,
      mrpPrice: 110,
      stock: 190,
      sales: 9798.3,
      buyinglimit: 0,
      stocklimit: 30,
      description: "LOOSE CHANNA DAL",
      published: true,
      __v: 0,
      createdAt: "2023-11-03T15:53:25.334Z",
      updatedAt: "2024-12-10T05:35:00.704Z",
      barcode: ["8904043901015"],
      labelcode: "A-1-1-1",
      productType: "QuickCommerce",
      weight: 5,
    },
    itemCount: 1,
    scannedCount: 1,
    variant: 250,
    price: 94,
    product_batch: "675302158b1523595e8cd711",
    eanCodeScannedCount: [],
    batch_scanned_count: [
      {
        product_batch: "675302158b1523595e8cd711",
        scannedCount: 1,
        _id: "6757006c13b6121e9a64ae61",
      },
    ],
    _id: "6757003313b6121e9a64914f",
  },
  {
    productId: {
      _id: "6545176ef34a53a2a4f11055",
      rwId: 2509,
      categoryId: "6543bfd1f7e3ae87941ab66f",
      subCategoryId: "65ccd7f0eca383e82c93349e",
      name: "LOOSE LATUR TOOR DAL KG (SHREYA GOLD)",
      imageUrl:
        "https://urban-prod-images.s3.ap-south-1.amazonaws.com/LOOSE%20LATUR%20TOOR%20DAL%20KG%20%28SAATVIK%29.jpg",
      price: 169,
      mrpPrice: 185,
      stock: 164,
      sales: 9385.315,
      buyinglimit: 0,
      stocklimit: 30,
      description: "LOOSE TOOR DAL",
      published: true,
      __v: 0,
      createdAt: "2023-11-03T15:53:25.336Z",
      updatedAt: "2024-12-10T06:01:53.542Z",
      barcode: ["2509"],
      labelcode: "A-1-1-2",
      productType: "QuickCommerce",
      weight: 1,
    },
    itemCount: 1,
    scannedCount: 1,
    variant: 1,
    price: 169,
    product_batch: "675302158b1523595e8cd719",
    eanCodeScannedCount: [],
    batch_scanned_count: [
      {
        product_batch: "675302158b1523595e8cd719",
        scannedCount: 1,
        _id: "6757006e13b6121e9a64ae71",
      },
    ],
    _id: "6757003313b6121e9a649150",
  },
  {
    productId: {
      _id: "6545176ef34a53a2a4f11054",
      rwId: 2506,
      categoryId: "6543bfd1f7e3ae87941ab66f",
      subCategoryId: "65ccd7f0eca383e82c93349e",
      name: "LOOSE MOONG DAL KORA KG (DIAMOND)",
      imageUrl:
        "https://urban-prod-images.s3.amazonaws.com/LOOSE%20MOONG%20DAL%20KORA%20KG%20%28PRATHMESH%29.jpg",
      price: 120,
      mrpPrice: 138,
      stock: 182,
      sales: 5398.705,
      buyinglimit: 0,
      stocklimit: 10,
      description: "LOOSE MOONG DAL",
      published: true,
      __v: 0,
      createdAt: "2023-11-03T15:53:25.335Z",
      updatedAt: "2024-12-10T06:01:53.541Z",
      barcode: ["2506"],
      labelcode: "A-1-1-2",
      productType: "QuickCommerce",
      weight: 500,
    },
    itemCount: 1,
    scannedCount: 1,
    variant: 5,
    price: 120,
    product_batch: "675302158b1523595e8cd717",
    eanCodeScannedCount: [],
    batch_scanned_count: [
      {
        product_batch: "675302158b1523595e8cd717",
        scannedCount: 1,
        _id: "6757007013b6121e9a64ae82",
      },
    ],
    _id: "6757003313b6121e9a649151",
  },
  {
    productId: {
      _id: "65a929c7409213fc9c56ddfa",
      rwId: 8101,
      categoryId: "6543bfd1f7e3ae87941ab66f",
      subCategoryId: "65ccd7f1eca383e82c9334a6",
      name: "LOOSE GAVRAN RAI KG",
      imageUrl:
        "https://urban-prod-images.s3.ap-south-1.amazonaws.com/LOOSE%20GAVRAN%20RAI%20KG.jpg",
      price: 130,
      mrpPrice: 140,
      stock: 44,
      sales: 739.508,
      buyinglimit: 0,
      stocklimit: 10,
      description: "LOOSE GAVRAN RAI",
      published: true,
      __v: 0,
      createdAt: "2024-01-18T13:38:15.812Z",
      updatedAt: "2024-12-10T05:35:02.123Z",
      barcode: ["8101"],
      labelcode: "A-1-2-2",
      productType: "QuickCommerce",
    },
    itemCount: 1,
    scannedCount: 1,
    variant: 500,
    price: 130,
    product_batch: "6753023b8b1523595e8e88d4",
    eanCodeScannedCount: [],
    batch_scanned_count: [
      {
        product_batch: "6753023b8b1523595e8e88d4",
        scannedCount: 1,
        _id: "6757009913b6121e9a64aecd",
      },
    ],
    _id: "6757003313b6121e9a64914d",
  },
  {
    productId: {
      _id: "65451771f34a53a2a4f11937",
      rwId: 10114,
      categoryId: "6543bfd1f7e3ae87941ab66f",
      subCategoryId: "65ccd7f1eca383e82c9334a6",
      name: "LOOSE GAVRAN TILL KG",
      imageUrl:
        "https://urban-prod-images.s3.ap-south-1.amazonaws.com/LOOSE%20GAVRAN%20TILL%20KG.jpg",
      price: 240,
      mrpPrice: 290,
      stock: 33,
      sales: 305.735,
      buyinglimit: 0,
      stocklimit: 5,
      description: "LIISE GAVRAN TIL",
      published: true,
      __v: 0,
      createdAt: "2023-11-03T15:53:26.455Z",
      updatedAt: "2024-12-10T05:35:02.451Z",
      barcode: ["10114"],
      labelcode: "A-1-2-4",
      productType: "QuickCommerce",
    },
    itemCount: 1,
    scannedCount: 1,
    variant: 1,
    price: 240,
    product_batch: "675302428b1523595e8ed624",
    eanCodeScannedCount: [],
    batch_scanned_count: [
      {
        product_batch: "675302428b1523595e8ed624",
        scannedCount: 1,
        _id: "6757006713b6121e9a64ae52",
      },
    ],
    _id: "6757003313b6121e9a64914e",
  },
  {
    productId: {
      _id: "6545176ff34a53a2a4f11350",
      rwId: 4808,
      categoryId: "6495da143508331f0b71bfd9",
      subCategoryId: "6543c168f7e3ae87941acce7",
      name: "PONDS DREAM FLOWER PINK LILY TALC 50G",
      imageUrl:
        "https://urban-prod-images.s3.ap-south-1.amazonaws.com/PONDS%20DREAM%20FLOWER%20PINK%20LILY%20TALC%2050G.jpg",
      price: 63,
      mrpPrice: 65,
      stock: 31,
      sales: 396,
      buyinglimit: 0,
      stocklimit: 10,
      description: "PON D PNK L50G",
      published: true,
      __v: 0,
      createdAt: "2023-11-03T15:53:25.692Z",
      updatedAt: "2024-12-10T05:35:01.085Z",
      barcode: ["8901030869020"],
      labelcode: "D-1-7-1",
      productType: "QuickCommerce",
    },
    itemCount: 1,
    scannedCount: 1,
    price: 63,
    product_batch: "675302248b1523595e8d80e4",
    eanCodeScannedCount: [],
    batch_scanned_count: [
      {
        product_batch: "675302248b1523595e8d80e4",
        scannedCount: 1,
        _id: "6757008813b6121e9a64ae94",
      },
    ],
    _id: "6757003313b6121e9a64914b",
  },
  {
    productId: {
      _id: "6545176ff34a53a2a4f11346",
      rwId: 4791,
      categoryId: "6495da143508331f0b71bfd9",
      subCategoryId: "6543c168f7e3ae87941acce7",
      name: "PONDS DREAM FLOWER PINK LILY TALC100G",
      imageUrl:
        "https://urban-prod-images.s3.ap-south-1.amazonaws.com/PONDS%20DREAM%20FLOWER%20PINK%20LILY%20TALC100G.jpg",
      price: 120,
      mrpPrice: 125,
      stock: 34,
      sales: 254,
      buyinglimit: 0,
      stocklimit: 9,
      description: "PON D PL 100G",
      published: true,
      __v: 0,
      createdAt: "2023-11-03T15:53:25.688Z",
      updatedAt: "2024-12-10T05:35:01.080Z",
      barcode: ["8901030869013"],
      labelcode: "D-1-7-1",
      productType: "QuickCommerce",
      weight: 0.1,
    },
    itemCount: 1,
    scannedCount: 1,
    price: 120,
    product_batch: "675302248b1523595e8d7f12",
    eanCodeScannedCount: [],
    batch_scanned_count: [
      {
        product_batch: "675302248b1523595e8d7f14",
        scannedCount: 1,
        _id: "6757008d13b6121e9a64aea7",
      },
    ],
    _id: "6757003313b6121e9a64914c",
  },
];

const vendorProducts = [
  {
    vendor: "64b5f94f5c3bdb0012d44d1a", // Replace with actual vendor ObjectId
    product: {
      _id: "6545176ef34a53a2a4f11051",
      rwId: 2503,
      categoryId: "6543bfd1f7e3ae87941ab66f",
      subCategoryId: "65ccd7f0eca383e82c93349e",
      name: "LOOSE CHANNA DAL KG (PISTOL)",
      imageUrl:
        "https://urban-prod-images.s3.ap-south-1.amazonaws.com/LOOSE%20CHANNA%20DAL%20KG%20%28PISTOL%29.jpg",
      price: 94,
      mrpPrice: 110,
      stock: 190,
      sales: 9798.3,
      buyinglimit: 0,
      stocklimit: 30,
      description: "LOOSE CHANNA DAL",
      published: true,
      __v: 0,
      createdAt: "2023-11-03T15:53:25.334Z",
      updatedAt: "2024-12-10T05:35:00.704Z",
      barcode: ["8904043901015"],
      labelcode: "A-1-1-1",
      productType: "QuickCommerce",
      weight: 5,
    },
    vendor_location: ["64b5f9745c3bdb0012d44d1c"], // Replace with actual vendor location ObjectIds
    price: 100.0,
    sales: 10,
    stock: 50,
    threshold_stock: 5,
    buying_limit: 10,
    status: "available",
    labelcode: "LBL1001",
    barcode: "1234567890",
  },
  {
    vendor: "64b5f94f5c3bdb0012d44d1d",
    product: {
      _id: "6545176ef34a53a2a4f11055",
      rwId: 2509,
      categoryId: "6543bfd1f7e3ae87941ab66f",
      subCategoryId: "65ccd7f0eca383e82c93349e",
      name: "LOOSE LATUR TOOR DAL KG (SHREYA GOLD)",
      imageUrl:
        "https://urban-prod-images.s3.ap-south-1.amazonaws.com/LOOSE%20LATUR%20TOOR%20DAL%20KG%20%28SAATVIK%29.jpg",
      price: 169,
      mrpPrice: 185,
      stock: 164,
      sales: 9385.315,
      buyinglimit: 0,
      stocklimit: 30,
      description: "LOOSE TOOR DAL",
      published: true,
      __v: 0,
      createdAt: "2023-11-03T15:53:25.336Z",
      updatedAt: "2024-12-10T06:01:53.542Z",
      barcode: ["8906007286558"],
      labelcode: "A-1-1-2",
      productType: "QuickCommerce",
      weight: 1,
    },
    vendor_location: ["64b5f9745c3bdb0012d44d1f", "64b5f9745c3bdb0012d44d1g"],
    price: 200.5,
    sales: 5,
    stock: 20,
    threshold_stock: 2,
    buying_limit: 5,
    status: "available",
    labelcode: "LBL2002",
    barcode: "0987654321",
  },
  {
    vendor: "64b5f94f5c3bdb0012d44d20",
    product: {
      _id: "6545176ef34a53a2a4f11054",
      rwId: 2506,
      categoryId: "6543bfd1f7e3ae87941ab66f",
      subCategoryId: "65ccd7f0eca383e82c93349e",
      name: "LOOSE MOONG DAL KORA KG (DIAMOND)",
      imageUrl:
        "https://urban-prod-images.s3.amazonaws.com/LOOSE%20MOONG%20DAL%20KORA%20KG%20%28PRATHMESH%29.jpg",
      price: 120,
      mrpPrice: 138,
      stock: 182,
      sales: 5398.705,
      buyinglimit: 0,
      stocklimit: 10,
      description: "LOOSE MOONG DAL",
      published: true,
      __v: 0,
      createdAt: "2023-11-03T15:53:25.335Z",
      updatedAt: "2024-12-10T06:01:53.541Z",
      barcode: ["5279"],
      labelcode: "A-1-1-2",
      productType: "QuickCommerce",
      weight: 500,
    },
    vendor_location: ["64b5f9745c3bdb0012d44d22"],
    price: 50.0,
    sales: 25,
    stock: 10,
    threshold_stock: 3,
    buying_limit: 15,
    status: "out_of_stock",
    labelcode: "LBL3003",
    barcode: "4567890123",
  },
  {
    vendor: "64b5f94f5c3bdb0012d44d23",
    product: {
      _id: "65a929c7409213fc9c56ddfa",
      rwId: 8101,
      categoryId: "6543bfd1f7e3ae87941ab66f",
      subCategoryId: "65ccd7f1eca383e82c9334a6",
      name: "LOOSE GAVRAN RAI KG",
      imageUrl:
        "https://urban-prod-images.s3.ap-south-1.amazonaws.com/LOOSE%20GAVRAN%20RAI%20KG.jpg",
      price: 130,
      mrpPrice: 140,
      stock: 44,
      sales: 739.508,
      buyinglimit: 0,
      stocklimit: 10,
      description: "LOOSE GAVRAN RAI",
      published: true,
      __v: 0,
      createdAt: "2024-01-18T13:38:15.812Z",
      updatedAt: "2024-12-10T05:35:02.123Z",
      barcode: ["7503"],
      labelcode: "A-1-2-2",
      productType: "QuickCommerce",
    },
    vendor_location: ["64b5f9745c3bdb0012d44d25"],
    price: 75.75,
    sales: 8,
    stock: 30,
    threshold_stock: 7,
    buying_limit: 12,
    status: "available",
    labelcode: "LBL4004",
    barcode: "5678901234",
  },
  {
    vendor: "64b5f94f5c3bdb0012d44d26",
    product: {
      _id: "65451771f34a53a2a4f11937",
      rwId: 10114,
      categoryId: "6543bfd1f7e3ae87941ab66f",
      subCategoryId: "65ccd7f1eca383e82c9334a6",
      name: "LOOSE GAVRAN TILL KG",
      imageUrl:
        "https://urban-prod-images.s3.ap-south-1.amazonaws.com/LOOSE%20GAVRAN%20TILL%20KG.jpg",
      price: 240,
      mrpPrice: 290,
      stock: 33,
      sales: 305.735,
      buyinglimit: 0,
      stocklimit: 5,
      description: "LIISE GAVRAN TIL",
      published: true,
      __v: 0,
      createdAt: "2023-11-03T15:53:26.455Z",
      updatedAt: "2024-12-10T05:35:02.451Z",
      barcode: ["10114"],
      labelcode: "A-1-2-4",
      productType: "QuickCommerce",
    },
    vendor_location: ["64b5f9745c3bdb0012d44d28"],
    price: 150.0,
    sales: 12,
    stock: 15,
    threshold_stock: 5,
    buying_limit: 10,
    status: "discontinued",
    labelcode: "LBL5005",
    barcode: "8901063019188",
  },
];

console.log(vendorProducts);
