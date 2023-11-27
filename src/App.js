import { Box, ThemeProvider, createTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import ClassCourseDetail from "./pages/ClassCourseDetail";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

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
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/class-courses/:id" element={<ClassCourseDetail />} />
        </Routes>
      </ThemeProvider>
    </Box>
  );
}

export default App;
