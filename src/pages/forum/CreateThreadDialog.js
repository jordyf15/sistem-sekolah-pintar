import { AttachmentRounded } from "@mui/icons-material";
import { Dialog, DialogTitle, IconButton, Stack } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { uploadFile } from "../../cloudStorage/cloudStorage";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { addThreadToDB } from "../../database/forum";
import CreateFileItem from "./CreateFileItem";

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
      setTitleError("Judul tidak boleh kosong");
      return false;
    } else {
      setTitleError("");
      return true;
    }
  };

  const validateDescription = (newDescription) => {
    if (newDescription.length < 1) {
      setDescriptionError("Deskripsi tidak boleh kosong");
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

export default CreateThreadDialog;
