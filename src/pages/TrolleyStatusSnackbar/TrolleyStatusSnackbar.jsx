import { Wifi, WifiOff } from "@mui/icons-material"
import { Alert, Fab, Snackbar } from "@mui/material"
import { useEffect, useState } from "react"
import { useMqtt } from "../../context/MqttContext"
import DisconnectionDialog from "./Layout/DisconnectDialogue"

const TrolleyStatusFab = () => {
  const {
    disconnect,
    weightComparisonResult,
    isConnected,
    connect,
    publish,
    setIsSessionEnded,
  } = useMqtt()

  const [open, setOpen] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("info") // 'info' | 'warning' | 'error' | 'success'
  const handleSnackbarClose = () => {
    setOpenSnackbar(false)
  }

  const vibrateDevice = (pattern) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }

  const showWarningSnackbar = () => {
    setSnackbarMessage("Product added without Scan")
    setSnackbarSeverity("warning")
    setOpenSnackbar(true)
    vibrateDevice([200, 100, 200])
  }

  const showErrorSnackbar = () => {
    setSnackbarMessage("Product not added to Physical cart")
    setSnackbarSeverity("error")
    setOpenSnackbar(true)
  }

  const handleOpen = () => {
    if (isConnected) {
      setOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleDisconnect = () => {
    if (isConnected) {
      localStorage.setItem("virtualcartweight", 0)
      const session = localStorage.getItem("session")
      publish("guestUser/endSession", { sessionId: session })
      setIsSessionEnded(true)
      disconnect()
      localStorage.removeItem("session")
      localStorage.removeItem("trolley")
    }
  }

  useEffect(() => {
    if (weightComparisonResult?.alertLight === "red") {
      showWarningSnackbar()
    }
  }, [weightComparisonResult])
  return (
    <>
      <Fab
        color={isConnected ? "primary" : "secondary"}
        aria-label={isConnected ? "Trolley Connected" : "Trolley Disconnected"}
        style={{
          position: "fixed",
          top: 45,
          left: 16,
          backgroundColor: isConnected ? "orange" : "red",
        }}
        onClick={handleOpen}
      >
        {isConnected ? <Wifi /> : <WifiOff />}
      </Fab>
      <DisconnectionDialog
        open={open}
        onClose={handleClose}
        onDisconnect={handleDisconnect}
      />
      <Snackbar
        open={openSnackbar}
        autoHideDuration={8000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default TrolleyStatusFab
