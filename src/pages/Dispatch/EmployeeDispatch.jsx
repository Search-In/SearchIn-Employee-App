import { ArrowBack } from "@mui/icons-material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlaceIcon from "@mui/icons-material/Place";
import {
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../../Components/Employee/ProductCard";
import { useMqtt } from "../../context/MqttContext";
import { api } from "../../api/api";

const EmployeeDispatch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    vendor_order: vendor_order_id,
    orderItems = [],
    vendorProductScannedCount = {},
    scannedOrderItems = [],
  } = location.state || {};
  // console.log("new world order", id)
  const { publish, disconnect, setIsSessionEnded } = useMqtt();

  const scannedAmout = scannedOrderItems.reduce((total, product) => {
    let variantMultiplier = product?.variant || 1;
    if (variantMultiplier >= 100) variantMultiplier /= 1000;
    return total + product.quantity * (product?.price || 0) * variantMultiplier;
  }, 0);

  const [products, setProducts] = useState([]);
  const data = localStorage.getItem("employee");
  const employeeData = JSON.parse(data);
  const employeeId = employeeData._id;
  const [recipientInfo, setRecipientInfo] = useState({});

  const getOrders = async () => {
    const data = localStorage.getItem("employee");
    const result = await api.order.fetchOneOrder(vendor_order_id);
    setRecipientInfo({
      name: result?.deliveryAddress?.recipientName,
      phone: result?.deliveryAddress?.recipientPhoneNo,
      addressLine: result?.deliveryAddress?.addressLine,
      locationType: result?.deliveryAddress?.locationType,
      pincode: result?.deliveryAddress?.pincode,
      message: result?.message,
      orderNo: result?.vendor_order?._id,
      totalAmount: result?.totalAmount,
    });
    const arr = result.data?.productList;
    console.log("setting arr", result.data);
    setProducts(arr);
  };

  useEffect(() => {
    getOrders();
  }, []);

  const handleDispatch = async () => {
    await api.order.updateVendorOrder(vendor_order_id, {
      order_status: "confirmed",
    });
    await api.order.updateEmployeeOrder(vendor_order_id, {
      dispatchTime: new Date(),
    });
    localStorage.setItem("virtualcartweight", 0);
    const session = localStorage.getItem("session");

    localStorage.removeItem("session");
    localStorage.removeItem("trolley");
    sessionStorage.clear();
    publish("guestUser/endSession", { sessionId: session });
    setIsSessionEnded(true);
    disconnect();
    navigate("/dispatch-success");
  };

  useEffect(() => {
    if (products?.length > 0) {
      const count = products?.filter(
        (product) => product.scannedCount === product.quantity
      ).length;

      setRecipientInfo((prevrecipientInfo) => ({
        ...prevrecipientInfo,
        scannedTotal: count,
      }));

      const getTotalPrice = () => {
        return products?.reduce((total, product) => {
          return total + product.scannedCount * (product?.price || 0);
        }, 0);
      };
      const value = getTotalPrice();
      setRecipientInfo((prevrecipientInfo) => ({
        ...prevrecipientInfo,
        scannedAmout: value,
      }));
    }
  }, [products]);

  return (
    <div className="p-0 m-0 flex flex-col justify-between h-screen w-full border border-blue-500 overflow-y-auto">
      <div>
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
            {orderItems?.map((product, index) => (
              <Grid item xs={12} key={index}>
                <ProductCard
                  product={{
                    ...product,
                    scannedCount:
                      vendorProductScannedCount?.[
                        product?.vendor_product?._id
                      ] || -1,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </div>
      <div>
        <div className="bg-[#f5f5f5] px-4 text-lg min-h-[200px] font-semibold">
          <p>
            <PlaceIcon />
            Drop Location
          </p>
          <div className="flex flex-col overflow-y-auto text-md p-2">
            <p>Name: {recipientInfo.name}</p>
            <p>Phone: {recipientInfo.phone}</p>
            <p>Location Type : {recipientInfo.locationType}</p>
            <p>
              Address:
              {`${recipientInfo.addressLine} ${recipientInfo.pincode}`}
            </p>
          </div>
        </div>
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
          <p className="text-lg font-semibold px-4">Order Amount</p>
          <Typography sx={TotalTotal}>
            ₹{scannedAmout}/₹{recipientInfo.totalAmount}
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
      </div>
    </div>
  );
};

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px",
  backgroundColor: "#fff",
  borderBottom: "1px solid #EAEAEA",
};

const TopDiv = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "2px solid #EAEAEA",
  padding: "10px 20px",
};

const TotalTotal = {
  fontSize: "16px",
  fontWeight: "500",
  fontFamily: "Poppins",
  lineHeight: "24px",
  letterSpacing: "0.6px",
  textalign: "left",
  margin: "1px 10px",
};

const CategoryTitle = {
  fontWeight: "600",
  fontFamily: "Quicksand",
};

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
};

const TotalDivTotal = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  // margin: "10px 0px",
  // borderBottom: "2px solid #EAEAEA",
  // borderTop: "2px solid #EAEAEA",
  padding: "10px 0px",
};

const messageSection = {
  margin: 0,
  border: "1px solid #EAEAEA",
  borderRadius: "4px",
  padding: "10px",
  backgroundColor: "#fafafa",
};

const messageHeading = {
  marginBottom: "8px",
  fontWeight: "600",
  fontFamily: "Quicksand",
  fontSize: "13px",
  lineHeight: "16.25px",
  textalign: "left",
};

const messageBody = {
  maxHeight: "80px",
  overflowY: "auto",
};

const dropLocationSection = {
  margin: 0,
  border: "1px solid #EAEAEA",
  borderRadius: "4px",
  padding: "10px",
  backgroundColor: "#f5f5f5",
};

const dropLocationHeading = {
  marginBottom: "8px",
  fontWeight: "500",
  fontFamily: "Poppins",
  fontSize: "16px",
  lineHeight: "24px",
  letterSpacing: "0.6000000238418579px",
  textalign: "left",
};

const dropLocationBody = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  overflowY: "auto",
};

const dropLocationText = {
  fontSize: "14px",
  fontFamily: "Poppins",
};

const bottomStickyContainer = {
  position: "sticky",
  bottom: 0,
  width: "100%",
  backgroundColor: "#fff",
  borderTop: "1px solid #EAEAEA",
  padding: "10px",
  textAlign: "left",
  zIndex: 1000,
};
export default EmployeeDispatch;
