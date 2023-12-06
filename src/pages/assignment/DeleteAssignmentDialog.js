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

const DeleteAssignmentDialog = ({
  open,
  setOpen,
  assignment,
  assignmentId,
}) => {
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
      const answers = await getAssignmentAnswersFromDB(assignmentId);
      const deleteRequests = [];

      answers.forEach((answer) => {
        deleteRequests.push(deleteAnswerInDB(answer.id));
        deleteRequests.push(
          deleteFile(
            `/answer/${answer.assignmentId}/${answer.studentId}/${answer.name}`
          )
        );
      });

      if (assignment.attachment !== "") {
        deleteRequests.push(
          deleteFile(
            `/assignments-attachment/${assignmentId}/${assignment.attachment}`
          )
        );
      }

      await Promise.all(deleteRequests);

      await deleteAssignmentInDB(assignmentId);

      navigate(`/class-courses/${classCourseId}/assignments`, {
        state: { justDeleted: true },
      });
    } catch (error) {
      console.log("handle Delete assignment error", error);
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
          Apakah anda yakin ingin menghapus Tugas{" "}
          <Typography fontWeight="bold" component="span">
            {assignment.title}?
          </Typography>
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
