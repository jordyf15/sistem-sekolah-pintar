import { Dialog, DialogTitle, Stack } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { addAnnouncementToDB } from "../../database/announcement";

const CreateAnnouncementDialog = ({ open, setOpen, onSuccess }) => {
  const { id: classCourseId } = useParams();

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {
    setTitleError("");
    setTitle("");
    setDescription("");
    setDescriptionError("");
    setIsLoading(false);
    setOpen(false);
  };

  const validateTitle = (newTitle) => {
    if (newTitle.length < 1) {
      setTitleError("Judul pengumuman tidak boleh kosong");
      return false;
    } else {
      setTitleError("");
      return true;
    }
  };

  const validateDescription = (newDescription) => {
    if (newDescription.length < 1) {
      setDescriptionError("Deskripsi pengumuman tidak boleh kosong");
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

  const handleSubmit = async () => {
    let isValid = true;

    if (!validateTitle(title)) {
      isValid = false;
    }

    if (!validateDescription(description)) {
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const announcement = {
        id: uuid(),
        title: title,
        description: description,
        classCourseId: classCourseId,
        createdAt: new Date(),
      };

      await addAnnouncementToDB(announcement);

      onSuccess(announcement);
      onCloseDialog();
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
      <DialogTitle textAlign="center">Buat Pengumuman</DialogTitle>
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

export default CreateAnnouncementDialog;
