import React from "react"
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}

const contentStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "5px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
}

const buttonStyle = {
  margin: "0 10px",
  padding: "10px 15px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
}

const buttonHoverStyle = {
  ...buttonStyle,
  backgroundColor: "#0056b3",
}

const TrolleyModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div style={overlayStyle}>
      <div style={contentStyle}>
        <h2>Do you have a Search In Trolley?</h2>
        <div>
          <button
            style={buttonStyle}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
            onClick={onConfirm}
          >
            Yes
          </button>
          <button style={buttonStyle} onClick={onClose}>
            No
          </button>
        </div>
      </div>
    </div>
  )
}

export default TrolleyModal
