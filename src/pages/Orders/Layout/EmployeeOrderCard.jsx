import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined"
import { Box, Button, IconButton, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"

const EditButton = { backgroundColor: "#F37A20", margin: "5px 5px" }

const OrderTitle = {
  fontSize: "14px",
  color: "#37474F",
  fontFamily: "Poppins",
  fontWeight: "600",
}

const ShippingStatusDeliver = {
  color: "#5EC401",
  fontSize: "14px",
  fontFamily: "Poppins",
  fontWeight: "500",
}

const OrderDate = {
  fontSize: "13px",
  fontWeight: "400",
  fontFamily: "Poppins",
  color: "#868889",
}

const salePriceText = {
  color: "#F37A20",
  fontWeight: "500",
  fontSize: "18px",
  fontFamily: "Poppins",
  textAlign: "end",
  right: 5,
}

const buttonProductCard = {
  color: "#fff",
  backgroundColor: "#5EC401",
  display: "flex",
  height: "40px",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 2px",
  textTransform: "capitalize",
  borderRadius: "7px",
  position: "relative",
  bottom: 0,
  "&.MuiButtonBase-root:hover": {
    background: "#64cf00",
  },
  maxWidth: "80px",
}

const OrderDoneText = {
  fontSize: "22px",
  fontWeight: "600",
  fontFamily: "quicksand",
  textAlign: "center",
  padding: "0px 10px",
  color: "#181725",
  margin: "10px 0px",
}

const OrderPlacedText = {
  fontSize: "14px",
  fontWeight: "600",
  fontFamily: "quicksand",
  textAlign: "center",
  padding: "0px 10px",
  color: "#7C7C7C",
  margin: "10px 0px",
}

const ButtonCart = {
  backgroundColor: "#5EC401",
  color: "#fff",
  textTransform: "none",
  padding: "12px 10px",
  fontSize: "14px",
  fontWeight: "500",
  width: "100%",
  borderRadius: "19px",
  fontFamily: "quicksand",
  "&.MuiButtonBase-root:hover": {
    background: "#64cf00",
  },
}

const ButtonCartSecond = {
  backgroundColor: "#fff",
  color: "#181725",
  textTransform: "none",
  padding: "12px 10px",
  fontSize: "14px",
  fontWeight: "600",
  width: "100%",
  borderRadius: "19px",
  fontFamily: "quicksand",
  "&.MuiButtonBase-root:hover": {
    background: "#e9e8e8",
  },
}
const EmployeeOrderCard = (props) => {
  console.log("EmployeOrderCard Props ", props)
  const navigate = useNavigate()
  const handleClick = (e) => {
    e.preventDefault()
    if (props.orderdetails.order_status === "pending") {
      props?.handleOpenModal()
    }
  }
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #E1E1E1",
        paddingBottom: "20px",
        marginRight: "2px",
        marginTop: "10px",
        width: "100%",
      }}
      // onClick={handleClick}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
        onClick={(e) => {
          e.preventDefault()
          // props?.handleOpenModal()
          // props.orderdetails.status === "pending"
          //   ? navigate(`/employee-order`, {
          //       state: { orderId: props.orderdetails._id },
          //     })
          //   : null

          if (props.orderdetails.order_staus === "pending") {
            props?.handleNavigate(props.orderdetails._id)
          }
        }}
      >
        <IconButton sx={EditButton}>
          <ShoppingBasketOutlinedIcon sx={{ color: "#fff" }} />
        </IconButton>
        <Box
          sx={{ margin: "0px 0px 0px 10px" }}
          onClick={(e) => {
            e.preventDefault()
            // props?.handleOpenModal()
            // props.orderdetails.status === "pending"
            //   ? navigate(`/employee-order`, {
            //       state: { orderId: props.orderdetails._id },
            //     })
            //   : null

            if (props.orderdetails.order_status === "pending") {
              props?.handleNavigate(props.orderdetails._id)
            }
          }}
        >
          <Typography sx={OrderTitle}>
            Order #{props.orderdetails.order}
          </Typography>

          <Typography sx={ShippingStatusDeliver}>
            {props.orderdetails.order_status}
          </Typography>
          <Typography sx={OrderDate}>
            {props.orderdetails.createdAt?.toString().substring(0, 10)}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <Typography sx={salePriceText}>
          ₹
          {props.orderdetails.total_amount !== null
            ? props.orderdetails.total_amount?.toFixed(2)
            : props.orderdetails?.returnAmount?.toFixed(2)}
        </Typography>
        {props.orderdetails.order_status === "pending" && (
          <Button
            sx={buttonProductCard}
            onClick={(e) => {
              e.preventDefault()
              // props?.handleOpenModal()
              // navigate(`/employee-order`, {
              //   state: { orderId: props.orderdetails._id },
              // })
              props?.handleNavigate(props.orderdetails._id)
            }}
          >
            Start
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default EmployeeOrderCard
