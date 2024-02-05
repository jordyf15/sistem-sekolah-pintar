import { Box, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { getUserByIdsFromDB } from "../../database/user";
import { splitArrayIntoChunks } from "../../utils/utils";
import DeleteStudentDialog from "./DeleteStudentDialog";

const StudentPage = () => {
  const navigate = useNavigate();
  const { id: classCourseId } = useParams();
  const user = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(true);
  const [classCourse, setClassCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");

  const onSetStudents = (newStudents) => {
    setStudents(
      newStudents.sort((a, b) =>
        a.fullname > b.fullname ? 1 : b.fullname > a.fullname ? -1 : 0
      )
    );
  };

  useEffect(() => {
    async function getClassCourseStudents() {
      if (user.role !== "teacher") return;
      setIsLoading(true);
      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);

        if (fetchedClassCourse.studentIds.length > 30) {
          const studentIdBatches = splitArrayIntoChunks(
            fetchedClassCourse.studentIds,
            30
          );

          const getStudentBatches = [];
          studentIdBatches.forEach((studentIdBatch) =>
            getStudentBatches.push(getUserByIdsFromDB(studentIdBatch))
          );

          const fetchedStudentBatches = await Promise.all(getStudentBatches);
          onSetStudents(fetchedStudentBatches.flat());
        } else {
          const fetchedStudents = await getUserByIdsFromDB(
            fetchedClassCourse.studentIds
          );
          onSetStudents(fetchedStudents);
        }
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    getClassCourseStudents();
  }, [classCourseId, user.role]);

  if (user.role !== "teacher")
    return <Navigate to={`/class-courses/${classCourseId}`} />;

  const handleSuccessDeleteStudent = (deletedStudentId) => {
    setStudents(students.filter((student) => student.id !== deletedStudentId));
    const newUpdatedClassCourse = { ...classCourse };
    newUpdatedClassCourse.studentIds = classCourse.studentIds.filter(
      (studentId) => studentId !== deletedStudentId
    );
    setClassCourse(newUpdatedClassCourse);
    setSuccessSnackbarMsg("Murid berhasil dihapus");
  };

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  return (
    <Stack
      minHeight="100vh"
      bgcolor="background.default"
      spacing={!isLoading ? 3 : 0}
    >
      <Header />
      {!isLoading ? (
        <Stack
          spacing={2}
          px={{
            xs: 2,
            sm: 4,
            md: 6,
            lg: 8,
            xl: 10,
          }}
          pb={4}
        >
          <BackButton
            onClick={() => navigate(`/class-courses/${classCourseId}`)}
          />
          <Typography
            textAlign="center"
            fontSize={{
              xs: "18px",
              md: "20px",
            }}
          >
            Daftar Murid
            <br />
            {`${classCourse.className} ${classCourse.courseName}`}
          </Typography>
          <Stack alignItems="center" mt="32px !important" px={2}>
            <Paper elevation={3} sx={{ maxWidth: "900px", width: 1, p: 2 }}>
              <Stack spacing={2}>
                {students.map((student) => (
                  <StudentItem
                    key={student.id}
                    student={student}
                    classCourse={classCourse}
                    onDeleteSuccess={handleSuccessDeleteStudent}
                  />
                ))}
              </Stack>
            </Paper>
          </Stack>
          <SuccessSnackbar
            text={successSnackbarMsg}
            onClose={handleCloseSuccessSnackbar}
          />
        </Stack>
      ) : (
        <Stack justifyContent="center" alignItems="center" flex={1}>
          <Loading />
        </Stack>
      )}
    </Stack>
  );
};

const StudentItem = ({ student, classCourse, onDeleteSuccess }) => {
  const [studentImgUrl, setStudentImgUrl] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!student) return;
    async function getImgUrl() {
      const imgUrl = await getFileDownloadLink(student.profileImage);
      setStudentImgUrl(imgUrl);
    }

    getImgUrl();
  }, [student]);
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center" flex={1} spacing={1}>
        <Box
          width="40px"
          height="40px"
          borderRadius="50%"
          component="img"
          src={studentImgUrl}
          alt={`profile ${student.id}`}
        />
        <Typography>{student.fullname}</Typography>
      </Stack>
      <ThemedButton onClick={() => setIsDeleteDialogOpen(true)} size="small">
        Hapus
      </ThemedButton>
      <DeleteStudentDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        student={student}
        classCourse={classCourse}
        onSuccess={onDeleteSuccess}
      />
    </Stack>
  );
};

export default StudentPage;
