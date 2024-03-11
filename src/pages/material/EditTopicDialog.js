import { Dialog, DialogTitle, Stack } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { updateClassCourseLastActiveYearInDB } from "../../database/classCourse";
import { updateTopicInDB } from "../../database/material";
import { updateUserLastActiveYearInDB } from "../../database/user";
import { updateUser } from "../../slices/user";

const EditTopicDialog = ({
  open,
  setOpen,
  topic,
  classCourse,
  setClassCourse,
  onSuccess,
}) => {
  const [name, setName] = useState(topic.name);
  const [nameError, setNameError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const onCloseDialog = () => {
    setName(topic.name);
    setNameError("");
    setIsLoading(false);
    setOpen(false);
  };

  const validateName = (newName) => {
    if (newName.length < 1) {
      setNameError("Nama topik tidak boleh kosong");
      return false;
    } else {
      setNameError("");
      return true;
    }
  };

  const onNameChange = (newName) => {
    setName(newName);

    validateName(newName);
  };

  const handleSubmit = async () => {
    if (!validateName(name)) return;

    setIsLoading(true);

    try {
      await updateTopicInDB(topic.id, name);

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

      setOpen(false);
      onSuccess(topic.id, name);
    } catch (error) {
      console.log("handleSubmit error", error);
    }

    setIsLoading(false);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={onCloseDialog}
      open={open}
      sx={{
        "& .MuiPaper-root": {
          mx: 1,
          width: "100vw",
        },
      }}
    >
      <DialogTitle textAlign="center">Edit Topik</DialogTitle>
      <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
        <InputField
          labelText="Nama Topik"
          placeholder="Masukkan nama topik"
          error={nameError}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={() => onNameChange(name)}
          disabled={isLoading}
        />

        <Stack direction="row" spacing={2}>
          <ThemedButton
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{ flex: 1 }}
          >
            Simpan
          </ThemedButton>
          <ThemedButton
            disabled={isLoading}
            variant="outlined"
            sx={{ flex: 1 }}
            onClick={onCloseDialog}
          >
            Batal
          </ThemedButton>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default EditTopicDialog;
