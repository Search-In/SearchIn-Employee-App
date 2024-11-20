import PowerOffIcon from "@mui/icons-material/PowerOff" // Disconnection icon
import { Box } from "@mui/material"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import Typography from "@mui/material/Typography"
import PropTypes from "prop-types"
import { toast } from "react-toastify"

function DisconnectionDialog(props) {
  const { onClose, onDisconnect, open } = props

  const handleClose = () => {
    onClose()
  }

  const handleDisconnect = () => {
    onDisconnect()
    onClose()
    // const virtualcartweight = localStorage.getItem("virtualcartweight")
    // if (virtualcartweight == 0) {
    //   onDisconnect()
    //   onClose()
    // } else {
    //   toast.error("Please Empty Your Cart First!")
    // }
  }

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6" component="div">
          Confirm Disconnection
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" alignItems="center" mb={2}>
          <PowerOffIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
          <Typography variant="body1">
            Are you sure you want to disconnect from the trolley? Click the
            button below to confirm the disconnection.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleDisconnect}
          color="primary"
          variant="contained"
          startIcon={<PowerOffIcon />}
          sx={{
            borderRadius: 1,
            bgcolor: "primary.light",
            "&:hover": { bgcolor: "primary.main" },
          }}
        >
          Disconnect
        </Button>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

DisconnectionDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
}

export default DisconnectionDialog
