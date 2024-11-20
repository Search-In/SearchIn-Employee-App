import CloseIcon from "@mui/icons-material/Close"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useRef, useState } from "react"

const LabelCodeCard = ({ product, onRemove, onLabelCodeChange }) => {
  const [labelArea = "", labelBay = "", labelRack = "", labelShelf = ""] =
    product?.labelcode?.split("-") || []
  const [area, setArea] = useState(labelArea || "")
  const [bayNo, setBayNo] = useState(labelBay || "")
  const [rack, setRack] = useState(labelRack || "")
  const [shelf, setShelf] = useState(labelShelf || "")
  const [weight, setWeight] = useState(product?.weight || "") // New state for weight

  const areaRef = useRef(null)
  const bayNoRef = useRef(null)
  const rackRef = useRef(null)
  const shelfRef = useRef(null)
  const weightRef = useRef(null)

  const handleKeyPress = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault() // Prevent the default form submission behavior
      nextRef.current?.focus() // Focus on the next input field
    }
  }

  const handleLabelCodeChange = () => {
    const labelCode = `${area}-${bayNo}-${rack}-${shelf}`
    onLabelCodeChange(product._id, labelCode, weight)
  }

  const handleRemove = () => {
    if (!weight) {
      alert("Please enter the weight before closing the card.") // Show alert or error message
      return
    }
    onRemove()
  }

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 450,
        margin: "auto",
        boxShadow: 5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <CardMedia
          component="img"
          sx={{ width: 100, height: 100 }}
          image={product?.imageUrl}
          alt={product?.name}
        />
        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <CardContent
            sx={{
              padding: "8px",
              "&:last-child": { paddingBottom: "8px" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 1,
              }}
            >
              <Typography
                variant="body1"
                component="div"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 1,
                }}
              >
                {product?.name}
              </Typography>
              <IconButton
                aria-label="close"
                onClick={handleRemove}
                size="small"
                sx={{ paddingTop: 0 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <div style={styles.priceContainer}>
              {product?.mrpPrice && (
                <Typography sx={styles.priceText}>
                  ₹{product?.mrpPrice?.toFixed(2)}
                </Typography>
              )}
              <Typography sx={styles.salePriceText}>
                ₹{product?.price?.toFixed(2)}
              </Typography>
            </div>
            <Typography>BarCode-{product?.barcode}</Typography>
          </CardContent>
        </Box>
      </Box>

      <Box
        sx={{
          padding: "16px",
          borderTop: "1px solid rgba(0, 0, 0, 0.12)",
          width: "100%",
        }}
      >
        <Typography
          variant="body2"
          component="div"
          sx={{ fontWeight: "bold", marginBottom: 1 }}
        >
          Enter Label Code:
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            label="Area"
            variant="outlined"
            size="small"
            value={area}
            onChange={(e) => setArea(e.target.value.toUpperCase())}
            onKeyDown={(e) => handleKeyPress(e, bayNoRef)}
            inputProps={{ maxLength: 1 }}
            inputRef={areaRef}
          />
          <Typography variant="h6" sx={{ alignSelf: "center" }}>
            -
          </Typography>
          <TextField
            label="Bay No"
            variant="outlined"
            size="small"
            value={bayNo}
            onChange={(e) => setBayNo(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, rackRef)}
            inputProps={{ maxLength: 2 }}
            inputRef={bayNoRef}
          />
          <Typography variant="h6" sx={{ alignSelf: "center" }}>
            -
          </Typography>
          <TextField
            label="Rack"
            variant="outlined"
            size="small"
            value={rack}
            onChange={(e) => setRack(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, shelfRef)}
            inputProps={{ maxLength: 2 }}
            inputRef={rackRef}
          />
          <Typography variant="h6" sx={{ alignSelf: "center" }}>
            -
          </Typography>
          <TextField
            label="Shelf"
            variant="outlined"
            size="small"
            value={shelf}
            onChange={(e) => setShelf(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleLabelCodeChange()
              }
            }}
            inputProps={{ maxLength: 2 }}
            inputRef={shelfRef}
          />
        </Box>
        {/* New Weight Input Field */}
        <Typography
          variant="body2"
          component="div"
          sx={{ fontWeight: "bold", padding: "1px 1px", marginTop: 1 }}
        >
          Enter Weight:
        </Typography>

        <TextField
          label="Weight"
          variant="outlined"
          size="small"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleLabelCodeChange()
            }
          }}
          inputRef={weightRef}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            size="small"
            sx={{ marginTop: 1, backgroundColor: "#5EC401" }}
            onClick={handleLabelCodeChange}
          >
            Update
          </Button>
        </div>
      </Box>
    </Card>
  )
}

export default LabelCodeCard

const styles = {
  priceContainer: {
    display: "flex",
    alignItems: "space-between",
    gap: "5px",
  },
  priceText: {
    fontWeight: "600",
    color: "rgba(55, 71, 79, 0.54);",
    textDecoration: "line-through",
    fontSize: "14px",
    fontFamily: "Poppins",
  },
  salePriceText: {
    color: "#F37A20",
    fontWeight: "600",
    fontSize: "20px",
    fontFamily: "Poppins",
  },
}
