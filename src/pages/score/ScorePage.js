import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import AddClassCourseScoreDialog from "./AddClassCourseScoreDialog";

const ScorePage = () => {
  const user = useSelector((state) => state.user);

  return user.role === "teacher" ? <TeacherScorePage /> : <StudentScorePage />;
};

const TeacherScorePage = () => {
  const navigate = useNavigate();
  const { id: classCourseId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [classCourse, setClassCourse] = useState(null);
  const [classCourseScores, setClassCourseScores] = useState([]);
  const [isAddClassCourseScoreDialogOpen, setIsAddClassCourseScoreDialogOpen] =
    useState(false);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");

  useEffect(() => {
    async function getClassCourseScores() {
      setIsLoading(true);
      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    getClassCourseScores();
  }, [classCourseId]);

  useEffect(() => {
    console.log("classCourseScores", classCourseScores);
  }, [classCourseScores]);

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  const handleSuccessAddClassCourseScore = (classCourseScore) => {
    setClassCourseScores(classCourseScores.concat([classCourseScore]));
    setSuccessSnackbarMsg("Kolom nilai berhasil ditambah");
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
            Nilai
            <br />
            {`${classCourse.className} ${classCourse.courseName}`}
          </Typography>{" "}
          <Stack alignItems="flex-end">
            <ThemedButton
              sx={{ px: 2.5 }}
              size="small"
              onClick={() => setIsAddClassCourseScoreDialogOpen(true)}
            >
              Tambah Kolom Nilai
            </ThemedButton>
          </Stack>
          <Stack alignItems="center" mt="32px !important"></Stack>
          <AddClassCourseScoreDialog
            open={isAddClassCourseScoreDialogOpen}
            setOpen={setIsAddClassCourseScoreDialogOpen}
            onSuccess={handleSuccessAddClassCourseScore}
          />
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

const StudentScorePage = () => {};

export default ScorePage;
