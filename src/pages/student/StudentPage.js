import { Groups } from "@mui/icons-material";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { getUserByIdsFromDB } from "../../database/user";
import { checkUserAccess, splitArrayIntoChunks } from "../../utils/utils";
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
      setIsLoading(true);
      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);
        if (
          user.role === "student" &&
          fetchedClassCourse.studentIds.includes(user.id)
        ) {
          navigate(`/class-courses/${fetchedClassCourse.id}`);
        }
        checkUserAccess(user, fetchedClassCourse, navigate);

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
  }, [classCourseId, user, navigate]);

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
          flexGrow={1}
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
          <Stack flexGrow={1} alignItems="center" mt="32px !important">
            <Stack
              component={Paper}
              elevation={3}
              flexGrow={1}
              width={1}
              maxWidth="900px"
              justifyContent={students.length > 0 ? "unset" : "center"}
            >
              {students.length > 0 ? (
                <Stack spacing={2} p={2}>
                  {students.map((student, idx) => (
                    <StudentItem
                      number={idx + 1}
                      key={student.id}
                      student={student}
                      classCourse={classCourse}
                      onDeleteSuccess={handleSuccessDeleteStudent}
                    />
                  ))}
                </Stack>
              ) : (
                <Stack
                  spacing={1}
                  height={1}
                  justifyContent="center"
                  alignItems="center"
                  px={2}
                >
                  <Groups sx={{ fontSize: "76px", color: "text.secondary" }} />
                  <Typography
                    textAlign="center"
                    fontSize="18px"
                    color="text.primary"
                  >
                    Kelas ini belum ada murid
                  </Typography>
                  <Typography
                    fontSize="14px"
                    textAlign="center"
                    color="text.secondary"
                  >
                    Cobalah bagikan kode kelas ke murid-murid anda.
                  </Typography>
                </Stack>
              )}
            </Stack>
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

const StudentItem = ({ student, number, classCourse, onDeleteSuccess }) => {
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
    <Stack
      spacing={1}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Stack direction="row" alignItems="center" flex={1} spacing={1}>
        <Typography minWidth="24px">{number}.</Typography>
        <Box
          width="40px"
          height="40px"
          borderRadius="50%"
          component="img"
          src={studentImgUrl}
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
