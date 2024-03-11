import { Dialog, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteFile } from "../../cloudStorage/cloudStorage";
import ThemedButton from "../../components/ThemedButton";
import { updateClassCourseLastActiveYearInDB } from "../../database/classCourse";
import { deleteTopicInDB } from "../../database/material";
import { updateUserLastActiveYearInDB } from "../../database/user";
import { updateUser } from "../../slices/user";

const DeleteTopicDialog = ({
  open,
  setOpen,
  topic,
  classCourse,
  setClassCourse,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const onCloseDialog = () => {
    setIsLoading(false);
    setOpen(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const deleteFiles = [];
      Object.entries(topic.materials).forEach(([materialId, material]) => {
        if (material.fileName) {
          deleteFiles.push(
            deleteFile(
              `/material-attachments/${materialId}/${material.fileName}`
            )
          );
        }
      });
      await Promise.all(deleteFiles);
      await deleteTopicInDB(topic.id);

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

      onSuccess(topic.id);
      setOpen(false);
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
      <Stack px={{ xs: 2, sm: 4 }} py={{ xs: 2, sm: 4 }} spacing={2}>
        <Typography fontSize={{ xs: "14px", sm: "16px" }}>
          Apakah anda yakin ingin menghapus topik <b>{topic.name}</b>?
        </Typography>
        <Stack direction="row" spacing={2}>
          <ThemedButton
            onClick={handleSubmit}
            sx={{ flex: 1 }}
            disabled={isLoading}
          >
            Hapus
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

export default DeleteTopicDialog;
