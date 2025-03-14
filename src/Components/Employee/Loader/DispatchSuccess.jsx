import { useLocation, useNavigate } from "react-router-dom"
import "./style.css"

const DispatchSuccessAnimation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { createOrder } = location.state || {}

  const handleNavigate = () => {
    console.log("create Order ", createOrder)
    if (createOrder) {
      navigate("/employee-home")
    } else {
      navigate("/employee-orders")
    }
  }

  return (
    <div className="container">
      <div className="icon-container">
        <span className="checkmark">✔</span>
      </div>
      <div className="title">
        <h1>Dispatch Successful!</h1>
      </div>
      <div className="message">
        <p>You Dispatch the Order Succesfully!</p>
      </div>
      <button className="print-button" onClick={handleNavigate}>
        View Orders
      </button>
    </div>
  )
}

export default DispatchSuccessAnimation
