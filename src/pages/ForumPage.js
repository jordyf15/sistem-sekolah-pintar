import {
  AttachmentRounded,
  DeleteForeverRounded,
  InsertDriveFileRounded,
  NavigateNextRounded,
} from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { v4 as uuid } from "uuid";
import { getFileDownloadLink, uploadFile } from "../cloudStorage/cloudStorage";
import BackButton from "../components/BackButton";
import Header from "../components/Header";
import InputField from "../components/InputField";
import Loading from "../components/Loading";
import ThemedButton from "../components/ThemedButton";
import { getClassCourseByIDFromDB } from "../database/classCourse";
import { addThreadToDB, getClassCourseThreadsFromDB } from "../database/forum";
import { getUserByIDFromDB } from "../database/user";
import { formatDateToString } from "../utils/utils";

const ForumPage = () => {
  const navigate = useNavigate();
  const { id: classCourseId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [classCourse, setClassCourse] = useState(null);
  const [threads, setThreads] = useState([]);
  const [creators, setCreators] = useState(new Map());
  const [isCreateThreadDialogOpen, setIsCreateThreadDialogOpen] =
    useState(false);

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

        const creatorIds = new Set();

        fetchedThreads.forEach((thread) => creatorIds.add(thread.creatorId));

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
    getClassCourseAndThreads();
  }, [classCourseId]);

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

const CreateThreadDialog = ({ open, setOpen, classCourse }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState(new Map());
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [attachmentsError, setAttachmentsError] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector((state) => state.user);

  const navigate = useNavigate();

  const onCloseDialog = () => {
    setTitle("");
    setDescription("");
    setAttachments(new Map());
    setTitleError("");
    setDescriptionError("");
    setAttachmentsError(new Map());
    setIsLoading(false);
    setOpen(false);
  };

  const validateTitle = (newTitle) => {
    if (newTitle.length < 1) {
      setTitleError("Judul thread tidak boleh kosong");
      return false;
    } else {
      setTitleError("");
      return true;
    }
  };

  const validateDescription = (newDescription) => {
    if (newDescription.length < 1) {
      setDescriptionError("Deskripsi thread tidak boleh kosong");
      return false;
    } else {
      setDescriptionError("");
      return true;
    }
  };

  const onTitleChange = (newTitle) => {
    setTitle(newTitle);

    validateTitle(newTitle);
  };

  const onDescriptionChange = (newDescription) => {
    setDescription(newDescription);

    validateDescription(newDescription);
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

  const validateFile = (file) => {
    if (file.size > 10e6) {
      return "Ukuran file tidak boleh lebih dari 10MB";
    } else {
      return "";
    }
  };

  const handleSubmit = async () => {
    let isValid = true;
    if (!validateTitle(title)) {
      isValid = false;
    }

    if (!validateDescription(description)) {
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
        const filePath = `/thread-attachments/${fileId}/${file.name}`;
        fileUploads.push(uploadFile(file, filePath));
        filePaths[fileId] = file.name;
      });

      await Promise.all(fileUploads);

      const thread = {
        id: uuid(),
        title: title,
        description: description,
        creatorId: user.id,
        createdAt: new Date(),
        classCourseId: classCourse.id,
        attachments: filePaths,
      };

      await addThreadToDB(thread);

      navigate(`/class-courses/${classCourse.id}/threads/${thread.id}`, {
        state: { justCreated: true },
      });
    } catch (error) {
      console.log("handleSubmit error", error);
    }

    setIsLoading(false);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      onClose={onCloseDialog}
      open={open}
      sx={{
        "& .MuiPaper-root": {
          mx: 1,
          width: "100vw",
        },
      }}
    >
      <DialogTitle textAlign="center">Buat Thread</DialogTitle>
      <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
        <InputField
          labelText="Judul"
          placeholder="Masukkan judul"
          error={titleError}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={() => onTitleChange(title)}
          disabled={isLoading}
        />
        <InputField
          labelText="Deskripsi"
          placeholder="Masukkan deskripsi"
          error={descriptionError}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          onBlur={() => onDescriptionChange(description)}
          disabled={isLoading}
          multiline
          rows={4}
        />

        <Stack>
          <Stack alignItems="flex-start" mb={2}>
            <input id="file-input" type="file" hidden onChange={onFileUpload} />
            <label htmlFor="file-input">
              <IconButton component="span">
                <AttachmentRounded sx={{ color: "#000" }} />
              </IconButton>
            </label>
          </Stack>
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
          <Stack direction="row" spacing={2}>
            <ThemedButton
              onClick={handleSubmit}
              sx={{ flex: 1 }}
              disabled={isLoading}
            >
              Buat
            </ThemedButton>
            <ThemedButton
              onClick={onCloseDialog}
              variant="outlined"
              sx={{ flex: 1 }}
              disabled={isLoading}
            >
              Batal
            </ThemedButton>
          </Stack>
        </Stack>
      </Stack>
    </Dialog>
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

export default ForumPage;
