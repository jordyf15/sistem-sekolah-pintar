import { Box, ThemeProvider, createTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import AnnouncementPage from "./pages/AnnouncementPage";
import AssignmentPage from "./pages/AssignmentPage";
import ChildPage from "./pages/ChildHome";
import ContactPage from "./pages/ContactPage";
import CoursePage from "./pages/CoursePage";
import GradePage from "./pages/GradePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SchedulePage from "./pages/SchedulePage";
import TestPage from "./pages/TestPage";
import HomePage from "./pages/home/HomePage";

const theme = createTheme({
  palette: {
    background: { default: "#D3D3D3", paper: "#FFF" },
  },
});

function App() {
  const location = useLocation();

  const user = useSelector((state) => state.user);

  const isLoggedIn = user ? true : false;

  const whitelistedPaths = ["/register", "/login"];

  if (isLoggedIn && whitelistedPaths.includes(location.pathname))
    return <Navigate to="/" replace />;

  if (!isLoggedIn && !whitelistedPaths.includes(location.pathname))
    return <Navigate to="/login" replace />;

  return (
    <Box>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/child-home" element={<ChildPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/contact-list" element={<ContactPage />} />
          <Route path="/assignments" element={<AssignmentPage />} />
          <Route path="/grades" element={<GradePage />} />
          <Route path="/courses" element={<CoursePage />} />
          <Route path="/announcements" element={<AnnouncementPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/test" element={<TestPage />} />
        </Routes>
      </ThemeProvider>
    </Box>
  );
}

export default App;
