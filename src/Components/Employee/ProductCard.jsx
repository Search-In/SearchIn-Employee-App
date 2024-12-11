import { Avatar, Box, Paper, Typography } from "@mui/material"
import verifyIcon from "../../../src/assets/verifyimage.png"

const ProductCard = ({ product }) => {
  const isScanned = product.scannedCount >= product.quantity
  console.log("Product Card is ", product)

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
              product?.vendor_product?.product?.name ||
              product?.productId?.name ||
              product?.product?.product?.name
            }
            src={
              product?.vendor_product?.product?.imageUrl ||
              product?.productId?.imageUrl ||
              product?.product?.product?.imageUrl
            }
            sx={styles.avatar}
            variant="square"
          />
          <Typography sx={styles.labelId}>Product Label:</Typography>
          <Box sx={styles.scanPriceTextBox}>
            <Typography sx={styles.scanPriceText}>
              ₹
              {(
                product?.vendor_product?.product?.price ||
                product?.productId?.price ||
                product?.product?.product?.price
              )?.toFixed(2)}
            </Typography>
            <Typography sx={styles.scanRate}> Scan Rate</Typography>
          </Box>
        </Box>

        <Box sx={styles.details}>
          <Typography variant="h6" sx={styles.productName}>
            {product?.vendor_product?.product?.name ||
              product?.productId?.name ||
              product?.product?.product?.name}
          </Typography>
          <div style={styles.priceContainer}>
            {(product?.vendor_product?.product?.mrpPrice ||
              product?.productId?.mrpPrice ||
              product?.product?.product?.mrpPrice) && (
              <Typography sx={styles.priceText}>
                ₹
                {(
                  product?.vendor_product?.product.mrpPrice ||
                  product?.productId?.mrpPrice ||
                  product?.product?.product?.mrpPrice
                )?.toFixed(2)}
              </Typography>
            )}
            <Box>
              <Typography sx={styles.salePriceText}>
                ₹
                {(
                  product?.vendor_product?.product?.price ||
                  product?.productId?.price ||
                  product?.product?.product?.price
                ).toFixed(2)}
              </Typography>
              <Typography sx={styles.salesPrice}>Ordered At</Typography>
            </Box>

            <Typography sx={styles.variantText}>
              {(product?.vendor_product?.product?.variant ||
                product?.productId?.variant ||
                product?.product?.product?.variant) &&
                `${
                  (product?.vendor_product?.product?.variant ||
                    product?.productId?.variant ||
                    product?.product?.product?.variant) >= 100
                    ? (product?.vendor_product?.product?.variant ||
                        product?.productId?.variant ||
                        product?.product?.product?.variant) + " gm"
                    : (product?.vendor_product?.product?.variant ||
                        product?.productId?.variant ||
                        product?.product?.product?.variant) + " Kg"
                }`}
            </Typography>
          </div>
          <div style={styles.labelCodeDiv}>
            <Typography variant="body1" sx={styles.labelCode}>
              {product?.vendor_product?.product?.labelcode ||
                product?.productId?.labelcode ||
                product?.product?.product?.labelcode}
            </Typography>
          </div>
        </Box>
        {isScanned && (
          <Box
            component="img"
            src={verifyIcon}
            alt="Verified"
            sx={styles.verifyIcon}
          />
        )}
        <Box sx={styles.scannedCountContainer}>
          <Typography variant="body2" sx={styles.scannedCount}>
            {product?.scannedCount || product?.count || 0}/
            {product?.quantity || product?.count}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

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
    width: "71px",
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
    top: "20px",
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
    top: "62px", // Adjust based on your design
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
}

export default ProductCard
