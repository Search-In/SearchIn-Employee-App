// api.js
import axios from "axios";

// const server = "https://estore.searchintech.in/api/v1";
const server = "http://localhost:8000/api/v1";

// Helper function to get Authorization header
const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

const getEmployeeID = () => JSON.parse(localStorage.getItem("employee"))?._id;
const getVendorID = () => JSON.parse(localStorage.getItem("employee"))?.vendor;

/**
 * @typedef {Object} ScannedBarcodeEntry
 * @property {string} barcode - The barcode of the product that was scanned.
 * @property {string} vendor_product - The vendor product associated with the barcode.
 * @property {number} scanned_count - The number of times the product has been scanned.
 */

const employeeOrderToBarcodeScannedCount = (employee_order) =>
  employee_order.batch_scanned_count.map((item) => {
    const vendorProductBatch = item.vendor_product_batch;

    return {
      barcode: vendorProductBatch.barcode || null, // Get barcode from the populated VendorProductBatch
      vendor_product: vendorProductBatch.vendor_product || null, // Get vendor product
      scanned_count: item.scannedCount || 0, // Scanned count
    };
  });

export const api = {
  products: {
    getByBarcode: async (barcode) => {
      try {
        const result = await axios.get(
          `${server}/vendor/products/barcode/${barcode}`,
          {
            params: { vendor: getVendorID() },
            headers: getAuthHeader(),
          }
        );
        return result?.data || [];
      } catch (error) {
        console.error("Error fetching product by barcode:", error);
        throw error;
      }
    },

    updateLabelCode: async (productId, { labelcode, weight }) => {
      try {
        const result = await axios.put(
          `${server}/products/update/${productId}`,
          { labelcode, weight },
          { headers: getAuthHeader() }
        );
        return result.data;
      } catch (error) {
        console.error("Error updating label code:", error);
        throw error;
      }
    },
  },

  order: {
    getOrders: async () => {
      try {
        const result = await axios.get(
          `${server}/employee-orders/${getEmployeeID()}`,
          { headers: getAuthHeader() }
        );
        return result.data;
      } catch (error) {
        console.error(error);
        return [];
      }
    },

    getOrdersByLabelcode: async (vendor_order) => {
      try {
        const result = await axios.get(
          `${server}/employee-labelcode/${vendor_order}`,
          {
            headers: getAuthHeader(),
          }
        );
        if (!result?.data) return {};
        const { vendor_order: db_vendor_order, employee_order } = result?.data;
        return {
          db_vendor_order,
          employee_order,
          barcodeScans: employeeOrderToBarcodeScannedCount(employee_order),
        };
      } catch (error) {
        console.error("Error fetching order data:", error);
        throw error;
      }
    },

    updateEndScanTime: async (vendor_order) => {
      try {
        const result = await axios.patch(
          `${server}/update-employee-order/employeeOrder`,
          { endScanTime: new Date() },
          {
            headers: getAuthHeader(),
            params: { employeeId: getEmployeeID(), vendor_order },
          }
        );
        return result.data;
      } catch (error) {
        console.error("Error updating end scan time:", error);
        throw error;
      }
    },

    updateScanTime: async ({ vendor_order }) => {
      try {
        const result = await axios.patch(
          `${server}/update-employee-order/employeeOrder`,
          { startScanTime: new Date() },
          {
            headers: getAuthHeader(),
            params: { employeeId: getEmployeeID(), vendor_order },
          }
        );
        return result.data;
      } catch (error) {
        console.error("Error updating start scan time:", error.response);
        // throw error;
      }
    },

    updateScannedCount: async ({
      vendor_order,
      // vendor_product,
      scannedCount,
      isScanned,
      barcode,
    }) => {
      try {
        const result = await axios.patch(
          `${server}/orders/update-scannedCount`,
          {
            scannedCount,
            isScanned,
            barcode,
          },
          {
            headers: getAuthHeader(),
            params: {
              vendor_order,
              //  vendor_product
            },
          }
        );
        return result.data;
      } catch (error) {
        console.error("Error updating scanned count:", error);
        throw error;
      }
    },
  },
};
