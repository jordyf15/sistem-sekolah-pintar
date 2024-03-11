import { MenuBook } from "@mui/icons-material";
import { Checkbox, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import {
  getClassCourseByIDFromDB,
  updateClassCourseLastActiveYearInDB,
} from "../../database/classCourse";
import {
  getClassCourseTopicsFromDB,
  updateTopicProgressInDB,
} from "../../database/material";
import { updateUserLastActiveYearInDB } from "../../database/user";
import { updateUser } from "../../slices/user";

const ProgressPage = () => {
  const { id: classCourseId } = useParams();
  const navigate = useNavigate();

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

        const fetchedTopics = await getClassCourseTopicsFromDB(classCourseId);

        setTopics(fetchedTopics);
      } catch (error) {
        console.log("handleSubmit error", error);
      }
      setIsLoading(false);
    }

    getClassCourseTopics();
  }, [classCourseId]);

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
          <Stack alignItems="center" mt="32px !important">
            <Paper elevation={3} sx={{ maxWidth: "900px", width: 1 }}>
              <Stack spacing={2} p={2}>
                {topics.map((topic) => (
                  <TopicProgressItem
                    key={topic.id}
                    topic={topic}
                    classCourse={classCourse}
                    setClassCourse={setClassCourse}
                    onSuccess={handleSuccessToggleProgress}
                  />
                ))}
              </Stack>
            </Paper>
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

const TopicProgressItem = ({
  topic,
  onSuccess,
  classCourse,
  setClassCourse,
}) => {
  const [isChecked, setIsChecked] = useState(topic.checked);
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const onToggleChecked = async (e) => {
    if (isLoading || user.role === "student") return;
    setIsChecked(e.target.checked);
    setIsLoading(true);

    try {
      await updateTopicProgressInDB(topic.id, e.target.checked);

      const currentYear = new Date().getFullYear();
      if (user.lastActiveYear !== currentYear) {
        await updateUserLastActiveYearInDB(user.id, currentYear);
        const updatedUser = { ...user };
        updatedUser.lastActiveYear = currentYear;
        dispatch(updateUser(updatedUser));
      }

      if (classCourse.lastActiveYear !== currentYear) {
        await updateClassCourseLastActiveYearInDB(classCourse.id, currentYear);
        setClassCourse({ ...classCourse, lastActiveYear: currentYear });
      }

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
