import { useSelector } from "react-redux";
import StudentAssignmentDetail from "./StudentAssignmentDetail";
import TeacherAssignmentDetail from "./TeacherAssignmentDetail";

const AssignmentDetailPage = () => {
  const user = useSelector((state) => state.user);

  return user.role === "teacher" ? (
    <TeacherAssignmentDetail />
  ) : (
    <StudentAssignmentDetail />
  );
};

export default AssignmentDetailPage;
