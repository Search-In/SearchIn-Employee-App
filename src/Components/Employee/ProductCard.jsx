import { Avatar, Box, Paper, Typography } from "@mui/material";
import verifyIcon from "../../../src/assets/verifyimage.png";

const ProductCard = ({ product: order_item, onClick = () => {} }) => {
  const isScanned = order_item.scannedCount >= order_item.quantity;

  const isLooseProduct =
    (order_item?.quantity != null && !Number.isInteger(order_item.quantity)) ||
    order_item?.vendor_product?.product?.name?.toLowerCase()?.includes("loose");

  return (
    <Paper
      elevation={1}
      sx={{ ...styles.card, ...(isScanned && styles.scanned) }}
    >
      <Box sx={styles.container}>
        {/* Product Image */}

        <Box>
          <Avatar
            alt={
              order_item?.vendor_product?.product?.name ||
              order_item?.productId?.name ||
              order_item?.product?.product?.name
            }
            src={
              order_item?.vendor_product?.product?.imageUrl ||
              order_item?.productId?.imageUrl ||
              order_item?.product?.product?.imageUrl
            }
            sx={styles.avatar}
            variant="square"
          />
          <Typography sx={styles.labelId}>Product Label:</Typography>
          <Box sx={styles.scanPriceTextBox}>
            <Typography sx={styles.scanPriceText}>
              ₹{order_item?.vendor_product?.price?.toFixed(2)}
            </Typography>
            <p className="font-semibold text-blue-900 text-sm font-[Poppins] text-[16px]">
              Scan Rate
            </p>
          </Box>
        </Box>

        <div className="flex flex-col w-[60%] h-full pt-4">
          <p variant="h6" className="font-bold py-1 text-[17px]">
            {order_item?.vendor_product?.product?.name ||
              order_item?.productId?.name ||
              order_item?.product?.product?.name}
          </p>
          <div className="flex w-full justify-between mr-3 ">
            <Box>
              <p className="text-orange-500 font-bold text-[18px]">
                ₹{(order_item?.price).toFixed(2)}
              </p>
              <p className="font-semibold text-sm font-[Poppins] text-[16px]">
                Ordered At
              </p>
            </Box>

            <Typography sx={styles.variantText}>
              {isLooseProduct && // Ensure quantity exists
                `${
                  order_item.quantity < 1
                    ? (order_item.quantity * 1000).toFixed(2) + " gm" // Convert to grams if less than 1
                    : order_item.quantity + " Kg" // Display as loose product if it's a decimal
                }`}
            </Typography>
          </div>
        </div>
        {isScanned && (
          <img
            src={verifyIcon}
            alt="Verified"
            style={styles.verifyIcon}
            onClick={onClick}
          />
        )}
        {/* <div> */}
        <div style={styles.scannedCountContainer} onClick={onClick}>
          {isLooseProduct ? (
            <Typography
              variant="body2"
              sx={styles.scannedCount}
              onClick={onClick}
            >
              {order_item?.scannedCount ? 1 : 0}/ 1
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={styles.scannedCount}
              onClick={onClick}
            >
              {order_item?.scannedCount || order_item?.count || 0}/
              {order_item?.quantity || order_item?.count}
            </Typography>
          )}
        </div>
        <div style={styles.labelCodeDiv} className="absolute bottom-4 right-2">
          <Typography variant="body1" sx={styles.labelCode}>
            {order_item?.vendor_product?.labelcode}
          </Typography>
        </div>
        {/* </div> */}
      </Box>
    </Paper>
  );
};

const styles = {
  card: {
    padding: 0,
    margin: 0,
    backgroundColor: "#fafafa",
    border: "1px solid #F0F0F0",
  },
  container: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    height: "160px",
  },
  avatar: {
    width: "70px",
    height: "75px",
    marginLeft: "14px",
    borderRadius: "9px 0px 0px 0px",
    marginRight: "16px",
    marginBottom: "0px",
  },
  details: {
    position: "relative",
    right: 8,
    top: 0,
  },
  productName: {
    width: "190px",
    height: "48px",
    fontFamily: "Poppins, sans-serif",
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "24px",
    letterSpacing: "0.6px",
    textAlign: "left",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  labelId: {
    visibility: "hidden",
    marginLeft: "15px",
    fontFamily: "Poppins, sans-serif",
    fontSize: "10px",
    fontWeight: "600",
    lineHeight: "19.5px",
    letterSpacing: "0.6px",
    textAlign: "left",
    marginTop: "20px",
  },
  scanned: {
    opacity: 0.9,
  },
  verifyIcon: {
    position: "absolute",
    top: "10px",
    right: "22px",
    width: "30px",
    height: "32px",
  },
  priceContainer: {
    display: "flex",
    alignItems: "space-between",
    gap: "5px",
    flexWrap: "nowrap",
    // overflowX: "auto",
  },
  priceText: {
    position: "relative",
    top: 5,
    fontWeight: "600",
    color: "rgba(55, 71, 79, 0.54);",
    textDecoration: "line-through",
    margin: "0",
    fontSize: "14px",
    fontFamily: "Poppins",
  },
  salePriceText: {
    color: "#F37A20",
    fontWeight: "600",
    margin: "0",
    fontSize: "20px",
    fontFamily: "Poppins",
  },
  salesPrice: {
    position: "absolute",
    fontSize: "12px",
    fontFamily: "Poppins",
    color: "rgba(55, 71, 79, 0.54);",
  },

  scanPriceTextBox: {
    position: "absolute",
    left: 20,
    bottom: 6,
  },
  scanPriceText: {
    color: "#455d7a",
    fontWeight: "600",
    margin: "0",
    fontSize: "20px",
    fontFamily: "Poppins",
  },
  scanRate: {
    fontSize: "12px",
    margin: 0,
    fontSize: "12px",
    fontFamily: "Poppins",
    color: "rgba(55, 71, 79, 0.54);",
  },
  variantText: {
    position: "relative",
    top: 5,
    left: 25,
    color: "#475053",
    fontWeight: "600",
    margin: "0",
    fontSize: "16px",
    fontFamily: "Poppins, sans-serif",
    lineHeight: "20px",
  },
  scannedCountContainer: {
    position: "absolute", // Position it absolutely
    top: "30%", // Adjust based on your design
    right: "5px", // Adjust based on your design
    width: "60px", // Fixed width
    height: "auto", // Set to auto to allow wrapping
    display: "flex",
    alignItems: "center",
    justifyContent: "center", // Center align text
    padding: "4px", // Padding to avoid text touching borders
    overflowWrap: "break-word", // Allow text to wrap
    wordWrap: "break-word", // Allow text to wrap
    whiteSpace: "normal", // Allow normal wrapping
  },
  scannedCount: {
    fontSize: "20px",
    textAlign: "center", // Center align text
  },
  // scannedCount: {
  //   position: "absolute",
  //   top: "62px",
  //   right: "32px",
  //   width: "11px",
  //   height: "24px",
  //   fontSize: "20px",
  //   whiteSpace: "wrap", // Prevent line breaks
  //   maxWidth: "50px", // Limit the maximum width
  // },

  labelCodeDiv: {
    width: "124px",
    height: "30px",
    backgroundColor: "#FFF2E7",
    borderRadius: "6px",
    opacity: 0.9,
    marginLeft: "138px",
    marginTop: "18px",
    border: "2px solid #FFD4D4",
  },
  labelCode: {
    marginLeft: "5px",
    textAlign: "center",
  },
};

export default ProductCard;
