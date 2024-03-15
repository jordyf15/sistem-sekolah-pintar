import { Dialog, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteFile } from "../../cloudStorage/cloudStorage";
import ThemedButton from "../../components/ThemedButton";
import {
  deleteAgendaInDB,
  getClassCourseAgendasFromDB,
} from "../../database/agenda";
import {
  deleteAnnouncementInDB,
  getClassCourseAnnouncementsFromDB,
} from "../../database/announcement";
import {
  deleteAnswerInDB,
  deleteAssignmentInDB,
  getAnswersByAssignmentIdsFromDB,
  getClassCourseAssignmentsFromDB,
} from "../../database/assignment";
import { deleteClassCourseInDB } from "../../database/classCourse";
import {
  deleteReplyInDB,
  deleteThreadInDB,
  getClassCourseThreadsFromDB,
  getRepliesByThreadIdsFromDB,
} from "../../database/forum";
import {
  deleteTopicInDB,
  getClassCourseTopicsFromDB,
} from "../../database/material";
import {
  deleteScoreInDB,
  deleteStudentScoreInDB,
  getClassCourseScoresFromDB,
  getStudentScoresByScoreIdFromDB,
} from "../../database/score";
import { updateUserLastActiveYearInDB } from "../../database/user";
import { updateUser } from "../../slices/user";
import { splitArrayIntoChunks } from "../../utils/utils";

const DeleteClassCourseDialog = ({ open, setOpen, classCourse }) => {
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
      const deleteRequests = [];

      // get all topics
      const fetchedTopics = await getClassCourseTopicsFromDB(classCourse.id);

      // get all assignments and answers
      const fetchedAssignments = await getClassCourseAssignmentsFromDB(
        classCourse.id
      );
      const assignmentIds = fetchedAssignments.map(
        (assignment) => assignment.id
      );
      let fetchedAnswers;
      if (assignmentIds.length > 30) {
        const assignmentIdsBatches = splitArrayIntoChunks(assignmentIds, 30);
        const getAnswerBatches = [];
        assignmentIdsBatches.forEach((assignmentIdsBatch) => {
          getAnswerBatches.push(
            getAnswersByAssignmentIdsFromDB(assignmentIdsBatch)
          );
        });

        const fetchedAnswersBatches = await Promise.all(getAnswerBatches);
        fetchedAnswers = fetchedAnswersBatches.flat();
      } else {
        fetchedAnswers = await getAnswersByAssignmentIdsFromDB(assignmentIds);
      }

      //get all scores and student scores
      const fetchedScores = await getClassCourseScoresFromDB(classCourse.id);
      const scoreIds = fetchedScores.map((score) => score.id);
      let fetchedStudentScores;
      if (scoreIds.length > 30) {
        const scoreIdsBatches = splitArrayIntoChunks(scoreIds, 30);
        const getStudentScoreBatches = [];
        scoreIdsBatches.forEach((scoreIdsBatch) => {
          getStudentScoreBatches.push(
            getStudentScoresByScoreIdFromDB(scoreIdsBatch)
          );
        });

        const fetchedStudentScoreBatches = await Promise.all(
          getStudentScoreBatches
        );
        fetchedStudentScores = fetchedStudentScoreBatches.flat();
      } else {
        fetchedStudentScores = await getStudentScoresByScoreIdFromDB(scoreIds);
      }

      // get all threads and replies
      const fetchedThreads = await getClassCourseThreadsFromDB(classCourse.id);
      const threadIds = fetchedThreads.map((thread) => thread.id);
      let fetchedReplies;
      if (threadIds.length > 30) {
        const threadIdsBatches = splitArrayIntoChunks(threadIds, 30);
        const getReplyBatches = [];
        threadIdsBatches.forEach((threadIdsBatch) => {
          getReplyBatches.push(getRepliesByThreadIdsFromDB(threadIdsBatch));
        });

        const fetchedReplyBatches = await Promise.all(getReplyBatches);
        fetchedReplies = fetchedReplyBatches.flat();
      } else {
        fetchedReplies = await getRepliesByThreadIdsFromDB(threadIds);
      }

      // get all announcement
      const fetchedAnnouncements = await getClassCourseAnnouncementsFromDB(
        classCourse.id
      );

      // get all agenda
      const fetchedAgenda = await getClassCourseAgendasFromDB(classCourse.id);

      // delete all announcement
      fetchedAnnouncements.forEach((announcement) => {
        deleteRequests.push(deleteAnnouncementInDB(announcement.id));
      });

      // delete all agenda
      fetchedAgenda.forEach((agenda) => {
        deleteRequests.push(deleteAgendaInDB(agenda.id));
      });

      // delete all topics and material attachment
      fetchedTopics.forEach((topic) => {
        Object.entries(topic.materials).forEach(([materialId, material]) => {
          if (material.fileName) {
            deleteRequests.push(
              deleteFile(
                `/material-attachments/${materialId}/${material.fileName}`
              )
            );
          }
        });
        deleteRequests.push(deleteTopicInDB(topic.id));
      });

      // delete all assignment
      fetchedAssignments.forEach((assignment) => {
        if (assignment.attachment) {
          deleteRequests.push(
            deleteFile(
              `/assignment-attachments/${assignment.id}/${assignment.attachment}`
            )
          );
        }

        deleteRequests.push(deleteAssignmentInDB(assignment.id));
      });

      // delete all answers
      fetchedAnswers.forEach((answer) => {
        deleteRequests.push(
          deleteFile(`/answer-attachments/${answer.id}/${answer.attachment}`)
        );
        deleteRequests.push(deleteAnswerInDB(answer.id));
      });

      // delete all scores
      fetchedScores.forEach((score) => {
        deleteRequests.push(deleteScoreInDB(score.id));
      });

      // delete all studentScore
      fetchedStudentScores.forEach((studentScore) => {
        deleteRequests.push(deleteStudentScoreInDB(studentScore.id));
      });

      // delete threads
      fetchedThreads.forEach((thread) => {
        Object.entries(thread.attachments).forEach(([fileId, fileName]) => {
          deleteRequests.push(
            deleteFile(`/thread-attachments/${fileId}/${fileName}`)
          );
        });
        deleteRequests.push(deleteThreadInDB(thread.id));
      });

      // delete replies
      fetchedReplies.forEach((reply) => {
        Object.entries(reply.attachments).forEach(([fileId, fileName]) => {
          deleteRequests.push(
            deleteFile(`/reply-attachments/${fileId}/${fileName}`)
          );
        });
        deleteRequests.push(deleteReplyInDB(reply.id));
      });

      await Promise.all(deleteRequests);
      await deleteClassCourseInDB(classCourse.id);

      const currentYear = new Date().getFullYear();
      if (user.lastActiveYear !== currentYear) {
        await updateUserLastActiveYearInDB(user.id, currentYear);
        const updatedUser = { ...user };
        updatedUser.lastActiveYear = currentYear;
        dispatch(updateUser(updatedUser));
      }

      navigate(`/`, {
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
          Apakah anda yakin ingin menghapus kelas{" "}
          <b>
            {classCourse.className} {classCourse.courseName}
          </b>
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

export default DeleteClassCourseDialog;
