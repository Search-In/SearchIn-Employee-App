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
import { toast } from "react-toastify";
import { Fragment } from "react";
import { Backdrop, CircularProgress } from "@mui/material";

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

const LabelCodeCard = ({ barcode = "", onRemove }) => {
  const [vendor_product, setProductInfo] = useState({});
  // const vendor_product = productInfo ?? {};
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    price: "",
    stock: 50,
    threshold_stock: 2,
    buying_limit: 50,
    status: "available",
    ...vendor_product,
  });

  const [labelArea = "", labelBay = "", labelRack = "", labelShelf = ""] =
    vendor_product?.vendor_product?.labelcode?.split("-") || [];

  const [area, setArea] = useState(labelArea || "");
  const [bayNo, setBay] = useState(labelBay || "");
  const [rack, setRack] = useState(labelRack || "");
  const [shelf, setShelf] = useState(labelShelf || "");

  const areaRef = useRef(null);
  const bayNoRef = useRef(null);
  const rackRef = useRef(null);
  const shelfRef = useRef(null);
  const weightRef = useRef(null);

  useEffect(() => {
    const [area = "", bay = "", rack = "", shelf = ""] =
      formData?.vendor_product?.labelcode?.split("-") || [];
    setArea(area);
    setBay(bay);
    setRack(rack);
    setShelf(shelf);
  }, [formData.labelcode]);

  const [batches, setBatches] = useState([{}]);

  useEffect(() => {
    if (batches.length == 1 && !batches._id && vendor_product._id) {
      setBatches([
        {
          vendor_product: vendor_product._id,
          barcode,
          mrp: 0,
          price: 0,
          stock: 0,
          threshold_stock: 2,
          buying_limit: 50,
        },
      ]);
    }
  }, [vendor_product]);

  const [activeBatchIndex, setActiveBatchIndex] = useState(0); // Maintain active batch index
  const activeBatch = batches[activeBatchIndex]; // Get active batch using the index

  const [showSearchSection, setShowSearchSection] = useState(false);

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
    try {
      setLoading(true);
      const labelcode = `${area || ""}-${bayNo || ""}-${rack || ""}-${
        shelf || ""
      }`;
      await onLabelCodeChange(vendor_product?.vendor_product?._id, {
        imageUrl: formData?.imageUrl,
        labelcode,
        weight,
        threshold_stock: formData.threshold_stock,
        buying_limit: formData.buying_limit,
        status: formData.status,
      });

      toast("Product updated!");

      const batchOp = activeBatch?._id
        ? api.batch.updateById(activeBatch?._id, activeBatch)
        : api.batch.create(activeBatch);

      const newBatch = await batchOp;

      toast("Batch updated!");

      const updatedBatches = [...batches];
      updatedBatches[activeBatchIndex] = newBatch;
      onRemove();
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    // if (!weight) {
    //   alert("Please enter the weight before closing the card."); // Show alert or error message
    //   return;
    // }
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

  // New function to handle the product scan when no vendor_order exists
  const handleProductScan = async (barcode) => {
    try {
      const { vendor_product, batches: db_batches } =
        await api.products.getByBarcode(barcode);
      if (vendor_product._id) {
        setProductInfo({ vendor_product, barcode, batches });
        setFormData((prevData) => ({ ...prevData, vendor_product }));
        setBatches(db_batches);
      } else {
        // showSnackbar("Product is Not in List!", "warning");
        onRemove();
      }
    } catch (error) {
      // console.log(error);
      setShowSearchSection(true);
    }
  };

  useEffect(() => {
    handleProductScan(barcode);
  }, [barcode]);

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Card className="relative flex flex-col shadow-md px-1 pt-3 overflow-y-auto gap-2">
        <div className="flex gap-3">
          <ArrowBack
            onClick={handleRemove}
            // className="mx-2"
            className="top-2 left-2 z-[10000]"
          />
        </div>
        {!vendor_product && !showSearchSection ? (
          <div className="text-center">Loading...</div>
        ) : showSearchSection ? (
          <SearchSection
            setProductInfo={setProductInfo}
            setShowSearchSection={setShowSearchSection}
          />
        ) : (
          <div>
            <div className="">
              <ImageUpload
                setImageFile={(image) =>
                  setFormData({ ...formData, imageUrl: [image] })
                }
                imagesSave={formData?.vendor_product?.imageUrl?.[0] || ""}
                isEdit={true}
              />
            </div>
            {vendor_product._id && (
              <p className="text-xl font-bold text-center capitalize">
                {vendor_product?.product?.original_name ||
                  [
                    vendor_product?.product?.brand,
                    vendor_product?.product?.name,
                    vendor_product?.product?.quantity,
                  ].join(" ")}
              </p>
            )}
            <div className="font-bold">Barcode: {barcode}</div>

            {/* {!activeBatch?._id ? (
            <p className="font-bold">Enter new batch details:-</p>
          ) : (
            <div className="flex justify-between items-center">
              <p className="font-bold">
                Select batch: ({batches?.length ?? 0})
              </p>{" "}
              <button
                className={`border shadow-md p-1 ${
                  activeBatch?._id ? "text-orange-500" : "text-gray-500"
                } font-bold`}
                disabled={!activeBatch?._id}
                onClick={() => {
                  setBatches([
                    {
                      vendor_product: vendor_product._id,
                      barcode,
                      mrp: 0,
                      price: 0,
                      stock: 0,
                      threshold_stock: 2,
                      buying_limit: 50,
                    },
                    ...batches,
                  ]);
                  setTimeout(() => setActiveBatchIndex(0), 100);
                }}
              >
                Create batch +
              </button>
            </div>
          )} */}
            {/* <div className="mx-[1vw]">
            <Carousel
              slides={slides}
              onSlideChange={(index) => setActiveBatchIndex(index)} // Update active batch index
            />
          </div> */}

            {/* <div className="flex gap-3 my-1 *:items-center justify-between">
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
          </div> */}

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
                {[
                  {
                    placeholder: "Area",
                    value: area,
                    setValue: setArea,
                    maxLength: 1,
                    ref: areaRef,
                    nextRef: bayNoRef,
                  },
                  {
                    placeholder: "Bay No",
                    value: bayNo,
                    setValue: setBay,
                    maxLength: 2,
                    ref: bayNoRef,
                    nextRef: rackRef,
                  },
                  {
                    placeholder: "Rack",
                    value: rack,
                    setValue: setRack,
                    maxLength: 2,
                    ref: rackRef,
                    nextRef: shelfRef,
                  },
                  {
                    placeholder: "Shelf",
                    value: shelf,
                    setValue: setShelf,
                    maxLength: 2,
                    ref: shelfRef,
                    onEnter: handleLabelCodeChange,
                  },
                ].map(
                  (
                    {
                      placeholder,
                      value,
                      setValue,
                      maxLength,
                      ref,
                      nextRef,
                      onEnter,
                    },
                    index
                  ) => (
                    <Fragment key={placeholder}>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-md p-1 w-full"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => setValue(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (onEnter && e.key === "Enter") {
                            e.preventDefault();
                            onEnter();
                          } else {
                            handleKeyPress(e, nextRef);
                          }
                        }}
                        maxLength={maxLength}
                        ref={ref}
                      />
                      {index < 3 && (
                        <div className="self-center text-lg">-</div>
                      )}{" "}
                      {/* Add separator only between inputs */}
                    </Fragment>
                  )
                )}
              </div>

              <div className="flex gap-4 font-bold my-4">
                Published:
                <div className="flex items-center">
                  <div
                    // onClick={toggleSwitch}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        status:
                          formData.status === "available"
                            ? "discontinued"
                            : "available",
                      })
                    }
                    className={`relative inline-flex items-center cursor-pointer w-12 h-6 rounded-full transition-colors duration-200 ${
                      formData.status === "available"
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 transform ${
                        formData.status === "available"
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center mt-3">
                <button
                  className="bg-orange-600 text-white rounded-md px-9 py-2"
                  onClick={handleLabelCodeChange}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default LabelCodeCard;

function SearchSection({ setProductInfo, setShowSearchSection }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async (query = "") => {
      if (!query) return;

      setLoading(true); // Set loading to true before fetching
      try {
        const data = await api.products.search(query);
        setProducts(data.results);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchProducts(); // Fetch initial products

    // Fetch products based on search term when it changes
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) fetchProducts(searchTerm);
    }, 300); // Debounce for 300ms

    return () => clearTimeout(delayDebounceFn); // Cleanup timeout on unmount
  }, [searchTerm]);

  async function onSelectProduct(product) {
    try {
      const data = await api.products.getByID(product.vendor_product._id);
      setProductInfo(data);
      setShowSearchSection(false);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  return (
    <div className="container mx-auto p-2 max-h-[80vh]">
      <h1 className="text-2xl font-bold mb-4">Product Search</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for products..."
          className="border border-gray-300 rounded-lg p-2 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {!searchTerm ? null : loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[80%] overflow-y-auto">
          {products.map((product) => {
            // Prioritize imageUrl from the outer document
            const imageUrl =
              (Array.isArray(product.vendor_product?.product?.imageUrl) &&
                product.vendor_product?.product?.imageUrl?.[0]) ||
              product.vendor_product?.product?.imageUrl ||
              product.imageUrl;

            const name = [product.brand, product.name, product.quantity].join(
              " "
            );

            return (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md p-4"
                onClick={() => onSelectProduct(product)}
              >
                <p className="">SKU: {product.vendor_product?.vendor_sku}</p>
                <div className="flex gap-4 items-center">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="size-12 object-cover rounded-md mb-2"
                  />
                  <h2 className="text-lg font-semibold capitalize">{name}</h2>
                </div>

                <div className="flex gap-4 font-bold ">
                  <p className="">MRP: Rs.{product.vendor_product?.mrpPrice}</p>
                  <p className="">Price: Rs.{product.price}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
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
