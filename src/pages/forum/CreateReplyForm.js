import { AttachmentRounded } from "@mui/icons-material";
import { IconButton, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { uploadFile } from "../../cloudStorage/cloudStorage";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { addReplyToDB } from "../../database/forum";
import CreateFileItem from "./CreateFileItem";

const CreateReplyForm = ({ threadId, onCreate }) => {
  const [reply, setReply] = useState("");
  const [attachments, setAttachments] = useState(new Map());
  const [replyError, setReplyError] = useState("");
  const [attachmentsError, setAttachmentsError] = useState(new Map());
  const [isLoading, setIsLoading] = useState();

  useEffect(() => {
    console.log("reply", reply);
  }, [reply]);

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
                <CreateFileItem
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

export default CreateReplyForm;
