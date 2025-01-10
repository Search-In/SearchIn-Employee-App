import { Box } from "@mui/material";
import { createContext } from "react";
import { NavLink } from "react-router-dom";
import Account from "../../../assets/account.svg";
import Cart from "../../../assets/cart.svg";
import ScannerImg from "../../../assets/qr-code-scan-icon.svg";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

export const NavBarContext = createContext();

const NavbarContainer = {
  backgroundColor: "#ffffff",
  boxShadow: "0px 2px 7px rgba(0, 0, 0, 0.84)",
  borderRadius: "20px 20px 0px 0px;",
  padding: "16px 0px",
  position: "fixed",
  bottom: "0",
  width: "100%",
  minHeight: "5vh",
  zIndex: 10,
};

const NavbarDiv = {
  display: "flex",
  justifyContent: "space-evenly",
};

const NavItemStyle = {
  borderRadius: "50%",
  width: "54px",
  height: "54px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "black",
};

const notactivenavbarclass = {
  textDecoration: "none",
  backgroundColor: "#ffffff",
};

const activenavbarclass = {
  textDecoration: "none",
  backgroundColor: "#5ec401",
  color: "#ffffff",
  borderRadius: "50%",
};

const Navbar = () => {
  const items = 0;
  return (
    <div
      className={
        "bg-white shadow-[0px_2px_7px_rgba(0,0,0,0.84)] rounded-t-[20px] p-[16px_0] fixed bottom-0 w-full min-h-[5vh] z-10 " +
        "max-w-3xl"
      }
    >
      <Box sx={NavbarDiv}>
        <NavLink
          to="/employee-orders"
          style={({ isActive }) =>
            isActive ? activenavbarclass : notactivenavbarclass
          }
        >
          <Box sx={NavItemStyle} className="nav-items">
            <Box
              sx={{
                borderRadius: "100%",
                backgroundColor: "#F37A20",
                position: "absolute",
                width: "5vw",
                display: "flex",
                alignItems: "center",
                marginBottom: "20px",
                marginLeft: "25px",
                justifyContent: "center",
              }}
            >
              {items > 0 ? <>{items}</> : <></>}
            </Box>
            <img src={Cart} alt="" />
          </Box>
        </NavLink>
        <NavLink
          to="/employee-order"
          style={({ isActive }) =>
            isActive ? activenavbarclass : notactivenavbarclass
          }
        >
          <Box sx={NavItemStyle} className="nav-items">
            <img
              src={ScannerImg}
              alt=""
              style={{ width: "20px", height: "20px" }}
            />
          </Box>
        </NavLink>
        {/* <NavLink
          to='/place-order'
          style={({ isActive }) => (isActive ? activenavbarclass : notactivenavbarclass)}>
          <Box sx={NavItemStyle} className='nav-items'>
            <AddShoppingCartIcon />
          </Box>
        </NavLink> */}
        <NavLink
          to="/employee-home"
          style={({ isActive }) =>
            isActive ? activenavbarclass : notactivenavbarclass
          }
        >
          <Box sx={NavItemStyle} className="nav-items">
            <img src={Account} alt="" />
          </Box>
        </NavLink>
      </Box>
    </div>
  );
};

export default Navbar;
