import { NavigateNextRounded } from "@mui/icons-material";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { getClassCourseThreadsFromDB } from "../../database/forum";
import { getUserByIdsFromDB } from "../../database/user";
import { formatDateToString, splitArrayIntoChunks } from "../../utils/utils";
import CreateThreadDialog from "./CreateThreadDialog";

const ForumPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: classCourseId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [classCourse, setClassCourse] = useState(null);
  const [threads, setThreads] = useState([]);
  const [creators, setCreators] = useState(new Map());
  const [isCreateThreadDialogOpen, setIsCreateThreadDialogOpen] =
    useState(false);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState(
    location.state?.justDeleted ? "Thread berhasil dihapus" : ""
  );

  useEffect(() => {
    async function getClassCourseAndThreads() {
      setIsLoading(true);

      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);

        const fetchedThreads = await getClassCourseThreadsFromDB(
          fetchedClassCourse.id
        );

        setThreads(fetchedThreads);

        const creatorIdsSet = new Set();

        fetchedThreads.forEach((thread) => creatorIdsSet.add(thread.creatorId));
        const creatorIds = Array.from(creatorIdsSet);
        let fetchedUsers;
        if (creatorIds.length > 30) {
          const userIdBatches = splitArrayIntoChunks(creatorIds, 30);
          const getUserBatches = [];
          userIdBatches.forEach((userIdBatch) =>
            getUserBatches.push(getUserByIdsFromDB(userIdBatch))
          );

          const fetchedUserBatches = await Promise.all(getUserBatches);
          fetchedUsers = fetchedUserBatches.flat();
        } else {
          fetchedUsers = await getUserByIdsFromDB(creatorIds);
        }

        const creatorMap = new Map();
        fetchedUsers.forEach((user) => {
          creatorMap.set(user.id, user);
        });

        setCreators(creatorMap);
      } catch (error) {
        console.log(error);
      }

      setIsLoading(false);
    }
    getClassCourseAndThreads();
  }, [classCourseId]);

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
        <>
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
                onClick={() => navigate(`/class-courses/${classCourseId}`)}
              />
              <Typography
                textAlign="center"
                fontSize={{
                  xs: "18px",
                  md: "20px",
                }}
              >
                Forum
                <br />
                {`${classCourse.className} ${classCourse.courseName}`}
              </Typography>
              <Stack alignItems="flex-end">
                <ThemedButton
                  onClick={() => setIsCreateThreadDialogOpen(true)}
                  sx={{ px: 2.5 }}
                  size="small"
                >
                  Buat Thread
                </ThemedButton>
              </Stack>
              <Stack spacing={4} pb={4} px={{ xs: 0, sm: 4 }}>
                {threads.map((thread) => (
                  <ThreadItem
                    key={thread.id}
                    classCourseId={classCourse.id}
                    thread={thread}
                    creator={creators.get(thread.creatorId)}
                  />
                ))}
              </Stack>
            </Stack>
          </Stack>
          <CreateThreadDialog
            open={isCreateThreadDialogOpen}
            setOpen={setIsCreateThreadDialogOpen}
            classCourse={classCourse}
          />
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

const ThreadItem = ({ classCourseId, thread, creator }) => {
  const [creatorImgUrl, setCreatorImgUrl] = useState("");
  const navigate = useNavigate();

  const onViewThread = () => {
    navigate(`/class-courses/${classCourseId}/threads/${thread.id}`);
  };

  useEffect(() => {
    if (!creator) return;
    async function getImgUrl() {
      const imgUrl = await getFileDownloadLink(creator.profileImage);
      setCreatorImgUrl(imgUrl);
    }
    getImgUrl();
  }, [creator]);

  return (
    <Paper elevation={3}>
      <Stack
        direction="row"
        py={2}
        pl={4}
        pr={2}
        justifyContent="space-between"
      >
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              width="40px"
              height="40px"
              borderRadius="50%"
              component="img"
              src={creatorImgUrl}
              alt={`profile ${creator.id}`}
            />
            <Stack>
              <Typography>{creator.fullname}</Typography>
              <Typography fontSize="12px">
                {formatDateToString(thread.createdAt.toDate())}
              </Typography>
            </Stack>
          </Stack>
          <Typography fontWeight="bold">{thread.title}</Typography>
        </Stack>
        <Stack justifyContent="center">
          <IconButton onClick={onViewThread}>
            <NavigateNextRounded sx={{ color: "#000", fontSize: "32px" }} />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default ForumPage;
