import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const BatchDrawer = ({
  drawerOpen = true,
  batchData = localBatchDataDummy,
  // setBatchData,
  onClose = (localBatchData) => {},
}) => {
  const [localBatchData, setLocalBatchData] = useState([]);
  const [netScannedCount, setNetScannedCount] = useState(0);

  // Update localBatchData and netScannedCount when drawerOpen or batchData changes
  useEffect(() => {
    if (drawerOpen) {
      setLocalBatchData([...batchData]);
      const totalScanned = batchData.reduce(
        (total, item) => total + item.scanned_count,
        0
      );
      setNetScannedCount(totalScanned);
    }
  }, [drawerOpen, batchData]);

  const handleCountChange = (index, action) => {
    setLocalBatchData((prevData) => {
      const updatedData = [...prevData];
      const currentItem = updatedData[index];

      if (action === "increment") {
        const overallLimit = batchData.reduce(
          (total, item) => total + item.totalScannedCount,
          0
        );
        if (netScannedCount < overallLimit) {
          currentItem.scanned_count += 1;
        } else {
          alert("You have reached the maximum total scanned count.");
        }
      } else if (action === "decrement" && currentItem.scanned_count > 0) {
        currentItem.scanned_count -= 1;
      } else {
        alert("Scanned count cannot be less than 0.");
      }

      const updatedNetScannedCount = updatedData.reduce(
        (total, item) => total + item.scanned_count,
        0
      );
      setNetScannedCount(updatedNetScannedCount);

      return updatedData;
    });
  };

  const handleConfirm = () => {
    // Update batchData with changes from localBatchData
    // if (setBatchData)
    //   setBatchData((prevBatchData) => {
    //     const mergedData = [...prevBatchData];

    //     localBatchData.forEach((localItem) => {
    //       const existingIndex = mergedData.findIndex(
    //         (item) =>
    //           item.productId === localItem.productId &&
    //           item.barcode === localItem.barcode
    //       );

    //       if (existingIndex !== -1) {
    //         mergedData[existingIndex].scanned_count = localItem.scanned_count;
    //       } else {
    //         mergedData.push(localItem);
    //       }
    //     });

    //     return mergedData;
    //   });

    onClose(localBatchData); // Close the drawer
  };

  return (
    <Drawer
      anchor="bottom"
      open={drawerOpen}
      onClose={() => onClose(localBatchData)}
      sx={{
        "& .MuiDrawer-paper": {
          width: "100%",
          maxWidth: "450px",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
          <IconButton
            onClick={() => onClose(localBatchData)}
            sx={{ color: "gray" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography
          variant="h6"
          component="h2"
          sx={{ fontWeight: "600", textAlign: "center" }}
        >
          Batch Details
        </Typography>

        <TableContainer sx={{ maxHeight: "300px", overflow: "auto" }}>
          <Table sx={{ minWidth: 300 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "gray" }}>
                  Barcode
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", color: "gray" }}
                >
                  Expiry Date
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", color: "gray" }}
                >
                  Scanned Count
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {localBatchData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.barcode}</TableCell>
                  <TableCell align="center">
                    {item.expiry
                      ? new Date(item.expiry).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => handleCountChange(index, "decrement")}
                        sx={{
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          minWidth: "32px",
                          padding: "0",
                          "&:hover": { backgroundColor: "#f0f0f0" },
                        }}
                      >
                        -
                      </Button>
                      <Typography>{item.scanned_count}</Typography>
                      <Button
                        variant="outlined"
                        onClick={() => handleCountChange(index, "increment")}
                        sx={{
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          minWidth: "32px",
                          padding: "0",
                          "&:hover": { backgroundColor: "#f0f0f0" },
                        }}
                      >
                        +
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "16px" }}
        >
          <Button
            variant="contained"
            onClick={handleConfirm}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              padding: "8px 20px",
              fontWeight: "500",
            }}
          >
            Confirm
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default BatchDrawer;

const localBatchDataDummy = [
  {
    productId: "p1",
    barcode: "BATCH001",
    expiry: "2025-06-30",
    scanned_count: 10,
  },
  {
    productId: "p2",
    barcode: "BATCH002",
    expiry: "2025-07-15",
    scanned_count: 20,
  },
  {
    productId: "p3",
    barcode: "BATCH003",
    expiry: "2025-08-01",
    scanned_count: 5,
  },
  {
    productId: "p4",
    barcode: "BATCH004",
    expiry: "2025-09-10",
    scanned_count: 0,
  },
  {
    productId: "p5",
    barcode: "BATCH005",
    expiry: "2025-10-01",
    scanned_count: 30,
  },
];
