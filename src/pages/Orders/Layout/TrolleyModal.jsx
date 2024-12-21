import React from "react";
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
};

const buttonStyle = {
  margin: "0 10px",
  padding: "10px 15px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
};

const TrolleyModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div className="flex flex-col justify-between bg-white p-5 shadow-lg text-center rounded-lg">
        <h2 className="my-4 text-xl font-semibold">
          Do you have a Search In Trolley?
        </h2>
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
  );
};

export default TrolleyModal;
