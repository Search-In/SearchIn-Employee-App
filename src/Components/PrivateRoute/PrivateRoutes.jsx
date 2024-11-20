import { Navigate } from "react-router-dom"

function isMobileBrowser() {
  console.log(navigator.userAgent, navigator.vendor, window.opera)
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  return (
    true ||
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    )
  )
}

const PrivateEmployeeRoute = ({ children }) => {
  // const navigate = useNavigate()
  console.log("privatemp")

  return localStorage.getItem("employee") &&
    !localStorage.getItem("adminuser") ? (
    children
  ) : (
    <Navigate to="/employee-login" />
  )
}

export default PrivateEmployeeRoute
