import { Box, Stack, ThemeProvider, createTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
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
          <Route path="/" element={<Stack>home</Stack>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </ThemeProvider>
    </Box>
  );
}

export default App;
