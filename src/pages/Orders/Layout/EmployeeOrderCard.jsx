import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
import { Box, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { objectIdToNumber } from "../../../lib/mongo";
const EmployeeOrderCard = (props) => {
  const navigate = useNavigate();

  return (
    <Box className="flex items-center justify-between border-b border-gray-200 pb-5 mr-2 mt-2 w-full">
      <Box
        className="flex items-center"
        onClick={(e) => {
          e.preventDefault();

          if (props.orderdetails.order_status === "pending") {
            navigate("/employee-order", {
              state: { vendor_order: props.orderdetails._id },
            });
          }
        }}
      >
        <IconButton className="bg-[#F37A20] mx-1">
          <ShoppingBasketOutlinedIcon />
        </IconButton>
        <Box
          className="ml-2"
          onClick={(e) => {
            e.preventDefault();

            if (props.orderdetails.order_status === "pending") {
              navigate("/employee-order", {
                state: { vendor_order: props.orderdetails._id },
              });
            }
          }}
        >
          <p className="text-[#37474F] text-sm font-semibold">
            Order #{objectIdToNumber(props.orderdetails._id)}
          </p>

          <p className="text-[#5EC401] text-sm font-medium capitalize">
            {props.orderdetails.order_status}
          </p>
          <p className="text-[#868889] text-xs font-normal">
            {new Date(props.orderdetails.createdAt).toLocaleString()}
          </p>
        </Box>
      </Box>

      <Box className="flex flex-col items-end justify-between h-full">
        <p className="text-[#F37A20] font-medium text-xl text-right">
          ₹
          {props.orderdetails.total_amount !== null
            ? props.orderdetails.total_amount?.toFixed(2)
            : props.orderdetails?.returnAmount?.toFixed(2)}
        </p>

        {props.orderdetails.order_status === "pending" && (
          <button
            className="mt-4 border-2 border-[#5EC401] flex items-center justify-center py-2 px-2 rounded-md max-w-[80px] hover:bg-[#64cf00] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#5EC401] focus:ring-offset-2"
            onClick={(e) => {
              e.preventDefault();
              navigate("/employee-order", {
                state: { vendor_order: props.orderdetails._id },
              });
            }}
          >
            Start
          </button>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeOrderCard;
