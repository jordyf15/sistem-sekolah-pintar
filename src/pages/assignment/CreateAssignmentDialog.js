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
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { uploadFile } from "../../cloudStorage/cloudStorage";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { addAssignmentToDB } from "../../database/assignment";
import CreateFileItem from "./CreateFileItem";

const CreateAssignmentDialog = ({ open, setOpen }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { id: classCourseId } = useParams();

  const onCloseDialog = () => {
    setTitle("");
    setDescription("");
    setAttachment(null);
    setDeadline(null);
    setTitleError("");
    setDescriptionError("");
    setAttachmentError("");
    setDeadlineError("");
    setIsLoading(false);
    setOpen(false);
  };

  const validateTitle = (newTitle) => {
    if (newTitle.length === 0) {
      setTitleError("Judul tidak boleh kosong");
      return false;
    } else {
      setTitleError("");
      return true;
    }
  };

  const validateDescription = (newDescription) => {
    if (newDescription.length === 0) {
      setDescriptionError("Deskripsi tidak boleh kosong");
      return false;
    } else {
      setDescriptionError("");
      return true;
    }
  };

  const validateFile = (file) => {
    if (file === null) return true;

    if (file.size > 10e6) {
      setAttachmentError("Ukuran file tidak boleh lebih dari 10MB");
      return false;
    } else {
      setAttachmentError("");
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

  const onFileUpload = (e) => {
    if (!e.target.files) return;

    const file = e.target.files[0];

    setAttachment(file);
    validateFile(file);

    e.target.value = "";
  };

  const onRemoveFile = () => {
    setAttachment(null);
    setAttachmentError("");
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

    if (!validateFile(attachment)) {
      isValid = false;
    }

    if (!validateDeadline(deadline)) {
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const addedAssignment = {
        id: uuid(),
        title: title,
        description: description,
        deadline: deadline,
        createdAt: new Date(),
        classCourseId: classCourseId,
      };
      if (attachment) {
        addedAssignment.attachment = attachment.name;
        await uploadFile(
          attachment,
          `/assignment-attachments/${addedAssignment.id}/${attachment.name}`
        );
      }

      await addAssignmentToDB(addedAssignment);

      navigate(
        `/class-courses/${classCourseId}/assignments/${addedAssignment.id}`,
        {
          state: { justCreated: true },
        }
      );
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
      <DialogTitle textAlign="center">Buat Tugas</DialogTitle>
      <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
        <InputField
          labelText="Judul"
          placeholder="Masukkan judul"
          error={titleError}
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

        {attachment && (
          <Grid container>
            <CreateFileItem
              name={attachment.name}
              error={attachmentError}
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
    </Dialog>
  );
};

export default CreateAssignmentDialog;
