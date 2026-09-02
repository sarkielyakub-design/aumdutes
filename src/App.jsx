import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import Exports from "./pages/Exports";
import Login from "./pages/Login";
import RegisterVolunteer from "./pages/RegisterVolunteer";
import Dashboard from "./pages/Dashboard";
import Volunteers from "./pages/Volunteers";
import PollingUnits from "./pages/PollingUnits";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterVolunteer />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteers"
          element={
            <ProtectedRoute>
              <Volunteers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/polling-units"
          element={
            <ProtectedRoute>
              <PollingUnits />
            </ProtectedRoute>
          }
        />

        <Route
          path="/exports"
          element={
            <ProtectedRoute>
              <Exports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
