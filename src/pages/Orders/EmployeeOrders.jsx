import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import { Box, IconButton, Tab, Tabs, Typography } from "@mui/material"
import axios from "axios"
import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import server from "../../Components/server"
import EmployeeOrderCard from "./Layout/EmployeeOrderCard"
import TrolleyModal from "./Layout/TrolleyModal"

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  backgroundColor: "#fff",
  borderBottom: "1px solid #EAEAEA",
}

const arrowStyle = {
  position: "absolute",
  left: "20px",
}

const CategoryTitle = {
  fontWeight: "600",
  fontFamily: "Quicksand",
}

function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

const Orders = (props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentOrderId, setCurrentOrderId] = useState(null)

  const [value, setValue] = useState(
    location?.state?.value ? location?.state?.value : 0
  )
  const [orders, setOrders] = useState([])
  const [isModalOpen, setModalOpen] = useState(false)

  const handleOpenModal = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    navigate(`/employee-order`, { state: { orderId: currentOrderId } })
  }

  const handleConfirm = () => {
    console.log("User confirmed they have a Searching Trolley.")
    setModalOpen(false)
    navigate(`/trolley-connect`, { state: { orderId: currentOrderId } })
  }

  const handleNavigate = (orderId) => {
    // Set the current order and open the modal
    setCurrentOrderId(orderId)
    setModalOpen(true)
  }

  const getOrders = async () => {
    const data = localStorage.getItem("employee")
    const employeeData = JSON.parse(data)
    try {
      const result = await axios.get(
        `${server}/employee-orders/${employeeData._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
      const arr = result.data
      console.log("vendor order is ", result.data)
      setOrders(arr)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  useEffect(() => {
    getOrders()
  }, [])

  useEffect(() => {}, [orders])

  return (
    <Box sx={{ marginBottom: "100px", width: "100%" }}>
      <Box sx={header}>
        <Box sx={arrowStyle}>
          <Link to="/employee-home">
            <IconButton>
              <ArrowBackRoundedIcon />
            </IconButton>
          </Link>
        </Box>
        <Typography variant="h6" sx={CategoryTitle}>
          Fullfillment Orders
        </Typography>
      </Box>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            textColor="secondary"
            indicatorColor="primary"
            sx={{
              width: "100%",
              justifyContent: "space-between",
              display: "flex",
            }}
          >
            <Tab sx={{ width: "50%" }} label="Pending" {...a11yProps(0)} />
            <Tab sx={{ width: "50%" }} label="for Dispatch" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <Box>
          <TabPanel value={value} index={0} sx={{ overflow: "auto" }}>
            {orders &&
              orders.map((currorder, i) => {
                return (
                  currorder.order_status === "pending" && (
                    <EmployeeOrderCard
                      orderdetails={currorder}
                      value={value}
                      key={i}
                      handleOpenModal={handleOpenModal}
                      handleNavigate={handleNavigate}
                      sx={{ padding: "50px" }}
                    />
                  )
                )
              })}
          </TabPanel>
        </Box>
        <TabPanel
          value={value}
          index={1}
          sx={{ overflow: "auto" }}
          tabindicatorprops={{
            style: {
              backgroundColor: "#5EC401",
            },
          }}
        >
          {orders &&
            orders.map((currorder, i) => {
              return (
                currorder.order_status === "inprogress" && (
                  <EmployeeOrderCard
                    orderdetails={currorder}
                    value={value}
                    key={i}
                  />
                )
              )
            })}
        </TabPanel>
      </Box>
      <TrolleyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      />
    </Box>
  )
}

export default Orders
