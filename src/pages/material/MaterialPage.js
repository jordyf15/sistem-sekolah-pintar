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
import CreateTopicDialog from "./CreateTopicDialog";

const MaterialPage = () => {
  const { id: classCourseId } = useParams();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const [isCreateTopicDialogOpen, setIsCreateTopicDialogOpen] = useState(false);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [classCourse, setClassCourse] = useState(null);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    async function getClassCourseAndMaterials() {
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

    getClassCourseAndMaterials();
  }, [classCourseId]);

  useEffect(() => {
    console.log("topics", topics);
  }, [topics]);

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  const handleSuccessCreateTopic = (topic) => {
    setTopics([topic].concat(topics));
    setSuccessSnackbarMsg("Topik berhasil dibuat");
  };

  return (
    <Stack
      minHeight="100vh"
      bgcolor="background.default"
      spacing={!isLoading ? 3 : 0}
    >
      <Header />
      {!isLoading ? (
        <>
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
              Materi Pelajaran
              <br />
              {`${classCourse.className} ${classCourse.courseName}`}
            </Typography>
            {user.role === "teacher" && (
              <Stack alignItems="flex-end">
                <ThemedButton
                  onClick={() => setIsCreateTopicDialogOpen(true)}
                  sx={{ px: 2.5 }}
                  size="small"
                >
                  Buat Topik
                </ThemedButton>
              </Stack>
            )}
            <CreateTopicDialog
              open={isCreateTopicDialogOpen}
              setOpen={setIsCreateTopicDialogOpen}
              onSuccess={handleSuccessCreateTopic}
            />
          </Stack>
        </>
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

export default MaterialPage;
