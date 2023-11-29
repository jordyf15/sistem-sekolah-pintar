import {
  AttachmentRounded,
  DeleteForeverRounded,
  InsertDriveFileRounded,
} from "@mui/icons-material";
import {
  Alert,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { Stack } from "@mui/system";
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { uploadFile } from "../cloudStorage/cloudStorage";
import BackButton from "../components/BackButton";
import Header from "../components/Header";
import InputField from "../components/InputField";
import Loading from "../components/Loading";
import ThemedButton from "../components/ThemedButton";
import { addReplyToDB, getThreadByIDFromDB } from "../database/forum";

const ThreadDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  const { classCourseId, threadId } = useParams();

  const [thread, setThread] = useState(null);
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
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }

    getThreadDetail();
  }, [threadId]);

  useEffect(() => {
    console.log("replies", replies);
  }, [replies]);

  const handleSuccessReply = (reply) => {
    setReplies([reply].concat(replies));
    setSuccessSnackbarMsg("Balasan berhasil dibuat");
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
            <ThreadDetail thread={thread} />
          </Stack>
          <CreateReplyForm threadId={threadId} onCreate={handleSuccessReply} />
        </Stack>
      ) : (
        <Stack justifyContent="center" alignItems="center" flex={1}>
          <Loading />
        </Stack>
      )}
      <Snackbar
        open={!!successSnackbarMsg}
        autoHideDuration={3000}
        onClose={handleCloseCreateSuccessSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseCreateSuccessSnackbar} severity="success">
          {successSnackbarMsg}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

const ThreadDetail = ({ thread }) => {
  return <Paper elevation={3}>{thread.title}</Paper>;
};

const CreateReplyForm = ({ threadId, onCreate }) => {
  const [reply, setReply] = useState("");
  const [attachments, setAttachments] = useState(new Map());
  const [replyError, setReplyError] = useState("");
  const [attachmentsError, setAttachmentsError] = useState(new Map());
  const [isLoading, setIsLoading] = useState();

  const user = useSelector((state) => state.user);

  const validateReply = (newReply) => {
    if (newReply.length < 1) {
      setReplyError("Balasan tidak boleh kosong");
      return false;
    } else {
      setReplyError("");
      return true;
    }
  };

  const validateFile = (file) => {
    if (file.size > 10e6) {
      return "Ukuran file tidak boleh lebih dari 10MB";
    } else {
      return "";
    }
  };

  const onReplyChange = (newReply) => {
    setReply(newReply);

    validateReply(newReply);
  };

  const onFileUpload = (e) => {
    if (!e.target.files) return;

    const file = e.target.files[0];

    const newAttachments = new Map(attachments);

    const fileId = uuid();

    newAttachments.set(fileId, file);
    setAttachments(newAttachments);

    const fileError = validateFile(file);
    if (fileError) {
      const newAttachmentsError = new Map(attachmentsError);
      newAttachmentsError.set(fileId, fileError);
      setAttachmentsError(newAttachmentsError);
    }

    e.target.value = "";
  };

  const onRemoveFile = (id) => {
    const newAttachments = new Map(attachments);
    newAttachments.delete(id);
    setAttachments(newAttachments);

    const newAttachmentsError = new Map(attachmentsError);
    newAttachmentsError.delete(id);
    setAttachmentsError(newAttachmentsError);
  };

  const handleSubmit = async () => {
    let isValid = true;
    if (!validateReply(reply)) {
      isValid = false;
    }

    attachments.forEach((file) => {
      if (validateFile(file)) {
        isValid = false;
      }
    });

    if (!isValid) return;

    setIsLoading(true);

    try {
      const fileUploads = [];
      const filePaths = {};

      attachments.forEach((file, fileId) => {
        const filePath = `/reply-attachments/${fileId}/${file.name}`;
        fileUploads.push(uploadFile(file, filePath));
        filePaths[fileId] = file.name;
      });

      await Promise.all(fileUploads);

      const replyObj = {
        id: uuid(),
        reply: reply,
        threadId: threadId,
        creatorId: user.id,
        attachments: filePaths,
        createdAt: new Date(),
      };

      await addReplyToDB(replyObj);

      onCreate({
        ...replyObj,
        createdAt: Timestamp.fromDate(replyObj.createdAt),
      });

      setReply("");
      setAttachments(new Map());
    } catch (error) {
      console.log("handleSubmit error", error);
    }

    setIsLoading(false);
  };

  return (
    <Stack spacing={2}>
      <Typography fontSize="20px">Diskusi</Typography>
      <Paper elevation={3}>
        <Stack p={2} spacing={2}>
          <InputField
            labelText="Balasan"
            placeholder="Masukkan balasan anda"
            error={replyError}
            value={reply}
            onChange={(e) => onReplyChange(e.target.value)}
            onBlur={() => onReplyChange(reply)}
            disabled={isLoading}
            rows={4}
            multiline
          />
          <Stack alignItems="flex-start" mb={2}>
            <input id="file-input" type="file" hidden onChange={onFileUpload} />
            <label htmlFor="file-input">
              <IconButton component="span">
                <AttachmentRounded sx={{ color: "#000" }} />
              </IconButton>
            </label>
          </Stack>
          <Stack>
            <Grid columnSpacing={2} container>
              {Array.from(attachments).map(([fileId, file]) => (
                <FileItem
                  id={fileId}
                  key={fileId}
                  name={file.name}
                  error={
                    attachmentsError.has(fileId)
                      ? attachmentsError.get(fileId)
                      : ""
                  }
                  onRemove={onRemoveFile}
                />
              ))}
            </Grid>
            <Stack alignItems="flex-end">
              <ThemedButton
                onClick={handleSubmit}
                sx={{ flex: 1 }}
                disabled={isLoading}
                size="small"
              >
                Kirim
              </ThemedButton>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

const FileItem = ({ id, name, error, onRemove }) => {
  const isSmallMobile = useMediaQuery("(max-width:400px)");
  const content = (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      py={1}
      pl={1}
      borderRadius="8px"
      sx={{
        boxSizing: "border-box",
        border: error ? "3px solid #d32f2f" : "3px solid rgba(0,0,0,0.5)",
        color: error ? "error.main" : "rgba(0,0,0,0.5)",
        bgcolor: "background.paper",
      }}
      spacing={1}
      mb={2}
    >
      <InsertDriveFileRounded />
      <Typography fontSize="14px" noWrap>
        {name}
      </Typography>
      <IconButton sx={{ p: 1 }} onClick={() => onRemove(id)}>
        <DeleteForeverRounded
          sx={{ color: error ? "error.main" : "rgba(0,0,0,0.5)" }}
        />
      </IconButton>
    </Stack>
  );

  return (
    <Grid xs={isSmallMobile ? 12 : 6} sm={4} md={3}>
      {error ? (
        <Tooltip
          title={error}
          followCursor
          sx={{ bgcolor: "error.main" }}
          enterTouchDelay={0}
          leaveTouchDelay={3000}
        >
          {content}
        </Tooltip>
      ) : (
        content
      )}
    </Grid>
  );
};

export default ThreadDetailPage;
