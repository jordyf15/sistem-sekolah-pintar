import { AttachmentRounded } from "@mui/icons-material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { IconButton, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { deleteFile, uploadFile } from "../../cloudStorage/cloudStorage";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import {
  addAnswerToDb,
  getAnswerByIdFromDB,
  getAssignmentByIdFromDB,
} from "../../database/assignment";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { checkUserAccess, formatDateToString } from "../../utils/utils";
import CreateFileItem from "./CreateFileItem";
import ViewFileItem from "./ViewFileItem";

const StudentAssignmentDetail = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { classCourseId, assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [classCourse, setClassCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUploadAnswer, setIsLoadingUploadAnswer] = useState(false);
  const [prevAnswer, setPrevAnswer] = useState(null);
  const [answerAttachment, setAnswerAttachment] = useState(null);
  const [answerAttachmentError, setAnswerAttachmentError] = useState("");
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");

  useEffect(() => {
    async function getAssignmentDetail() {
      setIsLoading(true);
      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);

        checkUserAccess(user, fetchedClassCourse, navigate);

        const fetchedAssignment = await getAssignmentByIdFromDB(assignmentId);
        setAssignment(fetchedAssignment);

        const fetchedPrevAnswer = await getAnswerByIdFromDB(
          `${assignmentId}-${user.id}`
        );
        setPrevAnswer(fetchedPrevAnswer);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }

    getAssignmentDetail();
  }, [classCourseId, assignmentId, user, navigate]);

  const validateAnswerAttachment = (newAnswerAttachment) => {
    if (!newAnswerAttachment) {
      setAnswerAttachmentError("Masukkan file");
      return false;
    } else if (newAnswerAttachment.size > 10e6) {
      setAnswerAttachmentError("Ukuran file tidak boleh lebih dari 10MB");
      return false;
    } else {
      setAnswerAttachmentError("");
      return true;
    }
  };

  const onFileUpload = (e) => {
    if (!e.target.files) return;

    const file = e.target.files[0];

    setAnswerAttachment(file);
    validateAnswerAttachment(file);

    e.target.value = "";
  };

  const onRemoveFile = () => {
    setAnswerAttachment(null);
    setAnswerAttachmentError("Masukkan file");
  };

  const handleSubmit = async () => {
    if (!validateAnswerAttachment(answerAttachment)) return;

    setIsLoadingUploadAnswer(true);

    try {
      if (prevAnswer) {
        await deleteFile(
          `/answer-attachments/${assignmentId}-${user.id}/${prevAnswer.attachment}`
        );
      }

      await uploadFile(
        answerAttachment,
        `/answer-attachments/${assignmentId}-${user.id}/${answerAttachment.name}`
      );

      const addedAnswer = {
        id: `${assignmentId}-${user.id}`,
        assignmentId: assignmentId,
        studentId: user.id,
        attachment: answerAttachment.name,
        createdAt: new Date(),
      };

      await addAnswerToDb(addedAnswer);
      setPrevAnswer(addedAnswer);
      setAnswerAttachment(null);
      setSuccessSnackbarMsg("Jawaban berhasil dikumpul");
    } catch (error) {
      console.log("error");
    }

    setIsLoadingUploadAnswer(false);
  };

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  return (
    <Stack
      minHeight="100vh"
      bgcolor="background.default"
      spacing={!isLoading ? 3 : 0}
    >
      <Header />
      {!isLoading ? (
        <Stack
          spacing={2}
          px={{
            xs: 2,
            sm: 4,
            md: 6,
            lg: 8,
            xl: 10,
          }}
        >
          <BackButton
            onClick={() =>
              navigate(`/class-courses/${classCourseId}/assignments/`)
            }
          />
          <Typography
            textAlign="center"
            fontSize={{
              xs: "18px",
              md: "20px",
            }}
          >
            Detail Tugas
            <br />
            {`${classCourse.className} ${classCourse.courseName}`}
          </Typography>
          <Stack alignItems="center" mt="32px !important" px={2} pb={4}>
            <Paper elevation={3} sx={{ maxWidth: "900px", width: 1, p: 2 }}>
              <Stack spacing={1} alignItems="flex-start">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AssignmentIcon sx={{ fontSize: "48px" }} />

                  <Stack>
                    <Typography fontWeight="bold">
                      {assignment.title}
                    </Typography>
                    <Typography fontSize="14px">
                      Batas Waktu: {formatDateToString(assignment.deadline)}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack>
                  <Typography>Deskripsi:</Typography>
                  <Typography whiteSpace="pre-wrap" fontSize="14px">
                    {assignment.description}
                  </Typography>
                </Stack>

                {assignment.attachment && (
                  <>
                    <Typography>Lampiran Tugas: </Typography>
                    <Grid sx={{ width: 1 }} container>
                      <ViewFileItem
                        name={assignment.attachment}
                        filePath={`/assignment-attachments/${assignment.id}/${assignment.attachment}`}
                      />
                    </Grid>
                  </>
                )}
                {prevAnswer && (
                  <>
                    <Typography>Jawaban Sebelumnya: </Typography>
                    <Grid sx={{ width: 1 }} container>
                      <ViewFileItem
                        name={prevAnswer.attachment}
                        filePath={`/answer-attachments/${assignment.id}-${user.id}/${prevAnswer.attachment}`}
                      />
                    </Grid>
                  </>
                )}
                {assignment.deadline > new Date() && (
                  <>
                    <Typography>Kumpul Jawaban</Typography>
                    <Stack alignItems="flex-start" mb={2}>
                      <input
                        id="file-input"
                        type="file"
                        hidden
                        onChange={onFileUpload}
                      />
                      <label htmlFor="file-input">
                        <IconButton component="span">
                          <AttachmentRounded sx={{ color: "#000" }} />
                        </IconButton>
                      </label>
                    </Stack>
                  </>
                )}

                <Grid sx={{ width: 1 }} container>
                  <CreateFileItem
                    name={answerAttachment ? answerAttachment.name : ""}
                    error={answerAttachmentError}
                    onRemove={onRemoveFile}
                  />
                </Grid>

                {assignment.deadline > new Date() && (
                  <ThemedButton
                    onClick={() => handleSubmit()}
                    sx={{ px: 2.5 }}
                    size="small"
                    disabled={isLoadingUploadAnswer}
                  >
                    Kumpul
                  </ThemedButton>
                )}
              </Stack>
            </Paper>
          </Stack>
          <SuccessSnackbar
            text={successSnackbarMsg}
            onClose={handleCloseSuccessSnackbar}
          />
        </Stack>
      ) : (
        <Stack justifyContent="center" alignItems="center" flex={1}>
          <Loading />
        </Stack>
      )}
    </Stack>
  );
};

export default StudentAssignmentDetail;
