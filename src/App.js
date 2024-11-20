import EmployeeLogin from "./pages/EmployeeLogin/EmployeeLogin"
import EmployeeHome from "./pages/Home/EmployeeHome"
import EmployeeOrder from "./pages/OrderDetail/EmployeeOrder"
import EmployeeOrders from "./pages/Orders/EmployeeOrders"
import EmployeeDispatch from "./pages/Dispatch/EmployeeDispatch"
import DispatchSuccessAnimation from "./Components/Employee/Loader/DispatchSuccess"
import EmployeeNavbar from "./Components/Employee/EmployeeNavbar/EmployeeNavbar"
import PrivateEmployeeRoute from "./Components/PrivateRoute/PrivateRoutes"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import TrolleyLink from "./pages/TrolleyLInk/TrolleyLink"

function App() {
  const location = useLocation()
  const EmployeeRoutes = ["/employee-home", "/employee-orders"]
  const isEmployeeRoute = EmployeeRoutes.some((route) =>
    location.pathname.startsWith(route)
  )

  return (
    <>
      {isEmployeeRoute && <EmployeeNavbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/employee-login" />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route
          path="/employee-home"
          element={
            <PrivateEmployeeRoute>
              <EmployeeHome />
            </PrivateEmployeeRoute>
          }
        />
        <Route
          path="/employee-order"
          element={
            <PrivateEmployeeRoute>
              <EmployeeOrder />
            </PrivateEmployeeRoute>
          }
        />
        <Route
          path="/employee-orders"
          element={
            <PrivateEmployeeRoute>
              <EmployeeOrders />
            </PrivateEmployeeRoute>
          }
        />
        <Route
          path="/employee-dispatch"
          element={
            <PrivateEmployeeRoute>
              <EmployeeDispatch />
            </PrivateEmployeeRoute>
          }
        />
        <Route
          path="/dispatch-success"
          element={
            <PrivateEmployeeRoute>
              <DispatchSuccessAnimation />
            </PrivateEmployeeRoute>
          }
        />
        <Route
          path="/trolley-connect"
          element={
            <PrivateEmployeeRoute>
              <TrolleyLink />
            </PrivateEmployeeRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
