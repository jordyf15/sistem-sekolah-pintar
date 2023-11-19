import { Stack } from "@mui/material";
import { useSelector } from "react-redux";
import Header from "../../components/Header";
import TeacherHomeContent from "./TeacherHomeContent";

const HomePage = () => {
  const user = useSelector((state) => state.user);

  let content;
  switch (user.role) {
    case "student":
      content = <StudentHomePage />;
      break;
    case "parent":
      content = <ParentHomePage />;
      break;
    case "teacher":
      content = <TeacherHomeContent />;
      break;
    default:
      content = <></>;
      break;
  }

  return (
    <Stack minHeight="100vh" bgcolor="background.default">
      <Header />
      {content}
    </Stack>
  );
};

const StudentHomePage = () => {
  return <Stack></Stack>;
};

const ParentHomePage = () => {
  return <Stack></Stack>;
};

export default HomePage;
