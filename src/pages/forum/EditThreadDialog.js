import { AttachmentRounded } from "@mui/icons-material";
import { Dialog, DialogTitle, IconButton, Stack } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { deleteFile, uploadFile } from "../../cloudStorage/cloudStorage";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { updateThreadInDB } from "../../database/forum";
import CreateFileItem from "./CreateFileItem";
import EditFileItem from "./EditFileItem";

const EditThreadDialog = ({ open, setOpen, thread, onSuccess }) => {
  const [title, setTitle] = useState(thread.title);
  const [description, setDescription] = useState(thread.description);
  const [newAttachments, setNewAttachments] = useState(new Map());
  const [oldAttachments, setOldAttachments] = useState(thread.attachments);
  const [deletedOldAttachments, setDeletedOldAttachments] = useState(new Map());
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [newAttachmentsError, setNewAttachmentsError] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {
    setTitle(thread.title);
    setDescription(thread.description);
    setNewAttachments(new Map());
    setOldAttachments(thread.attachments);
    setDeletedOldAttachments(new Map());
    setTitleError("");
    setDescriptionError("");
    setNewAttachmentsError(new Map());
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

  const validateFile = (file) => {
    if (file.size > 10e6) {
      return "Ukuran file tidak boleh lebih dari 10MB";
    } else {
      return "";
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
    if (!validateTitle(title)) {
      isValid = false;
    }

    if (!validateDescription(description)) {
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
          deleteFile(`/thread-attachments/${fileId}/${fileName}`)
        );
      });

      newAttachments.forEach((file, fileId) => {
        fileRequests.push(
          uploadFile(file, `/thread-attachments/${fileId}/${file.name}`)
        );
        filePaths[fileId] = file.name;
      });

      await Promise.all(fileRequests);

      const updatedThread = {
        ...thread,
        title: title,
        description: description,
        attachments: { ...oldAttachments, ...filePaths },
      };

      await updateThreadInDB(updatedThread);

      onSuccess(updatedThread);

      setTitle(updatedThread.title);
      setDescription(updatedThread.description);
      setNewAttachments(new Map());
      setOldAttachments(updatedThread.attachments);
      setDeletedOldAttachments(new Map());
      setTitleError("");
      setDescriptionError("");
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
      <DialogTitle textAlign="center">Edit Thread</DialogTitle>
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
                filePath={`/thread-attachments/${fileId}/${fileName}`}
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

export default EditThreadDialog;
