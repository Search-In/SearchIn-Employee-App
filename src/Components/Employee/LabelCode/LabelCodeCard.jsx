// import CloseIcon from "@mui/icons-material/Close";
// import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
// import CardContent from "@mui/material/CardContent";
// import CardMedia from "@mui/material/CardMedia";
// import IconButton from "@mui/material/IconButton";
// import TextField from "@mui/material/TextField";
// import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import { useRef, useState } from "react";
import ImageUpload from "../../ImageUpload";
import { ArrowBack } from "@mui/icons-material";
import { api } from "../../../api/api";
import Carousel from "../../Carousel";

const fields = [
  {
    name: "mrpPrice",
    label: "MRP",
    // defaultValue: importProduct?.mrpPrice,
    // disabled: true,
  },
  { name: "price", label: "Price" },
  { name: "stock", label: "Stock" },
  { name: "vendor_sku", label: "SKU", type: "text", disabled: true },
  {
    name: "threshold_stock",
    label: "Threshold Stock",
  },
  {
    name: "buying_limit",
    label: "Buying Limit",
  },
];

const onLabelCodeChange = async (productId, update) => {
  try {
    await api.products.updateLabelCode(productId, update);
  } catch (error) {
    console.log("Error updating label code:", error);
  }
};

const productBatches = [
  {
    product: "Product 1",
    ean_code: "1234567890123",
    mrp: 100,
    mfd: "2023-01-01",
    expiry: "2024-01-01",
  },
  {
    product: "Product 2",
    ean_code: "1234567890124",
    mrp: 150,
    mfd: "2023-02-01",
    expiry: "2024-02-01",
  },
  {
    product: "Product 3",
    ean_code: "1234567890125",
    mrp: 200,
    mfd: "2023-03-01",
    expiry: "2024-03-01",
  },
];

const toSlides = (batches = productBatches, onDateChange) =>
  batches.map((batch, index) => (
    <div key={index} className="flex gap-2 text-center space-x-3 px-2">
      {/* Uncomment if you want to display MRP and Price */}
      {/* <div>
        <p>MRP:</p>
        <p className="block font-bold text-sm">₹{batch.mrp}</p>
      </div>
      <div>
        <p>Price:</p>
        <p className="block font-bold text-sm">₹{batch.price}</p>
      </div> */}
      <div>
        <p>MFD:</p>
        <input
          type="date"
          value={
            batch.mfd ? new Date(batch.mfd).toISOString().split("T")[0] : ""
          }
          onChange={(e) => onDateChange("mfd", e.target.value)}
          className="block font-bold"
        />
      </div>
      <div>
        <p>EXP:</p>
        <input
          type="date"
          value={
            batch.expiry
              ? new Date(batch.expiry).toISOString().split("T")[0]
              : ""
          }
          onChange={(e) => onDateChange("expiry", e.target.value)}
          className="block font-bold"
        />
      </div>
    </div>
  ));

const LabelCodeCard = ({
  product: { vendor_product, batches: db_batches, barcode = "" },
  onRemove,
}) => {
  const [labelArea = "", labelBay = "", labelRack = "", labelShelf = ""] =
    vendor_product?.labelcode?.split("-") || [];
  const [area, setArea] = useState(labelArea || "");
  const [bayNo, setBayNo] = useState(labelBay || "");
  const [rack, setRack] = useState(labelRack || "");
  const [shelf, setShelf] = useState(labelShelf || "");
  // const [weight, setWeight] = useState(vendor_product?.weight || ""); // New state for weight

  const areaRef = useRef(null);
  const bayNoRef = useRef(null);
  const rackRef = useRef(null);
  const shelfRef = useRef(null);
  const weightRef = useRef(null);

  const [formData, setFormData] = useState({
    price: "",
    stock: 50,
    threshold_stock: 2,
    buying_limit: 50,
    ...vendor_product,
  });

  const [batches, setBatches] = useState(db_batches);

  const [activeBatchIndex, setActiveBatchIndex] = useState(0); // Maintain active batch index
  const activeBatch = batches[activeBatchIndex]; // Get active batch using the index

  const weight = activeBatch?.weight ?? 0;

  const handleBatchUpdate = (field, value) => {
    const updatedBatches = [...batches];
    updatedBatches[activeBatchIndex] = {
      ...updatedBatches[activeBatchIndex],
      [field]: value,
    };
    setBatches(updatedBatches);
  };

  const slides = toSlides(batches, handleBatchUpdate);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    setFormData(vendor_product);
  }, [vendor_product]);

  const handleKeyPress = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default form submission behavior
      nextRef.current?.focus(); // Focus on the next input field
    }
  };

  const handleLabelCodeChange = async () => {
    const labelCode = `${area}-${bayNo}-${rack}-${shelf}`;
    await onLabelCodeChange(vendor_product._id, {
      imageUrl: formData?.imageUrl,
      labelCode,
      weight,
      threshold_stock: formData.threshold_stock,
      buying_limit: formData.buying_limit,
    });

    const batchOp = activeBatch?._id
      ? api.batch.updateById(activeBatch?._id, activeBatch)
      : api.batch.create(activeBatch);

    const newBatch = await batchOp;

    const updatedBatches = [...batches];
    updatedBatches[activeBatchIndex] = newBatch;
    // onRemove();
  };

  const handleRemove = () => {
    if (!weight) {
      alert("Please enter the weight before closing the card."); // Show alert or error message
      return;
    }
    onRemove();
  };

  useEffect(() => {
    console.log({ activeBatch });
    if (activeBatch)
      setFormData({
        ...formData,
        mrpPrice: activeBatch.mrp,
        price: activeBatch.price,
        stock: activeBatch.stock,
      });
  }, [activeBatch]);

  return (
    <Card className="relative flex flex-col shadow-md px-1 pt-3 overflow-y-auto gap-2">
      <div className="flex gap-3">
        <ArrowBack
          onClick={handleRemove}
          // className="mx-2"
          className="top-2 left-2 z-[10000]"
        />
        <p>Barcode - {barcode}</p>
      </div>

      <div className="flex-1 min-h-16">
        <ImageUpload
          setImageFile={(image) =>
            setFormData({ ...formData, imageUrl: [image] })
          }
          imagesSave={formData?.imageUrl?.[0] || ""}
          isEdit={true}
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="font-bold">Select batch: ({batches?.length ?? 0})</p>
        <button
          className="border shadow-md p-1 text-orange-500 font-bold"
          onClick={() => {
            setBatches([
              {
                vendor_product: vendor_product._id,
                barcode,
                mrp: vendor_product.mrpPrice,
                price: vendor_product.price,
                stock: activeBatch.stock,
              },
              ...batches,
            ]);
            setActiveBatchIndex(0);
          }}
        >
          Create batch +
        </button>
      </div>
      <div className="-mx-1">
        <Carousel
          slides={slides}
          onSlideChange={(index) => setActiveBatchIndex(index)} // Update active batch index
        />
      </div>

      <div className="flex gap-3 my-1 *:items-center justify-between">
        <div className="flex gap-1">
          <div className="font-bold">Batch No:</div>
          <input
            type="text"
            className="border border-gray-300 rounded-md p-1 w-16"
            placeholder="0"
            value={activeBatch.batch_no ?? 0}
            onChange={(e) => handleBatchUpdate("batch_no", e.target.value)}
            required
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLabelCodeChange();
              }
            }}
            ref={weightRef}
          />
        </div>
        <div className="flex gap-1">
          <div className="font-bold">Weight:</div>
          <input
            type="number"
            className="border border-gray-300 rounded-md p-1 w-24"
            placeholder="Weight"
            value={weight}
            onChange={(e) => handleBatchUpdate("weight", e.target.value)}
            required
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLabelCodeChange();
              }
            }}
            ref={weightRef}
          />
          <span className="font-bold">gm</span>
        </div>
      </div>

      <div className="mx-auto p-2 pt-1 border rounded max-w-2xl grid grid-cols-3 gap-3 ">
        {fields.map(
          (
            {
              name,
              label,
              disabled = false,
              defaultValue = 0,
              min,
              type = "number",
            },
            index
          ) => (
            <div className="flex flex-col justify-between" key={index}>
              <label className="block font-bold text-sm" htmlFor={name}>
                {label}
              </label>
              <input
                type={type}
                name={name}
                id={name}
                value={formData[name] ?? defaultValue}
                onChange={handleChange}
                required
                min={min || 1}
                className={`block w-full border-gray-300 rounded-md focus:ring-0 focus:border-blue-500 bg-slate-100 p-2 ${
                  disabled ? "text-gray-900" : "font-semibold"
                }`}
                disabled={disabled}
              />
            </div>
          )
        )}
      </div>

      <div className="p-2 border-t border-gray-300 w-full">
        <div className="font-bold mb-2">Label Code:</div>
        <div className="flex gap-2">
          <input
            type="text"
            className="border border-gray-300 rounded-md p-1 w-full"
            placeholder="Area"
            value={area}
            onChange={(e) => setArea(e.target.value.toUpperCase())}
            onKeyDown={(e) => handleKeyPress(e, bayNoRef)}
            maxLength={1}
            ref={areaRef}
          />
          <div className="self-center text-lg">-</div>
          <input
            type="text"
            className="border border-gray-300 rounded-md p-1 w-full"
            placeholder="Bay No"
            value={bayNo}
            onChange={(e) => setBayNo(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, rackRef)}
            maxLength={2}
            ref={bayNoRef}
          />
          <div className="self-center text-lg">-</div>
          <input
            type="text"
            className="border border-gray-300 rounded-md p-1 w-full"
            placeholder="Rack"
            value={rack}
            onChange={(e) => setRack(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, shelfRef)}
            maxLength={2}
            ref={rackRef}
          />
          <div className="self-center text-lg">-</div>
          <input
            type="text"
            className="border border-gray-300 rounded-md p-1 w-full"
            placeholder="Shelf"
            value={shelf}
            onChange={(e) => setShelf(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLabelCodeChange();
              }
            }}
            maxLength={2}
            ref={shelfRef}
          />
        </div>

        <div className="flex items-center justify-center mt-3">
          <button
            className="bg-orange-600 text-white rounded-md px-4 py-1"
            onClick={handleLabelCodeChange}
          >
            Update
          </button>
        </div>
      </div>
    </Card>
  );
};

export default LabelCodeCard;

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
};
{
  /* <Box sx={{ display: "flex", alignItems: "center" }}>
        <CardMedia
          component="img"
          sx={{ width: 100, height: 100 }}
          image={vendor_product?.product?.imageUrl}
          alt={vendor_product?.name}
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
                {vendor_product?.name}
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
              {vendor_product?.mrpPrice && (
                <Typography sx={styles.priceText}>
                  ₹{vendor_product?.mrpPrice?.toFixed(2)}
                </Typography>
              )}
              <Typography sx={styles.salePriceText}>
                ₹{vendor_product?.price?.toFixed(2)}
              </Typography>
            </div>
            <Typography>BarCode-{vendor_product?.barcode}</Typography>
          </CardContent>
        </Box>
      </Box> */
}
