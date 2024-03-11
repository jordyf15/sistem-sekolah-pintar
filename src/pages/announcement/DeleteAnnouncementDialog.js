import { Dialog, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ThemedButton from "../../components/ThemedButton";
import { deleteAnnouncementInDB } from "../../database/announcement";
import { updateClassCourseLastActiveYearInDB } from "../../database/classCourse";
import { updateUserLastActiveYearInDB } from "../../database/user";
import { updateUser } from "../../slices/user";

const DeleteAnnouncementDialog = ({
  open,
  setOpen,
  announcement,
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
      await deleteAnnouncementInDB(announcement.id);

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

      onSuccess(announcement.id);
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
          Apakah anda yakin ingin menghapus pengumuman{" "}
          <b>{announcement.title}</b>?
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

export default DeleteAnnouncementDialog;
