import { ArrowBack } from "@mui/icons-material"
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded"
import PlaceIcon from "@mui/icons-material/Place"
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Typography,
} from "@mui/material"
import axios from "axios"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import server from "../../Components/server"
import ProductCard from "../../Components/Employee/ProductCard"
import { useMqtt } from "../../context/MqttContext"

const EmployeeDispatch = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderId, id } = location.state || {}
  console.log("new world order", id)
  const { publish, disconnect, setIsSessionEnded } = useMqtt()

  const [products, setProducts] = useState([])
  const data = localStorage.getItem("employee")
  const employeeData = JSON.parse(data)
  const employeeId = employeeData._id
  const [recipientInfo, setRecipientInfo] = useState({})

  const getOrders = async () => {
    const data = localStorage.getItem("employee")
    const employeeData = JSON.parse(data)
    const result = await axios.get(`${server}/vendor/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
    setRecipientInfo({
      name: result?.data?.deliveryAddress?.recipientName,
      phone: result?.data?.deliveryAddress?.recipientPhoneNo,
      addressLine: result?.data?.deliveryAddress?.addressLine,
      locationType: result?.data?.deliveryAddress?.locationType,
      pincode: result?.data?.deliveryAddress?.pincode,
      message: result?.data?.message,
      orderNo: result?.data?.orderId,
      totalAmount: result?.data?.totalAmount,
    })
    const arr = result.data?.productList
    console.log("setting arr", result.data)
    setProducts(arr)
  }

  const updateOrderStatus = async () => {
    try {
      const result = await axios.patch(
        `${server}/vendor/orders/${orderId}`,
        {
          order_status: "inprogress",
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

  const updatedispatchTime = async () => {
    try {
      const result = await axios.patch(
        `${server}/update-employee-order/employeeOrder?employeeId=${employeeId}&orderId=${orderId}`,
        {
          dispatchTime: new Date(),
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
  useEffect(() => {
    getOrders()
  }, [])

  const handleDispatch = async () => {
    navigate("/dispatch-success")
    localStorage.setItem("virtualcartweight", 0)
    const session = localStorage.getItem("session")
    publish("guestUser/endSession", { sessionId: session })
    setIsSessionEnded(true)
    disconnect()
    localStorage.removeItem("session")
    localStorage.removeItem("trolley")
    sessionStorage.clear()
    await updatedispatchTime()
    updateOrderStatus()
  }

  useEffect(() => {
    if (products?.length > 0) {
      const count = products?.filter(
        (product) => product.scannedCount === product.quantity
      ).length

      setRecipientInfo((prevrecipientInfo) => ({
        ...prevrecipientInfo,
        scannedTotal: count,
      }))

      const getTotalPrice = () => {
        return products?.reduce((total, product) => {
          return total + product.scannedCount * (product?.price || 0)
        }, 0)
      }
      const value = getTotalPrice()
      setRecipientInfo((prevrecipientInfo) => ({
        ...prevrecipientInfo,
        scannedAmout: value,
      }))
    }
  }, [products])

  return (
    <Box
      sx={{
        border: 0,
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        border: "1px solid blue",
        overflowY: "auto",
      }}
    >
      <Box sx={header}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="back"
          onClick={() => navigate(-1)}
          sx={{ position: "absolute", top: "10px", left: "10px" }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={CategoryTitle}>
          Order #{recipientInfo.orderNo}
        </Typography>
      </Box>

      <Box sx={TopDiv}>
        <Typography sx={TotalTotal}>Total</Typography>
        <Typography sx={TotalTotal}>
          {recipientInfo.scannedTotal}/{products?.length}
        </Typography>
      </Box>

      <Container maxWidth={false} disableGutters>
        <Grid container spacing={0}>
          {products?.map((product, index) => (
            <Grid item xs={12} key={index}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={dropLocationSection}>
        <Typography variant="h6" sx={dropLocationHeading}>
          <PlaceIcon />
          Drop Location
        </Typography>
        <Box sx={dropLocationBody}>
          <Typography variant="body1" sx={dropLocationHeading}>
            Name:{recipientInfo.name}
          </Typography>
          <Typography variant="body1" sx={dropLocationText}>
            Phone: {recipientInfo.phone}
          </Typography>
          <Typography variant="body1" sx={dropLocationText}>
            Location Type : {recipientInfo.locationType}
          </Typography>
          <Typography variant="body1" sx={dropLocationText}>
            Address:
            {`${recipientInfo.addressLine} ${recipientInfo.pincode}`}
          </Typography>
        </Box>
      </Box>
      {recipientInfo.message && (
        <Box sx={messageSection}>
          <Typography variant="h6" sx={messageHeading}>
            Customer's Special Message
          </Typography>
          <Box sx={messageBody}>
            <Typography variant="body2">{recipientInfo.message}</Typography>
          </Box>
        </Box>
      )}
      <Box sx={TotalDivTotal}>
        <Typography sx={TotalTotal}>Order Amount</Typography>
        <Typography sx={TotalTotal}>
          ₹{recipientInfo.scannedAmout}/₹{recipientInfo.totalAmount}
        </Typography>
      </Box>
      <Box sx={bottomStickyContainer}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDispatch}
          sx={ButtonCart}
        >
          Ready For Dispatch
          <ArrowForwardRoundedIcon
            sx={{ position: "absolute", right: "20px" }}
          />
        </Button>
      </Box>
    </Box>
  )
}

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px",
  backgroundColor: "#fff",
  borderBottom: "1px solid #EAEAEA",
}

const TopDiv = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "2px solid #EAEAEA",
  padding: "10px 20px",
}

const TotalTotal = {
  fontSize: "16px",
  fontWeight: "500",
  fontFamily: "Poppins",
  lineHeight: "24px",
  letterSpacing: "0.6px",
  textalign: "left",
  margin: "1px 10px",
}

const CategoryTitle = {
  fontWeight: "600",
  fontFamily: "Quicksand",
}

const ButtonCart = {
  backgroundColor: "#5EC401",
  color: "#fff",
  marginBottom: 0,
  marginLeft: "10px",
  textTransform: "none",
  // padding: "10px 10px",
  fontSize: "18px",
  fontWeight: "500",
  fontFamily: "Poppins",
  width: "95%",
  "&.MuiButtonBase-root:hover": {
    background: "#64cf00",
  },
}

const TotalDivTotal = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  // margin: "10px 0px",
  // borderBottom: "2px solid #EAEAEA",
  // borderTop: "2px solid #EAEAEA",
  padding: "10px 0px",
}

const messageSection = {
  margin: 0,
  border: "1px solid #EAEAEA",
  borderRadius: "4px",
  padding: "10px",
  backgroundColor: "#fafafa",
}

const messageHeading = {
  marginBottom: "8px",
  fontWeight: "600",
  fontFamily: "Quicksand",
  fontSize: "13px",
  lineHeight: "16.25px",
  textalign: "left",
}

const messageBody = {
  maxHeight: "80px",
  overflowY: "auto",
}

const dropLocationSection = {
  margin: 0,
  border: "1px solid #EAEAEA",
  borderRadius: "4px",
  padding: "10px",
  backgroundColor: "#f5f5f5",
}

const dropLocationHeading = {
  marginBottom: "8px",
  fontWeight: "500",
  fontFamily: "Poppins",
  fontSize: "16px",
  lineHeight: "24px",
  letterSpacing: "0.6000000238418579px",
  textalign: "left",
}

const dropLocationBody = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  maxHeight: "110px",
  overflowY: "auto",
}

const dropLocationText = {
  fontSize: "14px",
  fontFamily: "Poppins",
}

const bottomStickyContainer = {
  position: "sticky",
  bottom: 0,
  width: "100%",
  backgroundColor: "#fff",
  borderTop: "1px solid #EAEAEA",
  padding: "10px",
  textAlign: "left",
  zIndex: 1000,
}
export default EmployeeDispatch
