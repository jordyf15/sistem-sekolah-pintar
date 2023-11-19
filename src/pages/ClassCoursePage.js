import { Stack } from "@mui/material";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Header from "../components/Header";

const ClassCoursePage = () => {
  const user = useSelector((state) => state.user);

  if (user.role !== "teacher") return <Navigate to="/" replace />;

  return (
    <Stack minHeight="100vh" bgcolor="background.default">
      <Header />
    </Stack>
  );
};

export default ClassCoursePage;
