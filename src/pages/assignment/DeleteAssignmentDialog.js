import { Dialog, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteFile } from "../../cloudStorage/cloudStorage";
import ThemedButton from "../../components/ThemedButton";
import {
  deleteAnswerInDB,
  deleteAssignmentInDB,
  getAssignmentAnswersFromDB,
} from "../../database/assignment";

const DeleteAssignmentDialog = ({ open, setOpen, assignment }) => {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { classCourseId } = useParams();

  const onCloseDialog = () => {
    setIsLoading(false);
    setOpen(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const answers = await getAssignmentAnswersFromDB(assignment.id);
      const deleteRequests = [];

      answers.forEach((answer) => {
        deleteRequests.push(deleteAnswerInDB(answer.id));
        deleteRequests.push(
          deleteFile(
            `/answer-attachments/${answer.assignmentId}-${answer.studentId}/${answer.attachment}`
          )
        );
      });

      if (assignment.attachment) {
        deleteRequests.push(
          deleteFile(
            `/assignment-attachments/${assignment.id}/${assignment.attachment}`
          )
        );
      }

      await Promise.all(deleteRequests);
      await deleteAssignmentInDB(assignment.id);

      navigate(`/class-courses/${classCourseId}/assignments`, {
        state: { justDeleted: true },
      });
    } catch (error) {
      console.log(error);
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
          Apakah anda yakin ingin menghapus tugas <b>{assignment.title}</b>?
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

export default DeleteAssignmentDialog;
