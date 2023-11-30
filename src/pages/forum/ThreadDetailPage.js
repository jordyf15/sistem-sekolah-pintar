import { MoreVertRounded } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import {
  getThreadByIDFromDB,
  getThreadRepliesFromDB,
} from "../../database/forum";
import { getUserByIDFromDB } from "../../database/user";
import { formatDateToString } from "../../utils/utils";
import CreateReplyForm from "./CreateReplyForm";
import DeleteReplyDialog from "./DeleteReplyDialog";
import DeleteThreadDialog from "./DeleteThreadDialog";
import EditReplyDialog from "./EditReplyDialog";
import EditThreadDialog from "./EditThreadDialog";
import ViewFileItem from "./ViewFileItem";

const ThreadDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  const { classCourseId, threadId } = useParams();

  const [thread, setThread] = useState(null);
  const [creators, setCreators] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState(
    location.state?.justCreated ? "Thread berhasil dibuat" : ""
  );
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    async function getThreadDetail() {
      setIsLoading(true);
      try {
        const fetchedThread = await getThreadByIDFromDB(threadId);

        setThread(fetchedThread);

        const fetchedReplies = await getThreadRepliesFromDB(threadId);
        setReplies(fetchedReplies);

        const creatorIds = new Set();
        creatorIds.add(fetchedThread.creatorId);

        fetchedReplies.forEach((reply) => creatorIds.add(reply.creatorId));

        const getUsers = Array.from(creatorIds).map((creatorId) =>
          getUserByIDFromDB(creatorId)
        );

        const users = await Promise.all(getUsers);

        const creatorMap = new Map();
        users.forEach((user) => {
          creatorMap.set(user.id, user);
        });

        setCreators(creatorMap);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }

    getThreadDetail();
  }, [threadId]);

  const handleSuccessReply = (reply) => {
    setReplies([reply].concat(replies));
    setSuccessSnackbarMsg("Balasan berhasil dibuat");
    if (!creators.has(user.id)) {
      const newCreators = new Map(creators);
      newCreators.set(user.id, user);
      setCreators(newCreators);
    }
  };

  const handleSuccessEditThread = (thread) => {
    setThread(thread);
    setSuccessSnackbarMsg("Thread berhasil diedit");
  };

  const handleSuccessDeleteReply = (replyId) => {
    setReplies(replies.filter((reply) => reply.id !== replyId));
    setSuccessSnackbarMsg("Balasan berhasil dihapus");
  };

  const handleSuccessEditReply = (updatedReply) => {
    setReplies(
      replies.map((reply) =>
        reply.id === updatedReply.id ? updatedReply : reply
      )
    );
    setSuccessSnackbarMsg("Balasan berhasil diedit");
  };

  const handleCloseCreateSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  return (
    <Stack minHeight="100vh" bgcolor="background.default" spacing={3}>
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
              onClick={() =>
                navigate(`/class-courses/${classCourseId}/threads`)
              }
            />
            <ThreadDetail
              thread={thread}
              creator={creators.get(thread.creatorId)}
              onEditSuccess={handleSuccessEditThread}
            />
          </Stack>
          <CreateReplyForm threadId={threadId} onCreate={handleSuccessReply} />
          <Stack spacing={2} pb={4}>
            {replies.map((reply) => (
              <ReplyDetail
                reply={reply}
                creator={creators.get(reply.creatorId)}
                key={reply.id}
                onEditSuccess={handleSuccessEditReply}
                onDeleteSuccess={handleSuccessDeleteReply}
              />
            ))}
          </Stack>
        </Stack>
      ) : (
        <Stack justifyContent="center" alignItems="center" flex={1}>
          <Loading />
        </Stack>
      )}
      <SuccessSnackbar
        text={successSnackbarMsg}
        onClose={handleCloseCreateSuccessSnackbar}
      />
    </Stack>
  );
};

const ThreadDetail = ({ thread, creator, onEditSuccess }) => {
  const [creatorImgUrl, setCreatorImgUrl] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const user = useSelector((state) => state.user);

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
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
      <Stack p={2} position="relative" spacing={1}>
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
        <Typography whiteSpace="pre-wrap" fontSize="14px">
          {thread.description}
        </Typography>
        <Grid columnSpacing={2} container>
          {Object.entries(thread.attachments).map(([fileId, fileName]) => (
            <ViewFileItem
              name={fileName}
              key={fileId}
              filePath={`/thread-attachments/${fileId}/${fileName}`}
            />
          ))}
        </Grid>

        {thread.creatorId === user.id && (
          <Stack
            position="absolute"
            top="8px"
            right="4px"
            justifyContent="flex-start"
          >
            <IconButton onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
              <MoreVertRounded sx={{ color: "#000", fontSize: "28px" }} />
            </IconButton>
          </Stack>
        )}

        <Menu
          onClose={handleCloseMenu}
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
        >
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setIsEditDialogOpen(true);
            }}
          >
            Edit Thread
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setIsDeleteDialogOpen(true);
            }}
          >
            Hapus Thread
          </MenuItem>
        </Menu>
      </Stack>
      <EditThreadDialog
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
        thread={thread}
        onSuccess={onEditSuccess}
      />
      <DeleteThreadDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        thread={thread}
      />
    </Paper>
  );
};

const ReplyDetail = ({ reply, creator, onEditSuccess, onDeleteSuccess }) => {
  const [creatorImgUrl, setCreatorImgUrl] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const user = useSelector((state) => state.user);

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
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
      <Stack p={2} position="relative" spacing={1}>
        <Stack mb={1} direction="row" alignItems="center" spacing={1}>
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
              {formatDateToString(reply.createdAt.toDate())}
            </Typography>
          </Stack>
        </Stack>
        <Typography whiteSpace="pre-wrap" fontSize="14px">
          {reply.reply}
        </Typography>
        <Grid columnSpacing={2} container>
          {Object.entries(reply.attachments).map(([fileId, fileName]) => (
            <ViewFileItem
              name={fileName}
              key={fileId}
              filePath={`/reply-attachments/${fileId}/${fileName}`}
            />
          ))}
        </Grid>

        {reply.creatorId === user.id && (
          <Stack
            position="absolute"
            top="8px"
            right="4px"
            justifyContent="flex-start"
          >
            <IconButton onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
              <MoreVertRounded sx={{ color: "#000", fontSize: "28px" }} />
            </IconButton>
          </Stack>
        )}

        <Menu
          onClose={handleCloseMenu}
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
        >
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setIsEditDialogOpen(true);
            }}
          >
            Edit Balasan
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setIsDeleteDialogOpen(true);
            }}
          >
            Hapus Balasan
          </MenuItem>
        </Menu>
      </Stack>

      <EditReplyDialog
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
        replyObj={reply}
        onSuccess={onEditSuccess}
      />
      <DeleteReplyDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        replyObj={reply}
        onSuccess={onDeleteSuccess}
      />
    </Paper>
  );
};

export default ThreadDetailPage;
