import { Dialog, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { deleteFile } from "../../cloudStorage/cloudStorage";
import ThemedButton from "../../components/ThemedButton";
import {
  deleteAgendaInDB,
  getAgendasByClassCourseIdsFromDB,
} from "../../database/agenda";
import {
  deleteAnnouncementInDB,
  getAnnouncementsByClassCourseIdsFromDB,
} from "../../database/announcement";
import {
  deleteAnswerInDB,
  deleteAssignmentInDB,
  getAnswersByAssignmentIdsFromDB,
  getAnswersByStudentIdFromDB,
  getAssignmentsByClassCourseIdsFromDB,
} from "../../database/assignment";
import {
  deleteClassCourseInDB,
  getStudentClassCoursesFromDB,
  getTeacherClassCoursesFromDB,
  updateClassCourseStudentsInDB,
} from "../../database/classCourse";
import {
  deleteReplyInDB,
  deleteThreadInDB,
  getRepliesByCreatorIdFromDB,
  getRepliesByThreadIdsFromDB,
  getThreadsByClassCourseIdsFromDB,
  getThreadsByCreatorIdFromDB,
} from "../../database/forum";
import {
  deleteTopicInDB,
  getTopicsByClassCourseIdsFromDB,
} from "../../database/material";
import {
  deleteScoreInDB,
  deleteStudentScoreInDB,
  getScoresByClassCourseIdsFromDB,
  getStudentScoresByScoreIdFromDB,
  getStudentScoresByStudentId,
} from "../../database/score";
import { deleteUserInDB } from "../../database/user";
import { splitArrayIntoChunks } from "../../utils/utils";

const DeleteUserDialog = ({ open, setOpen, user, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {
    setIsLoading(false);
    setOpen(false);
  };

  const handleDeleteStudent = async () => {
    setIsLoading(true);

    try {
      const studentClassCourses = await getStudentClassCoursesFromDB(user.id);

      // get all deleted student's threads
      const threads = await getThreadsByCreatorIdFromDB(user.id);

      // get all deleted student's thread's reply
      let threadReplies;
      const threadIds = threads.map((thread) => thread.id);
      if (threadIds.length > 30) {
        const threadIdsBatches = splitArrayIntoChunks(threadIds, 30);
        const getReplyBatches = [];
        threadIdsBatches.forEach((threadIdsBatch) => {
          getReplyBatches.push(getRepliesByThreadIdsFromDB(threadIdsBatch));
        });

        const fetchedReplyBatches = await Promise.all(getReplyBatches);
        threadReplies = fetchedReplyBatches.flat();
      } else {
        threadReplies = await getRepliesByThreadIdsFromDB(threadIds);
      }

      // get all deleted student's replies
      const replies = await getRepliesByCreatorIdFromDB(user.id);

      // get all deleted student's student scores
      const studentScores = await getStudentScoresByStudentId(user.id);

      // get all deleted student's answers
      const answers = await getAnswersByStudentIdFromDB(user.id);

      const deletedReplyMap = new Map();
      threadReplies.forEach((reply) => {
        deletedReplyMap.set(reply.id, reply);
      });

      replies.forEach((reply) => {
        deletedReplyMap.set(reply.id, reply);
      });

      const deleteOrUpdateRequests = [];

      // delete student from all class course studentIds
      studentClassCourses.forEach((classCourse) => {
        const newStudentIds = classCourse.studentIds.filter(
          (studentId) => studentId !== user.id
        );

        deleteOrUpdateRequests.push(
          updateClassCourseStudentsInDB(classCourse.id, newStudentIds)
        );
      });

      // delete all deleted student's thread and its replies
      // threads
      threads.forEach((thread) => {
        Object.entries(thread.attachments).forEach(([fileId, fileName]) => {
          deleteOrUpdateRequests.push(
            deleteFile(`/thread-attachments/${fileId}/${fileName}`)
          );
        });
        deleteOrUpdateRequests.push(deleteThreadInDB(thread.id));
      });

      // replies
      deletedReplyMap.forEach((reply) => {
        Object.entries(reply.attachments).forEach(([fileId, fileName]) => {
          deleteOrUpdateRequests.push(
            deleteFile(`/reply-attachments/${fileId}/${fileName}`)
          );
        });
        deleteOrUpdateRequests.push(deleteReplyInDB(reply.id));
      });

      // delete all deleted students answers
      answers.forEach((answer) => {
        deleteOrUpdateRequests.push(
          deleteFile(`/answer-attachments/${answer.id}/${answer.attachment}`)
        );
        deleteOrUpdateRequests.push(deleteAnswerInDB(answer.id));
      });

      // delete all deleted students student scores
      studentScores.forEach((studentScore) => {
        deleteOrUpdateRequests.push(deleteStudentScoreInDB(studentScore.id));
      });

      // delete the student
      deleteOrUpdateRequests.push(deleteUserInDB(user.id));
      if (user.profileImage !== "/profile-image/default.jpg") {
        deleteOrUpdateRequests.push(deleteFile(`/profile-image/${user.id}`));
      }

      await Promise.all(deleteOrUpdateRequests);
      onSuccess(user.id);
      setOpen(false);
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  const handleDeleteTeacher = async () => {
    setIsLoading(true);

    try {
      const teacherClassCourses = await getTeacherClassCoursesFromDB(user.id);

      const classCoursesIds = teacherClassCourses.map(
        (classCourse) => classCourse.id
      );

      let threads;
      // get all threads from the deleted teacher's classCourses
      if (classCoursesIds.length > 30) {
        const classCourseIdsBatches = splitArrayIntoChunks(classCoursesIds, 30);
        const getThreadsBatches = [];
        classCourseIdsBatches.forEach((classCourseIdsBatch) => {
          getThreadsBatches.push(
            getThreadsByClassCourseIdsFromDB(classCourseIdsBatch)
          );
        });

        const fetchedThreadBatches = await Promise.all(getThreadsBatches);
        threads = fetchedThreadBatches.flat();
      } else {
        threads = await getThreadsByClassCourseIdsFromDB(classCoursesIds);
      }

      // get all replies from the deleted teacher's classCourses
      const threadIds = threads.map((thread) => thread.id);
      let replies;
      if (threadIds.length > 30) {
        const threadIdsBatches = splitArrayIntoChunks(threadIds, 30);
        const getRepliesBatches = [];
        threadIdsBatches.forEach((threadIdsBatch) => {
          getRepliesBatches.push(getRepliesByThreadIdsFromDB(threadIdsBatch));
        });

        const fetchedReplyBatches = await Promise.all(getRepliesBatches);
        replies = fetchedReplyBatches.flat();
      } else {
        replies = await getRepliesByThreadIdsFromDB(threadIds);
      }

      // get all agendas from the deleted teacher's classCourses
      let agendas;
      if (classCoursesIds.length > 30) {
        const classCourseIdsBatches = splitArrayIntoChunks(classCoursesIds, 30);
        const getAgendaBatches = [];
        classCourseIdsBatches.forEach((classCourseIdsBatch) => {
          getAgendaBatches.push(
            getAgendasByClassCourseIdsFromDB(classCourseIdsBatch)
          );
        });

        const fetchedAgendaBatches = await Promise.all(getAgendaBatches);
        agendas = fetchedAgendaBatches.flat();
      } else {
        agendas = await getAgendasByClassCourseIdsFromDB(classCoursesIds);
      }

      // get all topics from deleted teacher's classCourses
      let topics;
      if (classCoursesIds.length > 30) {
        const classCourseIdsBatches = splitArrayIntoChunks(classCoursesIds, 30);
        const getTopicBatches = [];
        classCourseIdsBatches.forEach((classCourseIdsBatch) => {
          getTopicBatches.push(
            getTopicsByClassCourseIdsFromDB(classCourseIdsBatch)
          );
        });

        const fetchedTopicBatches = await Promise.all(getTopicBatches);
        topics = fetchedTopicBatches.flat();
      } else {
        topics = await getTopicsByClassCourseIdsFromDB(classCoursesIds);
      }

      // get all assignments from deleted teacher's class courses
      let assignments;
      if (classCoursesIds.length > 30) {
        const classCourseIdsBatches = splitArrayIntoChunks(classCoursesIds, 30);
        const getAssignmentBatches = [];
        classCourseIdsBatches.forEach((classCourseIdsBatch) => {
          getAssignmentBatches.push(
            getAssignmentsByClassCourseIdsFromDB(classCourseIdsBatch)
          );
        });

        const fetchedAssignmentBatches = await Promise.all(
          getAssignmentBatches
        );
        assignments = fetchedAssignmentBatches.flat();
      } else {
        assignments = await getAssignmentsByClassCourseIdsFromDB(
          classCoursesIds
        );
      }

      // get all answers from deleted teacher's class courses
      let answers;
      const assignmentIds = assignments.map((assignment) => assignment.id);

      if (assignmentIds.length > 30) {
        const assignmentIdsBatches = splitArrayIntoChunks(assignmentIds, 30);
        const getAnswerBatches = [];
        assignmentIdsBatches.forEach((assignmentIdsBatch) => {
          getAnswerBatches.push(
            getAnswersByAssignmentIdsFromDB(assignmentIdsBatch)
          );
        });

        const fetchedAnswerBatches = await Promise.all(getAnswerBatches);
        answers = fetchedAnswerBatches.flat();
      } else {
        answers = await getAnswersByAssignmentIdsFromDB(assignmentIds);
      }

      // get all scores from deleted teacher's classcourses
      let scores;
      if (classCoursesIds.length > 30) {
        const classCourseIdsBatches = splitArrayIntoChunks(classCoursesIds, 30);
        const getScoreBatches = [];
        classCourseIdsBatches.forEach((classCourseIdsBatch) => {
          getScoreBatches.push(
            getScoresByClassCourseIdsFromDB(classCourseIdsBatch)
          );
        });

        const fetchedScoreBatches = await Promise.all(getScoreBatches);
        scores = fetchedScoreBatches.flat();
      } else {
        scores = await getScoresByClassCourseIdsFromDB(classCoursesIds);
      }

      // get all student scores from deleted teacher's classcourses
      const scoreIds = scores.map((score) => score.id);
      let studentScores;
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
        studentScores = fetchedStudentScoreBatches.flat();
      } else {
        studentScores = await getStudentScoresByScoreIdFromDB(scoreIds);
      }

      // get all announcements from deleted teacher's class courses
      let announcements;
      if (classCoursesIds.length > 30) {
        const classCourseIdsBatches = splitArrayIntoChunks(classCoursesIds, 30);
        const getAnnouncementBatches = [];
        classCourseIdsBatches.forEach((classCourseIdsBatch) => {
          getAnnouncementBatches.push(
            getAnnouncementsByClassCourseIdsFromDB(classCourseIdsBatch)
          );
        });

        const fetchedAnnouncementBatches = await Promise.all(
          getAnnouncementBatches
        );
        announcements = fetchedAnnouncementBatches.flat();
      } else {
        announcements = await getAnnouncementsByClassCourseIdsFromDB(
          classCoursesIds
        );
      }

      const deleteRequests = [];
      // delete all topics and material attachment
      topics.forEach((topic) => {
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
      assignments.forEach((assignment) => {
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
      answers.forEach((answer) => {
        deleteRequests.push(
          deleteFile(`/answer-attachments/${answer.id}/${answer.attachment}`)
        );
        deleteRequests.push(deleteAnswerInDB(answer.id));
      });

      // delete all scores
      scores.forEach((score) => {
        deleteRequests.push(deleteScoreInDB(score.id));
      });

      // delete all student scores
      studentScores.forEach((studentScore) => {
        deleteRequests.push(deleteStudentScoreInDB(studentScore.id));
      });

      // delete all announcements
      announcements.forEach((announcement) => {
        deleteRequests.push(deleteAnnouncementInDB(announcement.id));
      });

      // delete all threads
      threads.forEach((thread) => {
        Object.entries(thread.attachments).forEach(([fileId, fileName]) => {
          deleteRequests.push(
            deleteFile(`/thread-attachments/${fileId}/${fileName}`)
          );
        });
        deleteRequests.push(deleteThreadInDB(thread.id));
      });

      // delete all replies
      replies.forEach((reply) => {
        Object.entries(reply.attachments).forEach(([fileId, fileName]) => {
          deleteRequests.push(
            deleteFile(`/reply-attachments/${fileId}/${fileName}`)
          );
        });
        deleteRequests.push(deleteReplyInDB(reply.id));
      });

      // delete all agendas
      agendas.forEach((agenda) => {
        deleteRequests.push(deleteAgendaInDB(agenda.id));
      });

      // delete all classcourses
      classCoursesIds.forEach((classCourseId) => {
        deleteRequests.push(deleteClassCourseInDB(classCourseId));
      });

      // delete the teacher
      deleteRequests.push(deleteUserInDB(user.id));
      if (user.profileImage !== "/profile-image/default.jpg") {
        deleteRequests.push(deleteFile(`/profile-image/${user.id}`));
      }

      await Promise.all(deleteRequests);
      onSuccess(user.id);
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
          Apakah anda yakin ingin menghapus pengguna{" "}
          <b>
            {user.userNumber} - {user.fullname}
          </b>
          ?
        </Typography>
        <Stack direction="row" spacing={2}>
          <ThemedButton
            onClick={
              user.role === "student"
                ? handleDeleteStudent
                : handleDeleteTeacher
            }
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

export default DeleteUserDialog;
