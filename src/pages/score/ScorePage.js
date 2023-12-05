import { useSelector } from "react-redux";
import StudentScorePage from "./StudentScorePage";
import TeacherScorePage from "./TeacherScorePage";

const ScorePage = () => {
  const user = useSelector((state) => state.user);

  return user.role === "teacher" ? <TeacherScorePage /> : <StudentScorePage />;
};

export default ScorePage;
