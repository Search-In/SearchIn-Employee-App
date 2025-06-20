import { useState, useEffect } from "react";

const VendorProductBatchModal = ({ onClose = () => {}, defaults = {} }) => {
  const [formData, setFormData] = useState({
    vendor_product: "",
    vendor: "",
    barcode: "",
    mrp: "",
    price: "",
    stock: "",
    mfd: "",
    expiry: "",
    batch_no: "",
    weight: "",
  });

  const fields = [
    // {
    //   label: "Vendor Product",
    //   name: "vendor_product",
    //   type: "text",
    //   required: true,
    // },
    // { label: "Vendor", name: "vendor", type: "text", required: true },
    { label: "Barcode", name: "barcode", type: "text", required: true },
    { label: "MRP", name: "mrp", type: "number", required: true, min: 0 },
    { label: "Price", name: "price", type: "number", required: true, min: 0 },
    { label: "Stock", name: "stock", type: "number", required: true, min: 0 },
    { label: "Batch No", name: "batch_no", type: "text" },
    { label: "Manufacturing Date", name: "mfd", type: "date" },
    { label: "Expiry Date", name: "expiry", type: "date" },

    { label: "Weight (in grams)", name: "weight", type: "number" },
  ];

  useEffect(() => {
    // Spread defaults into formData when the modal opens
    setFormData((prevData) => ({ ...prevData, ...defaults }));
  }, [defaults]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
    onClose(formData); // Close the modal after submission
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 opacity-50 text-red-600"
        onClick={onClose}
      >
        X
      </div>
      <div className="bg-white rounded-lg shadow-lg p-4 pb-1 z-10 w-96">
        <h2 className="text-lg font-semibold mb-4">Create New Product Batch</h2>
        <form onSubmit={handleSubmit}>
          <div className="max-h-[80vh] overflow-y-auto">
            {fields.map((field) => (
              <div className="mb-4" key={field.name}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  min={field.min}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end my-2">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProductBatchModal;
