import { Dialog, DialogTitle, Stack, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useState } from "react";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { updateAgendaInDB } from "../../database/agenda";

const EditAgendaDialog = ({ open, setOpen, agenda, onSuccess }) => {
  const [title, setTitle] = useState(agenda.title);
  const [description, setDescription] = useState(agenda.description);
  const [date, setDate] = useState(agenda.date);
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [dateError, setDateError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {
    setTitle(agenda.title);
    setDescription(agenda.description);
    setDate(agenda.date);
    setTitleError("");
    setDescriptionError("");
    setDateError("");
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

  const validateDate = (newDate) => {
    if (newDate === null) {
      setDateError("Tanggal harus dipilih");
      return false;
    } else {
      setDateError("");
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

  const onDateChange = (newDate) => {
    setDate(newDate ? newDate.$d : null);
    validateDate(newDate ? newDate.$d : null);
  };

  const handleSubmit = async () => {
    let isValid = true;

    if (!validateTitle(title)) {
      isValid = false;
    }

    if (!validateDescription(description)) {
      isValid = false;
    }

    if (!validateDate(date)) {
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const updatedAgenda = {
        id: agenda.id,
        title: title,
        description: description,
        date: date,
      };

      await updateAgendaInDB(updatedAgenda);
      onSuccess(updatedAgenda);
      setTitle(updatedAgenda.title);
      setDescription(updatedAgenda.description);
      setDate(updatedAgenda.date);
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
      <DialogTitle textAlign="center">Edit Agenda</DialogTitle>
      <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
        <InputField
          labelText="Judul"
          placeholder="Masukkan judul"
          error={titleError}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={() => onTitleChange(title)}
          disabled={isLoading}
          value={title}
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack spacing={1}>
            <Typography fontWeight={500}>Tanggal</Typography>
            <DatePicker
              onChange={(e) => {
                onDateChange(e);
              }}
              value={dayjs(date)}
            />
            {dateError && (
              <Typography
                ml="14px !important"
                fontSize="12px"
                color="error.main"
              >
                {dateError}
              </Typography>
            )}
          </Stack>
        </LocalizationProvider>
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

export default EditAgendaDialog;
