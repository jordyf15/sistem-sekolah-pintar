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
import { deleteFile, uploadFile } from "../../cloudStorage/cloudStorage";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { updateAssignmentInDB } from "../../database/assignment";
import { formatDateToString } from "../../utils/utils";
import FileItem from "./FileItem";

const EditAssignmentDialog = ({
  open,
  setOpen,
  assignmentId,
  onEditAssignment,
  assignment,
  Snackbar,
}) => {
  const [title, setTitle] = useState(assignment.title);
  const [description, setDescription] = useState(assignment.description);
  // how shall we do about attachment? ,make another one for name orr?
  // hmmm deadline also won't fit with datetimepicekr, maybe make new one
  const [oldAttachments, setOldAttachments] = useState(assignment.attachment);
  const [attachments, setAttachments] = useState("");
  const [attachmentsError, setAttachmentsError] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [deadlineError, setDeadlineError] = useState("");

  const onCloseDialog = () => {
    setDeadlineError("");
    setDeadline(null);
    setTitleError("");
    setDescriptionError("");
    setAttachmentsError("");
    setOldAttachments(assignment.attachment);
    setAttachments(null);
    setTitle(assignment.title);
    setDescription(assignment.description);
    setIsLoading(false);
    setOpen(false);
  };

  const onEditDialog = () => {
    setDeadlineError("");
    setDeadline(null);
    setTitleError("");
    setDescriptionError("");
    setAttachmentsError("");
    //this logic is wrong, change it into somehting else, hmmm now it should be right
    attachments
      ? setOldAttachments(attachments.name)
      : setOldAttachments(oldAttachments);
    setAttachments("");
    setTitle(title);
    setDescription(description);
    setIsLoading(false);
    setOpen(false);
  };

  const validateFile = (file) => {
    if (file === null) return true;
    if (file.size > 10e6) {
      setAttachmentsError("Ukuran file tidak boleh lebih dari 10MB");
      return false;
    } else {
      setAttachmentsError("");
      return true;
    }
  };

  const onFileUpload = (e) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setOldAttachments(null);
    setAttachments(file);

    validateFile(file);

    e.target.value = "";
  };

  const DateValidation = (deadline) => {
    const now = new Date();
    //jika kosong mata deadline tidak berubah
    if (deadline === null) {
      return true;
    }
    if (deadline === "") {
      return true;
    }
    if (deadline < now) {
      setDeadlineError("pilih tanggal yang belum lewat");
      return false;
    }
    if (deadline > now) {
      setDeadlineError("");
      return true;
    }
    setDeadlineError("tolong diisi penuh ya :)");
    console.log("jebol validasi");
    return false;
  };
  // this one change a little for edit
  const onDatePick = (e) => {
    if (e === null) return;
    DateValidation(e.$d);
    setDeadline(e.$d);
  };

  const onTitleChange = (e) => {
    setTitle(e);
    validateTitle(e);
  };

  const validateTitle = (e) => {
    if (e.length === 0) {
      setTitleError("Judul tidak boleh kosong");
      return false;
    } else {
      setTitleError("");
      return true;
    }
  };

  const onDescriptionChange = (e) => {
    setDescription(e);
    validateDescription(e);
  };
  const validateDescription = (e) => {
    if (e.length === 0) {
      setDescriptionError("Deskripsi tidak boleh kosong");
      return false;
    } else {
      setDescriptionError("");
      return true;
    }
  };

  const handleSubmit = async () => {
    let valid = true;

    if (!validateTitle(title)) {
      valid = false;
    }

    if (!DateValidation(deadline)) {
      valid = false;
    }
    if (!validateDescription(description)) {
      valid = false;
    }
    if (!validateFile(attachments)) {
      valid = false;
    }

    if (!valid) return;
    setIsLoading(true);

    try {
      //change the path name
      if (oldAttachments == null && assignment.attachment !== "") {
        const attachmentpath = `/assignments-attachment/${assignmentId}/${assignment.attachment}`;
        await deleteFile(attachmentpath);
      }

      // delete old atchment if there's any
      if (attachments != null) {
        const attachmentpath = `/assignments-attachment/${assignmentId}/${attachments.name}`;
        await uploadFile(attachments, attachmentpath);
      }

      const editAssignmentData = {
        id: assignmentId,
        title: title,
        description: description,
        deadline: deadline ? deadline : assignment.deadline,
        attachment: attachments
          ? attachments.name
          : oldAttachments
          ? oldAttachments
          : "",
      };
      //console.log("edit asg", editAssignmentData);
      await updateAssignmentInDB(editAssignmentData);
      //onEditAssignment(editAssignmentData);
      onEditAssignment(editAssignmentData);
    } catch (error) {
      console.log("edit assigment dialog error", error);
    }
    Snackbar("tugas berhasil di edit, refresh untuk memperbaruhi data");

    onEditDialog();
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
          value={title}
          error={titleError}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={() => onTitleChange(title)}
          disabled={isLoading}
        />
        <Typography>
          Batas Waktu Sekarang: {formatDateToString(assignment.deadline)}
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Batas Waktu Tugas Baru "
            onChange={(e) => {
              onDatePick(e);
            }}
          />
          biarkan kosong untuk tidak mengubah batas waktu lama
          {deadlineError && (
            <Typography color="crimson">{deadlineError}</Typography>
          )}
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

        {oldAttachments && (
          <Stack>
            <Grid container>
              <FileItem
                name={oldAttachments}
                error={attachmentsError ? attachmentsError : ""}
                onRemove={() => {
                  setOldAttachments(null);
                }}
              />
            </Grid>
          </Stack>
        )}
        {attachments && (
          <Stack>
            <Grid container>
              <FileItem
                name={attachments.name}
                error={attachmentsError ? attachmentsError : ""}
                onRemove={() => {
                  setAttachments(null);
                }}
              />
            </Grid>
          </Stack>
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
