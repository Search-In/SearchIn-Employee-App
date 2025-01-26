import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmployeeOrderCard from "./Layout/EmployeeOrderCard";
import TrolleyModal from "./Layout/TrolleyModal";
import { api } from "../../api/api";

const Orders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [value, setValue] = useState(location?.state?.value || 0);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    navigate(`/employee-order`, { state: { orderId: currentOrderId } });
  };
  const handleConfirm = () => {
    setModalOpen(false);
    navigate(`/trolley-connect`, { state: { orderId: currentOrderId } });
  };
  const handleNavigate = (orderId) => {
    setCurrentOrderId(orderId);
    setModalOpen(true);
  };

  const getOrders = async () => {
    try {
      const result = await api.order.getOrders();
      setOrders(result);
    } catch (error) {
      console.error(error);
      setOrders([]);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const handleChange = (event, newValue) => setValue(newValue);

  // console.log({ order_statuses: orders.map((o) => o.order_status) }); .

  return (
    <>
      <TrolleyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      />
      <Box className="mb-24 w-full px-3">
        <Box className="flex items-center justify-center p-2 bg-white border-b border-gray-200">
          <Box className="absolute left-5">
            <Link to="/employee-home">
              <IconButton>
                <ArrowBackRoundedIcon />
              </IconButton>
            </Link>
          </Box>
          <p className="font-semibold font-quicksand">Fullfillment Orders</p>
        </Box>
        <Box className="w-full">
          <Box className="border-b-1 border-gray-300 flex justify-center">
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="Order Status Tabs"
              textColor="secondary"
              indicatorColor="primary"
              className="w-full flex justify-between"
            >
              <Tab className="w-1/2" label="Pending" />
              <Tab className="w-1/2" label="Packed" />
            </Tabs>
          </Box>

          <Box>
            <TabPanel value={value} index={0}>
              {orders
                .filter((currOrder, i) => currOrder.order_status === "pending")
                .map((currOrder, i) => (
                  <EmployeeOrderCard
                    orderdetails={currOrder}
                    value={value}
                    key={i}
                    handleOpenModal={handleOpenModal}
                    handleNavigate={handleNavigate}
                  />
                ))}
            </TabPanel>

            <TabPanel value={value} index={1}>
              {orders
                .filter(
                  (currOrder, i) => currOrder.order_status === "confirmed"
                )
                .map((currOrder, i) => (
                  <EmployeeOrderCard
                    orderdetails={currOrder}
                    value={value}
                    key={i}
                    handleOpenModal={handleOpenModal}
                    handleNavigate={handleNavigate}
                  />
                ))}
            </TabPanel>
          </Box>
        </Box>
      </Box>
    </>
  );
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box className="p-3">
          <p>{children}</p>
        </Box>
      )}
    </div>
  );
}

export default Orders;
