import { ArrowBack } from "@mui/icons-material"
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded"
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Snackbar,
  Typography,
  Fab,
} from "@mui/material"
import axios from "axios"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import server from "../../Components/server"
// import EmployeeScanner from "./EmployeeScanner";
import BarcodeScanner from "../../Components/Employee/BarcodeScanner"
import Instructions from "../../Components/Employee/LabelCode/Instructions"
import LabelCodeCard from "../../Components/Employee/LabelCode/LabelCodeCard"
import ProductCard from "../../Components/Employee/ProductCard"
import { useMqtt } from "../../context/MqttContext"
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates"
import ScaleIcon from "@mui/icons-material/Scale"
import TrolleyValues from "./Layout/TrolleyValues"

const EmployeeOrder = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderId } = location.state || {}
  const { publish, isConnected } = useMqtt()

  console.log("Order Id from location is ", orderId)
  const [id, setId] = useState()
  const [allProducts, setProducts] = useState([])
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("info")
  const [scanResult, setScanResult] = useState("")
  const [activeScanner, setActiveScanner] = useState("image")
  const data = localStorage.getItem("employee")
  const employeeData = JSON.parse(data)
  const employeeId = employeeData._id
  const [orderInfo, setOrderInfo] = useState({})
  const [productInfo, setProductInfo] = useState("")
  const [openLabeCard, setOpenLabelCard] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  const getProductByBarcode = async (barcode) => {
    try {
      setOpenLabelCard(false)
      const result = await axios.get(`${server}/products/barcode/${barcode}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      if (result?.data.length > 0) {
        setProductInfo(result.data[0])
        setOpenLabelCard(true)
      } else {
        showProductNotFound()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const updateLabelCode = async (productId, labelCode, weight) => {
    try {
      const payload = {}
      if (labelCode) {
        payload.labelcode = labelCode
      }
      if (weight) {
        payload.weight = weight
      }
      const result = await axios.put(
        `${server}/products/update/${productId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
      showLabeUpdate()
    } catch (error) {
      showFailedLabelUpdate()
    }
  }

  const getOrders = async () => {
    const result = await axios.get(`${server}/employee-labelcode/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
    console.log("result is ", result.data)
    setOrderInfo({
      message: result?.data?.message,
      orderNo: result?.data?.orderId,
      totalAmount: result?.data?.total_amount,
    })

    const productList = result.data?.products
    console.log("detail order productlist", result?.data.products)
    setProducts(productList)
    setId(result?.data?.order?._id)
    // if (productList) {
    //   // Sort the productList array based on labelcode within productId
    //   const sortedProductList = productList.sort((a, b) => {
    //     // Ensure productId and labelcode are defined
    //     const labelcodeA = parseInt(a.productId?.labelcode || "0", 10);
    //     const labelcodeB = parseInt(b.productId?.labelcode || "0", 10);
    //     return labelcodeA - labelcodeB;
    //   });
    //   // Update state with the sorted product list
    //   setProducts(sortedProductList);
    // }
  }

  const handleSnackbarClose = () => {
    setOpenSnackbar(false)
  }

  const vibrateDevice = (pattern) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }

  const showWarningSnackbar = () => {
    setSnackbarMessage("Product is Already Scanned!")
    setSnackbarSeverity("warning")
    setOpenSnackbar(true)
    vibrateDevice([200, 100, 200])
  }
  const showProductScan = () => {
    setSnackbarMessage("Your Product Scanned!")
    setSnackbarSeverity("info")
    setOpenSnackbar(true)
    // vibrateDevice([200, 100, 200]);
  }
  const showProductNotFound = () => {
    setSnackbarMessage("Product is Not in List!")
    setSnackbarSeverity("warning")
    setOpenSnackbar(true)
    vibrateDevice([200, 100, 200])
  }
  const showLabeUpdate = () => {
    setSnackbarMessage("Product Updated")
    setSnackbarSeverity("info")
    setOpenSnackbar(true)
  }
  const showFailedLabelUpdate = () => {
    setSnackbarMessage("Failed to update!")
    setSnackbarSeverity("warning")
    setOpenSnackbar(true)
  }
  const showTurnedOffCamera = () => {
    setSnackbarMessage("Please Turned Off the Camera")
    setSnackbarSeverity("warning")
    setOpenSnackbar(true)
  }

  const handleScan = async (barcode) => {
    if (orderId) {
      // Convert the scanned barcode to a string and trim any extra whitespace
      const productBarcode = String(barcode).trim()

      let foundProduct = false
      const updatedProducts = await Promise.all(
        allProducts?.map(async (product) => {
          const productBarcodes = Array.isArray(
            product.vendor_product?.product?.barcode
          )
            ? product.vendor_product?.product?.barcode.map((b) =>
                String(b).trim()
              )
            : []

          console.log("Product barcodes after conversion:", productBarcodes)
          console.log("Scanned barcode:", `"${productBarcode}"`)

          // Check if the product barcode array includes the scanned barcode
          if (
            product.vendor_product?.product?.barcode?.includes(productBarcode)
          ) {
            foundProduct = true

            if (product.scannedCount >= product.quantity) {
              showWarningSnackbar()
              setScanResult("")
              return product
            }
            // if (!product?.productId?.weight) {
            //   setProductInfo(product?.productId)
            //   setOpenLabelCard(true)
            //   setScanResult("")
            //   return product
            // }

            try {
              console.log("publish ", product.vendor_product?.product?.weight)
              console.log("product.scannedCount+1", product.scannedCount + 1)
              const newScannedCount = product.scannedCount + 1
              const isScanned = newScannedCount === product.quantity
              await axios.patch(
                `${server}/orders/update-scannedCount?orderId=${orderId}&productId=${product.vendor_product?._id}`,
                {
                  scannedCount: newScannedCount,
                  isScanned: isScanned,
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "accessToken"
                    )}`,
                  },
                }
              )

              showProductScan()
              const netWeight = parseFloat(
                localStorage.getItem("virtualcartweight")
              )
              console.log("ntwet", netWeight)

              const trolley = localStorage.getItem("trolley")
              const productWeight = product.vendor_product?.product?.weight
              const totalWeight = netWeight + productWeight
              localStorage.setItem("virtualcartweight", totalWeight)
              publish("guestUser/updateVirtualCartWeight", {
                virtualWeight: totalWeight,
                trolleyId: trolley,
              })
              console.log("newScannedCount", newScannedCount)
              console.log("isScanned ", isScanned)

              setTimeout(() => {
                setScanResult("")
              }, 3000)

              return {
                ...product,
                scannedCount: newScannedCount,
                isScanned: isScanned,
              }
            } catch (error) {
              console.error(error)
              return product
            }
          }
          return product
        })
      )

      if (!foundProduct) {
        showProductNotFound()
      }
      console.log("updatedProducts", updatedProducts)
      setProducts(updatedProducts)
    } else {
      setTimeout(() => {
        setScanResult("")
      }, 2000)
      await getProductByBarcode(barcode)
    }
  }

  // Determine if all products are scanned
  const allProductsScanned = allProducts?.every(
    (product) => product.scannedCount >= product.quantity
  )

  const updateEndScanTime = async () => {
    try {
      const result = await axios.patch(
        `${server}/update-employee-order/employeeOrder?employeeId=${employeeId}&orderId=${orderId}`,
        {
          endScanTime: new Date(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  const handleDispatch = async () => {
    if (allProductsScanned) {
      setActiveScanner("image")
      if (isScanning) {
        return showTurnedOffCamera()
      }
      await updateEndScanTime()
      navigate("/employee-dispatch", { state: { orderId: id, id: orderId } })
    } else {
      console.log("Not all products are scanned.")
    }
  }

  const onLabelCodeChange = async (productId, labelCode, weight) => {
    await updateLabelCode(productId, labelCode, weight)
    getOrders()
    setOpenLabelCard(false)
  }

  useEffect(() => {
    const updateScanTime = async () => {
      try {
        const result = await axios.patch(
          `${server}/update-employee-order/employeeOrder?employeeId=${employeeId}&orderId=${orderId}`,
          {
            startScanTime: new Date(),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        )
      } catch (error) {
        console.log(error)
      }
    }
    if (orderId) {
      getOrders()
      updateScanTime()
    }
  }, [])

  useEffect(() => {
    if (allProducts?.length > 0) {
      const count = allProducts?.filter(
        (product) => product.scannedCount === product.quantity
      ).length

      setOrderInfo((prevOrderInfo) => ({
        ...prevOrderInfo,
        scannedTotal: count,
      }))

      const getTotalPrice = () => {
        return allProducts?.reduce((total, product) => {
          console.log("map product ", product)
          let variantMultiplier = product?.variant ? product.variant : 1
          console.log("variant mulitplie ri ", variantMultiplier)
          // If the variant is greater than or equal to 100 (grams), convert to kilograms
          if (variantMultiplier >= 100) {
            variantMultiplier = variantMultiplier / 1000 // Convert grams to kg
          }
          return (
            total +
            product.scannedCount * (product?.price || 0) * variantMultiplier
          )
        }, 0)
      }
      const value = getTotalPrice()
      console.log("value ", value)
      setOrderInfo((prevOrderInfo) => ({
        ...prevOrderInfo,
        scannedAmout: value,
      }))
    }
  }, [allProducts])

  const handleBackClick = () => {
    if (isScanning) {
      console.log("turned off the camera")
      return showTurnedOffCamera()
    }
    if (orderId) {
      navigate("/employee-orders")
    } else {
      navigate("/employee-home")
    }
  }

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

        {/* <Typography variant="h6" sx={styles.CategoryTitle}>
          Order #{orderInfo.orderNo}
        </Typography> */}
      </Box>
      {/* Top Half: Barcode Scanner (Placeholder for now) */}
      <div style={styles.topHalf}>
        {/* <Typography variant="h6" color="textSecondary" align="center"> */}
        {/* Scanner Component Placeholder */}
        {/* <EmployeeScanner
            handleScan={handleScan}
            scanResult={scanResult}
            setScanResult={setScanResult}
            activeScanner={activeScanner}
            setActiveScanner={setActiveScanner}
          /> */}
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
            {orderInfo.scannedTotal} / {allProducts?.length}
          </Typography>
        </Box>
      )}

      {/* Bottom Half: Product Cards */}
      <div style={styles.bottomHalf}>
        {!orderId && <Instructions />}
        {openLabeCard && (
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
            {allProducts?.map((product, index) => (
              <Grid item xs={12} key={index}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>

      {orderId && (
        <Box sx={styles.bottomStickyContainer}>
          {/* <Box sx={styles.TotalDivTotal}>
      <Typography sx={styles.TotalTotal}>Order Amount</Typography>
      <Typography sx={styles.TotalTotal}>
        ₹{orderInfo.scannedAmout}/₹{orderInfo.totalAmount}
      </Typography>
    </Box> */}

          <Button
            variant="contained"
            color="primary"
            onClick={handleDispatch}
            sx={styles.ButtonCart}
            disabled={!allProductsScanned || orderId === undefined}
          >
            Confirm Order ₹{orderInfo.scannedAmout}/₹{orderInfo.totalAmount}
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
  )
}

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

  ButtonCart: {
    backgroundColor: "#5EC401",
    color: "#fff",
    textTransform: "none",
    fontSize: "18px",
    fontWeight: "500",
    fontFamily: "Poppins",
    width: "99%",
    "&.MuiButtonBase-root:hover": {
      background: "#64cf00",
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
}

export default EmployeeOrder
