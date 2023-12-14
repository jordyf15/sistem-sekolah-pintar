import { AttachmentRounded } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useState } from "react";
import { deleteFile, uploadFile } from "../../cloudStorage/cloudStorage";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { updateAssignmentInDB } from "../../database/assignment";
import CreateFileItem from "./CreateFileItem";
import EditFileItem from "./EditFileItem";

const EditAssignmentDialog = ({ open, setOpen, assignment, onSuccess }) => {
  const [title, setTitle] = useState(assignment.title);
  const [description, setDescription] = useState(assignment.description);
  const [deadline, setDeadline] = useState(assignment.deadline);
  const [oldAttachment, setOldAttachment] = useState(assignment.attachment);
  const [newAttachment, setNewAttachment] = useState(null);
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const [newAttachmentError, setNewAttachmentError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {
    setTitle(assignment.title);
    setDescription(assignment.description);
    setDeadline(assignment.deadline);
    setNewAttachment(null);
    setOldAttachment(assignment.attachment);
    setTitleError("");
    setDescriptionError("");
    setDeadlineError("");
    setNewAttachmentError("");
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

  const validateDeadline = (newDeadline) => {
    const now = new Date();

    if (newDeadline === null) {
      setDeadlineError("Batas waktu harus dipilih");
      return false;
    } else if (newDeadline < now) {
      setDeadlineError("Batas waktu harus belum lewat");
      return false;
    } else {
      setDeadlineError("");
      return true;
    }
  };

  const validateFile = (file) => {
    if (file === null) return true;

    if (file.size > 10e6) {
      setNewAttachmentError("Ukuran file tidak boleh lebih dari 10MB");
      return false;
    } else {
      setNewAttachmentError("");
      return true;
    }
  };

  const onFileUpload = (e) => {
    if (!e.target.files) return;

    const file = e.target.files[0];

    setOldAttachment("");
    setNewAttachment(file);
    validateFile(file);

    e.target.value = "";
  };

  const onRemoveFile = () => {
    setNewAttachment(null);
    setNewAttachmentError("");
  };

  const onTitleChange = (newTitle) => {
    setTitle(newTitle);
    validateTitle(newTitle);
  };

  const onDescriptionChange = (newDescription) => {
    setDescription(newDescription);
    validateDescription(newDescription);
  };

  const onDeadlineChange = (newDeadline) => {
    if (!newDeadline) return;
    setDeadline(newDeadline.$d);
    validateDeadline(newDeadline.$d);
  };

  const handleSubmit = async () => {
    let isValid = true;

    if (!validateTitle(title)) {
      isValid = false;
    }

    if (!validateDescription(description)) {
      isValid = false;
    }

    if (!validateFile(newAttachment)) {
      isValid = false;
    }

    if (!validateDeadline(deadline)) {
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const updatedAssignment = {
        id: assignment.id,
        title: title,
        description: description,
        deadline: deadline,
        attachment: newAttachment ? newAttachment.name : oldAttachment,
      };

      const fileRequests = [];

      if (!oldAttachment && assignment.attachment) {
        fileRequests.push(
          deleteFile(
            `/assignment-attachments/${assignment.id}/${assignment.attachment}`
          )
        );
      }

      if (newAttachment) {
        fileRequests.push(
          uploadFile(
            newAttachment,
            `/assignment-attachments/${assignment.id}/${newAttachment.name}`
          )
        );
      }

      await Promise.all(fileRequests);
      await updateAssignmentInDB(updatedAssignment);
      onSuccess(updatedAssignment);
      setTitle(updatedAssignment.title);
      setDescription(updatedAssignment.description);
      setDeadline(updatedAssignment.deadline);
      setNewAttachment(null);
      setOldAttachment(updatedAssignment.attachment);
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
      <DialogTitle textAlign="center">Edit Tugas</DialogTitle>
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack spacing={1}>
            <Typography fontWeight={500}>Batas Waktu</Typography>
            <DateTimePicker
              onChange={(e) => {
                onDeadlineChange(e);
              }}
              value={dayjs(deadline)}
            />
            {deadlineError && (
              <Typography
                ml="14px !important"
                fontSize="12px"
                color="error.main"
              >
                {deadlineError}
              </Typography>
            )}
          </Stack>
        </LocalizationProvider>

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

        <Stack alignItems="flex-start" mb={2} onChange={onFileUpload}>
          <input id="file-input" type="file" hidden />
          <label htmlFor="file-input">
            <IconButton component="span">
              <AttachmentRounded sx={{ color: "#000" }} />
            </IconButton>
          </label>
        </Stack>

        {oldAttachment && (
          <Grid container>
            <EditFileItem
              name={oldAttachment}
              filePath={`/assignment-attachments/${assignment.id}/${oldAttachment}`}
              onRemove={() => setOldAttachment("")}
            />
          </Grid>
        )}
        {newAttachment && (
          <Grid container>
            <CreateFileItem
              name={newAttachment.name}
              error={newAttachmentError}
              onRemove={onRemoveFile}
            />
          </Grid>
        )}

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
    </Dialog>
  );
};

export default EditAssignmentDialog;
