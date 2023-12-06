import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseAssignmentsFromDB } from "../../database/assignment";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import AssignmentCard from "./AssignmentCard";
import CreateAssignmentDialog from "./CreateAssignmentDialog";

const AssignmentPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: classCourseId } = useParams();

  const [classCourse, setClassCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [isCreateTugasDialogOpen, setIsCreateTugasDialogOpen] = useState(false);

  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState(
    location.state?.justDeleted ? "Thread berhasil dihapus" : ""
  );

  useEffect(() => {
    async function getClassCourseAndAssignment() {
      setIsLoading(true);

      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);

        const fetchedAssignment = await getClassCourseAssignmentsFromDB(
          classCourseId
        );

        setAssignments(fetchedAssignment);
      } catch (error) {
        console.log(error);
      }

      setIsLoading(false);
    }
    getClassCourseAndAssignment();
  }, [classCourseId]);
  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  return (
    <Stack spacing={3} bgcolor="background.default" minHeight="100vh">
      <Header />
      {!isLoading ? (
        <Stack
          spacing={4}
          px={{
            xs: 2,
            sm: 4,
            md: 6,
            lg: 8,
            xl: 10,
          }}
        >
          <Stack spacing={2}>
            <BackButton
              onClick={() => {
                navigate(`/class-courses/${classCourseId}`);
              }}
            />
            <Typography
              textAlign="center"
              fontSize={{
                xs: "18px",
                md: "20px",
              }}
            >
              Daftar Tugas
              <br />
              {`${classCourse.className} ${classCourse.courseName}`}
            </Typography>

            {user.role === "teacher" && (
              <Stack alignItems="flex-end">
                <ThemedButton
                  onClick={() => setIsCreateTugasDialogOpen(true)}
                  sx={{ px: 2.5 }}
                  size="small"
                >
                  Buat Tugas
                </ThemedButton>
              </Stack>
            )}
            <Stack spacing={4} pb={4} px={{ xs: 0, sm: 4 }}>
              {assignments.map((assigment) => (
                <AssignmentCard
                  key={assigment.id}
                  classCourseId={classCourseId}
                  assignment={assigment}
                />
              ))}
            </Stack>
          </Stack>
          <CreateAssignmentDialog
            open={isCreateTugasDialogOpen}
            setOpen={setIsCreateTugasDialogOpen}
          />
        </Stack>
      ) : (
        <Stack justifyContent="center" alignItems="center" flex={1}>
          <Loading />
        </Stack>
      )}
      <SuccessSnackbar
        text={successSnackbarMsg}
        onClose={handleCloseSuccessSnackbar}
      />
    </Stack>
  );
};

export default AssignmentPage;
