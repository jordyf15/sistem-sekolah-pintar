import { Dialog, DialogTitle, Stack } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { addAnnouncementToDB } from "../../database/announcement";
import { updateClassCourseLastActiveYearInDB } from "../../database/classCourse";
import { updateUserLastActiveYearInDB } from "../../database/user";
import { updateUser } from "../../slices/user";

const CreateAnnouncementDialog = ({
  open,
  setOpen,
  classCourse,
  setClassCourse,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

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
        classCourseId: classCourse.id,
        createdAt: new Date(),
      };

      await addAnnouncementToDB(announcement);

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
