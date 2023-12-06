import { Box, ThemeProvider, createTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import ClassCourseDetail from "./pages/ClassCourseDetail";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

import RegisterPage from "./pages/RegisterPage";
import AssignmentPage from "./pages/assignment/AssignmentPage";
import ForumPage from "./pages/forum/ForumPage";
import ThreadDetailPage from "./pages/forum/ThreadDetailPage";
import MaterialPage from "./pages/material/MaterialPage";
import ProfilePage from "./pages/profile/ProfilePage";
import ProgressPage from "./pages/progress/ProgressPage";
import ScorePage from "./pages/score/ScorePage";
import StudentPage from "./pages/student/StudentPage";

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
          <Route
            path="/class-courses/:id/assignments"
            element={<AssignmentPage />}
          />
          <Route path="/class-courses/:id/threads" element={<ForumPage />} />
          <Route
            path="/class-courses/:id/materials"
            element={<MaterialPage />}
          />
          <Route
            path="/class-courses/:id/progress"
            element={<ProgressPage />}
          />
          <Route path="/class-courses/:id/scores" element={<ScorePage />} />
          <Route path="/class-courses/:id/students" element={<StudentPage />} />
          <Route
            path="/class-courses/:classCourseId/threads/:threadId"
            element={<ThreadDetailPage />}
          />
          {/* <Route
            path="/class-courses/:classCourseId/assignments/:assignmentId"
            element={<AssignmentDetailPage />}
          /> */}
        </Routes>
      </ThemeProvider>
    </Box>
  );
}

export default App;
