import { Dialog, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteFile } from "../../cloudStorage/cloudStorage";
import ThemedButton from "../../components/ThemedButton";
import { updateClassCourseLastActiveYearInDB } from "../../database/classCourse";
import {
  deleteReplyInDB,
  deleteThreadInDB,
  getThreadRepliesFromDB,
} from "../../database/forum";
import { updateUserLastActiveYearInDB } from "../../database/user";
import { updateUser } from "../../slices/user";

const DeleteThreadDialog = ({
  open,
  setOpen,
  thread,
  classCourse,
  setClassCourse,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);

  const onCloseDialog = () => {
    setIsLoading(false);
    setOpen(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const threadReplies = await getThreadRepliesFromDB(thread.id);
      const deleteRequests = [];

      threadReplies.forEach((threadReply) => {
        deleteRequests.push(deleteReplyInDB(threadReply.id));
        Object.entries(threadReply.attachments).forEach(([fileId, fileName]) =>
          deleteRequests.push(
            deleteFile(`/reply-attachments/${fileId}/${fileName}`)
          )
        );
      });

      Object.entries(thread.attachments).forEach(([fileId, fileName]) =>
        deleteRequests.push(
          deleteFile(`/thread-attachments/${fileId}/${fileName}`)
        )
      );

      await Promise.all(deleteRequests);

      await deleteThreadInDB(thread.id);

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

      navigate(`/class-courses/${classCourse.id}/threads`, {
        state: { justDeleted: true },
      });
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
          Apakah anda yakin ingin menghapus thread{" "}
          <Typography fontWeight="bold" component="span">
            {thread.title}
          </Typography>
          ?
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

export default DeleteThreadDialog;
