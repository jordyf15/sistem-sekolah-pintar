import { MenuBook } from "@mui/icons-material";
import { Checkbox, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import {
  getClassCourseTopicsFromDB,
  updateTopicProgressInDB,
} from "../../database/material";
import { checkUserAccess } from "../../utils/utils";

const ProgressPage = () => {
  const { id: classCourseId } = useParams();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const [classCourse, setClassCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getClassCourseTopics() {
      setIsLoading(true);

      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);

        checkUserAccess(user, fetchedClassCourse, navigate);

        const fetchedTopics = await getClassCourseTopicsFromDB(classCourseId);

        setTopics(fetchedTopics);
      } catch (error) {
        console.log("handleSubmit error", error);
      }
      setIsLoading(false);
    }

    getClassCourseTopics();
  }, [classCourseId, user, navigate]);

  const handleSuccessToggleProgress = (topicId, isChecked) => {
    const toggledTopic = topics.filter((topic) => topic.id === topicId)[0];

    toggledTopic.checked = isChecked;

    setTopics(
      topics.map((topic) => (topic.id === topicId ? toggledTopic : topic))
    );
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
            Progres
            <br />
            {`${classCourse.className} ${classCourse.courseName}`}
          </Typography>
          <Stack alignItems="center" flexGrow={1} mt="32px !important">
            <Stack
              component={Paper}
              elevation={3}
              flexGrow={1}
              width={1}
              maxWidth="900px"
              justifyContent={topics.length > 0 ? "unset" : "center"}
            >
              {topics.length > 0 ? (
                <Stack spacing={2} p={2}>
                  {topics.map((topic) => (
                    <TopicProgressItem
                      key={topic.id}
                      topic={topic}
                      onSuccess={handleSuccessToggleProgress}
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
                  <MenuBook
                    sx={{ fontSize: "76px", color: "text.secondary" }}
                  />
                  <Typography
                    textAlign="center"
                    fontSize="18px"
                    color="text.primary"
                  >
                    Kelas ini belum ada topik
                  </Typography>
                  <Typography
                    fontSize="14px"
                    textAlign="center"
                    color="text.secondary"
                  >
                    {user.role === "teacher"
                      ? "Cobalah membuat topik baru."
                      : "Mohon tunggu guru anda membuat topik."}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>
      ) : (
        <Stack justifyContent="center" alignItems="center" flex={1}>
          <Loading />
        </Stack>
      )}
    </Stack>
  );
};

const TopicProgressItem = ({ topic, onSuccess }) => {
  const [isChecked, setIsChecked] = useState(topic.checked);
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector((state) => state.user);

  const onToggleChecked = async (e) => {
    if (isLoading || user.role === "student") return;
    setIsChecked(e.target.checked);
    setIsLoading(true);

    try {
      await updateTopicProgressInDB(topic.id, e.target.checked);

      onSuccess(topic.id, e.target.checked);
    } catch (error) {
      console.log("onToggleChecked error", error);
    }

    setIsLoading(false);
  };

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center" spacing={1}>
        <MenuBook />
        <Typography>{topic.name}</Typography>
      </Stack>

      <Checkbox
        checked={isChecked}
        onClick={onToggleChecked}
        color="success"
        sx={{
          p: 0,
        }}
      />
    </Stack>
  );
};

export default ProgressPage;
