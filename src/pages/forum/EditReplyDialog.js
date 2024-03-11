import { AttachmentRounded } from "@mui/icons-material";
import { Dialog, DialogTitle, IconButton, Stack } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { deleteFile, uploadFile } from "../../cloudStorage/cloudStorage";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { updateClassCourseLastActiveYearInDB } from "../../database/classCourse";
import { updateReplyInDB } from "../../database/forum";
import { updateUserLastActiveYearInDB } from "../../database/user";
import { updateUser } from "../../slices/user";
import CreateFileItem from "./CreateFileItem";
import EditFileItem from "./EditFileItem";

const EditReplyDialog = ({
  open,
  setOpen,
  replyObj,
  classCourse,
  setClassCourse,
  onSuccess,
}) => {
  const [reply, setReply] = useState(replyObj.reply);
  const [newAttachments, setNewAttachments] = useState(new Map());
  const [oldAttachments, setOldAttachments] = useState(replyObj.attachments);
  const [deletedOldAttachments, setDeletedOldAttachments] = useState(new Map());
  const [replyError, setReplyError] = useState("");
  const [newAttachmentsError, setNewAttachmentsError] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const onCloseDialog = () => {
    setReply(replyObj.reply);
    setNewAttachments(new Map());
    setOldAttachments(replyObj.attachments);
    setDeletedOldAttachments(new Map());
    setReplyError("");
    setNewAttachmentsError(new Map());
    setIsLoading(false);
    setOpen(false);
  };

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

    const tempNewAttachments = new Map(newAttachments);

    const fileId = uuid();

    tempNewAttachments.set(fileId, file);
    setNewAttachments(tempNewAttachments);

    const fileError = validateFile(file);
    if (fileError) {
      const tempNewAttachmentsError = new Map(newAttachmentsError);
      tempNewAttachmentsError.set(fileId, fileError);
      setNewAttachmentsError(tempNewAttachmentsError);
    }

    e.target.value = "";
  };

  const onRemoveNewAttachments = (id) => {
    const tempNewAttachments = new Map(newAttachments);
    tempNewAttachments.delete(id);
    setNewAttachments(tempNewAttachments);

    const tempNewAttachmentsError = new Map(newAttachmentsError);
    tempNewAttachmentsError.delete(id);
    setNewAttachmentsError(newAttachmentsError);
  };

  const onRemoveOldAttachments = (id) => {
    const tempDeletedOldAttachments = new Map(deletedOldAttachments);
    tempDeletedOldAttachments.set(id, oldAttachments[id]);
    setDeletedOldAttachments(tempDeletedOldAttachments);

    const tempOldAttachments = { ...oldAttachments };
    delete tempOldAttachments[id];
    setOldAttachments(tempOldAttachments);
  };

  const handleSubmit = async () => {
    let isValid = true;
    if (!validateReply(reply)) {
      isValid = false;
    }

    newAttachments.forEach((file) => {
      if (validateFile(file)) {
        isValid = false;
      }
    });

    if (!isValid) return;

    setIsLoading(true);

    try {
      const filePaths = {};
      const fileRequests = [];

      deletedOldAttachments.forEach((fileName, fileId) => {
        fileRequests.push(
          deleteFile(`/reply-attachments/${fileId}/${fileName}`)
        );
      });

      newAttachments.forEach((file, fileId) => {
        fileRequests.push(
          uploadFile(file, `/reply-attachments/${fileId}/${file.name}`)
        );
        filePaths[fileId] = file.name;
      });

      await Promise.all(fileRequests);

      const updatedReply = {
        ...replyObj,
        reply: reply,
        attachments: { ...oldAttachments, ...filePaths },
      };

      await updateReplyInDB(updatedReply);

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

      onSuccess(updatedReply);

      setReply(updatedReply.reply);
      setNewAttachments(new Map());
      setOldAttachments(updatedReply.attachments);
      setDeletedOldAttachments(new Map());
      setReplyError("");
      setNewAttachmentsError(new Map());
      setOpen(false);
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
      <DialogTitle textAlign="center">Edit Balasan</DialogTitle>
      <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
        <InputField
          labelText="Balasan"
          placeholder="Masukkan balasan"
          error={replyError}
          value={reply}
          onChange={(e) => onReplyChange(e.target.value)}
          onBlur={() => onReplyChange(reply)}
          disabled={isLoading}
          multiline
          rows={4}
        />

        <Stack>
          <Stack alignItems="flex-start" mb={2}>
            <input
              id="file-input-edit-thread"
              type="file"
              hidden
              onChange={onFileUpload}
            />
            <label htmlFor="file-input-edit-thread">
              <IconButton component="span">
                <AttachmentRounded sx={{ color: "#000" }} />
              </IconButton>
            </label>
          </Stack>

          <Grid columnSpacing={2} container>
            {Object.entries(oldAttachments).map(([fileId, fileName]) => (
              <EditFileItem
                id={fileId}
                key={fileId}
                name={fileName}
                filePath={`/reply-attachments/${fileId}/${fileName}`}
                onRemove={onRemoveOldAttachments}
              />
            ))}
            {Array.from(newAttachments).map(([fileId, file]) => (
              <CreateFileItem
                id={fileId}
                key={fileId}
                name={file.name}
                error={
                  newAttachmentsError.has(fileId)
                    ? newAttachmentsError.get(fileId)
                    : ""
                }
                onRemove={onRemoveNewAttachments}
              />
            ))}
          </Grid>
          <Stack direction="row" spacing={2}>
            <ThemedButton
              onClick={handleSubmit}
              sx={{ flex: 1 }}
              disabled={isLoading}
            >
              Simpan
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

export default EditReplyDialog;
