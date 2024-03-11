import { Dialog, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteFile } from "../../cloudStorage/cloudStorage";
import ThemedButton from "../../components/ThemedButton";
import {
  deleteAnswerInDB,
  getAnswersByAssignmentIdsAndStudentId,
  getClassCourseAssignmentsFromDB,
} from "../../database/assignment";
import {
  updateClassCourseLastActiveYearInDB,
  updateClassCourseStudentsInDB,
} from "../../database/classCourse";
import {
  deleteStudentScoreInDB,
  getClassCourseScoresFromDB,
  getStudentScoresByScoreIdsAndStudentId,
} from "../../database/score";
import { updateUserLastActiveYearInDB } from "../../database/user";
import { updateUser } from "../../slices/user";
import { splitArrayIntoChunks } from "../../utils/utils";

const DeleteStudentDialog = ({
  open,
  setOpen,
  student,
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
      const deleteRequests = [];

      const fetchedClassCourseScores = await getClassCourseScoresFromDB(
        classCourse.id
      );
      const scoreIds = fetchedClassCourseScores.map((score) => score.id);

      let studentScores;
      if (scoreIds.length > 30) {
        const scoreIdsBatches = splitArrayIntoChunks(scoreIds, 30);
        const getStudentScoreBatches = [];
        scoreIdsBatches.forEach((scoreIdsBatch) => {
          getStudentScoreBatches.push(
            getStudentScoresByScoreIdsAndStudentId(scoreIdsBatch, student.id)
          );
        });

        const fetchedStudentScoreBatches = await Promise.all(
          getStudentScoreBatches
        );
        studentScores = fetchedStudentScoreBatches.flat();
      } else {
        studentScores = await getStudentScoresByScoreIdsAndStudentId(
          scoreIds,
          student.id
        );
      }

      studentScores.forEach((studentScore) => {
        deleteRequests.push(deleteStudentScoreInDB(studentScore.id));
      });

      const fetchedAssignments = await getClassCourseAssignmentsFromDB(
        classCourse.id
      );
      const assignmentIds = fetchedAssignments.map(
        (assignment) => assignment.id
      );

      let studentAnswers;
      if (assignmentIds.length > 30) {
        const assignmentIdsBatches = splitArrayIntoChunks(assignmentIds, 30);
        const getStudentAnswerBatches = [];
        assignmentIdsBatches.forEach((assignmentIdsBatch) => {
          getStudentAnswerBatches.push(
            getAnswersByAssignmentIdsAndStudentId(
              assignmentIdsBatch,
              student.id
            )
          );
        });

        const fetchedAnswerBatches = await Promise.all(getStudentAnswerBatches);
        studentAnswers = fetchedAnswerBatches.flat();
      } else {
        studentAnswers = await getAnswersByAssignmentIdsAndStudentId(
          assignmentIds,
          student.id
        );
      }

      studentAnswers.forEach((answer) => {
        deleteRequests.push(
          deleteFile(`/answer-attachments/${answer.id}/${answer.attachment}`)
        );
        deleteRequests.push(deleteAnswerInDB(answer.id));
      });

      await Promise.all(deleteRequests);

      const newStudentIds = classCourse.studentIds.filter(
        (studentId) => studentId !== student.id
      );
      await updateClassCourseStudentsInDB(classCourse.id, newStudentIds);

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

      onSuccess(student.id);
      setOpen(false);
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
          Apakah anda yakin ingin menghapus murid <b>{student.fullname}</b>?
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

export default DeleteStudentDialog;
