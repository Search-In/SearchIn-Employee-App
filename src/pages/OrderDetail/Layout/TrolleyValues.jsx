import React from "react"
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates"
import { Fab } from "@mui/material"
import { useMqtt } from "../../../context/MqttContext"

const TrolleyValues = () => {
  const { weightComparisonResult } = useMqtt()

  // Extracting physical weight and alert color from the received data
  const physicalWeight = weightComparisonResult?.trolley?.physicalWeight || 0
  const alertLight = weightComparisonResult?.alertLight || "green"

  // Determine weight display and unit
  const displayWeight =
    physicalWeight > 1000 ? (physicalWeight / 1000).toFixed(2) : physicalWeight
  const weightUnit = physicalWeight > 1000 ? "kg" : "g"

  return (
    <>
      {/* <Fab
        color={"primary"}
        style={{
          fontSize: "5px",
          position: "fixed",
          top: 100,
          left: 16,
          backgroundColor: alertLight, // Use alertLight for color
        }}
      >
        <TipsAndUpdatesIcon />
      </Fab> */}
      <Fab
        color={"primary"}
        style={{
          position: "fixed",
          top: 110,
          left: 16,
          backgroundColor: alertLight, // Use alertLight for color
          display: "flex",
          alignItems: "center", // Center the content vertically
          justifyContent: "center", // Center the content horizontally
          minWidth: "60px", // Minimum width to make it look better
          height: "60px", // Ensure height is consistent
        }}
      >
        {/* Displaying physical weight with appropriate unit */}
        <span style={{ color: "white", fontWeight: "bold", fontSize: "16px" }}>
          {displayWeight} {weightUnit}
        </span>
      </Fab>
    </>
  )
}

export default TrolleyValues
