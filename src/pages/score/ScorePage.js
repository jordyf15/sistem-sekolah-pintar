import { useSelector } from "react-redux";
import TeacherScorePage from "./TeacherScorePage";

const ScorePage = () => {
  const user = useSelector((state) => state.user);

  return user.role === "teacher" ? <TeacherScorePage /> : <StudentScorePage />;
};

const StudentScorePage = () => {};

export default ScorePage;
