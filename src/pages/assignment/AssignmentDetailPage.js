import {
  AttachmentRounded,
  DownloadRounded,
  InsertDriveFileRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  deleteFile,
  getFileDownloadLink,
  uploadFile,
} from "../../cloudStorage/cloudStorage";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import ThemedButton from "../../components/ThemedButton";
import {
  addAnswerToDb,
  getAnswerByIdFromDB,
  getAssignmentAnswersFromDB,
  getAssignmentByIdFromDB,
} from "../../database/assignment";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { getUserByIDFromDB } from "../../database/user";
import { formatDateToString } from "../../utils/utils";
import DeleteAssignmentDialog from "./DeleteAssignmentDialog";
import EditAssignmentDialog from "./EditAssignmentDialog";

const AssignmentDetailPage = () => {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const { classCourseId, assignmentId } = useParams();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [assigment, setAssignment] = useState(null);
  const [editAssignmentStatus, setEditAssignmentStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [classCourse, setClassCourse] = useState(null);
  const [attachmentDownloadLink, setAttachmentDownloadLink] = useState("");
  const [prevAnswer, setPrevAnswer] = useState(null);
  const [newAnswerStatus, setNewAnswerStatus] = useState(true);
  const [prevAnswerLink, setPrevAnswerLink] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState(
    location.state?.justCreated ? "Tugas berhasil dibuat" : ""
  );
  const [students, setStudents] = useState(new Map());
  const [answers, setAnswers] = useState([]);

  const handleCloseCreateSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  const onEditAssignment = (e) => {
    setAssignment(e);
    setEditAssignmentStatus(false);
  };

  const onDownload = () => {
    const link = document.createElement("a");
    link.download = `${assigment.title}`;
    link.href = `${attachmentDownloadLink}`;
    link.click();
    return;
  };

  const onDownloadAnswer = () => {
    const link = document.createElement("a");

    if (prevAnswerLink !== "") {
      link.href = `${prevAnswerLink}`;
    } else {
      return;
    }

    link.click();
    return;
  };

  const onSubmitAnswer = () => {
    setAnswer("");
    setAnswerError("");
    setPrevAnswer(answer);
    setIsAnswerLoading(false);
    setNewAnswerStatus(false);
    setSuccessSnackbarMsg("Jabawan berhasil dikumpul");
  };

  const validateAnswer = (file) => {
    const dateNow = new Date();
    if (assigment.deadline < dateNow) {
      setAnswerError("sudah lewat deadline");
      return false;
    }
    if (!file) {
      console.log("tidak ada file");
      setAnswerError("lampirkan tugas");
      return false;
    }

    if (file.size >= 10e6) {
      setAnswerError("ukuran tugas harus dibawah 10MB");
      return false;
    }

    setAnswerError("");
    console.log("pass file vali9dation");
    return true;
  };

  const sumbitAnswer = async () => {
    let valid = true;

    if (!validateAnswer(answer)) {
      valid = false;
    }

    if (!valid) return;
    setIsAnswerLoading(true);

    try {
      //prevanswer from db delete storage

      if (prevAnswer != null) {
        const prevAnswerPath = `/answer/${assignmentId}/${user.id}/${prevAnswer.name}`;
        console.log("delete prev file");
        await deleteFile(prevAnswerPath);
      }

      const answerPath = `/answer/${assignmentId}/${user.id}/${answer.name}`;
      if (answer != null) {
        await uploadFile(answer, answerPath);
      }

      const addAnswer = {
        id: `${assignmentId}${user.id}`,
        assignmentId: assignmentId,
        studentId: user.id,
        attachment: answer.name,
        createdAt: new Date(),
      };

      await addAnswerToDb(addAnswer);
    } catch (error) {
      console.log("submit answer handle error");
    }

    onSubmitAnswer();
    navigate(`/class-courses/${classCourse.id}/assignments/${assignmentId}`);
  };
  const onAnswerUpload = (e) => {
    if (!e.target.files) return;
    const file = e.target.files[0];

    setAnswer(file);

    validateAnswer(file);

    e.target.value = "";
  };

  useEffect(() => {
    async function getAssignmentDetail() {
      setIsLoading(true);

      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);
        const fetchedAssignment = await getAssignmentByIdFromDB(assignmentId);

        setAssignment(fetchedAssignment.asg);

        if (fetchedAssignment.asg.attachment !== "") {
          const atch = await getFileDownloadLink(
            `/assignments-attachment/${assignmentId}/${fetchedAssignment.asg.attachment}`
          );
          setAttachmentDownloadLink(atch);
        }

        if (user.role === "student") {
          const fetchedAnswer = await getAnswerByIdFromDB(
            `${assignmentId}${user.id}`
          );
          if (fetchedAnswer != null) {
            setPrevAnswer(fetchedAnswer);
            const answerlink = await getFileDownloadLink(
              `/answer/${assignmentId}/${user.id}/${fetchedAnswer.name}`
            );
            setPrevAnswerLink(answerlink);
          }
        } else if (user.role === "teacher") {
          const fetchedAnswers = await getAssignmentAnswersFromDB(assignmentId);
          setAnswers(fetchedAnswers);

          const studentsIds = new Set();
          fetchedAnswers.forEach((answer) => {
            studentsIds.add(answer.studentId);
          });

          const getUsers = Array.from(studentsIds).map((studentId) =>
            getUserByIDFromDB(studentId)
          );

          const users = await Promise.all(getUsers);

          const studentMap = new Map();

          users.forEach((user) => {
            studentMap.set(user.id, user);
          });
          setStudents(studentMap);
        }
      } catch (error) {
        console.log(error);
      }

      setIsLoading(false);
    }

    getAssignmentDetail();
    //passDeadline();
  }, [classCourseId]);

  return (
    <Stack spacing={3} bgcolor="background.default" minHeight="100vh">
      <Header />
      {!isLoading ? (
        <Stack
          spacing={4}
          px={{
            xs: 2,
            sm: 4,
            md: 6,
            lg: 8,
            xl: 10,
          }}
        >
          <Stack spacing={2}>
            <BackButton
              onClick={() => {
                navigate(`/class-courses/${classCourseId}/assignments`);
              }}
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

            {user.role === "teacher" && (
              <Stack direction="row-reverse" spacing={2}>
                <ThemedButton
                  onClick={() => setIsDeleteDialogOpen(true)}
                  sx={{ px: 2.5 }}
                  size="small"
                >
                  Hapus Tugas
                </ThemedButton>
                <ThemedButton
                  onClick={() => setIsEditDialogOpen(true)}
                  sx={{ px: 2.5 }}
                  size="small"
                >
                  Edit tugas
                </ThemedButton>
              </Stack>
            )}

            <Stack px={{ xs: 0, sm: 4 }} spacing={2}>
              <Typography fontWeight="bold">{assigment.title}</Typography>

              <Typography fontSize="12px">
                Batas Waktu: {formatDateToString(assigment.deadline)}
              </Typography>

              <Typography fontSize="10px">
                Deskripsi {assigment.title}:
                <br />
                {assigment.description}
              </Typography>

              <Typography fontSize="20px">Lampiran Tugas:</Typography>
              {/* {console.log("atca",attachmentDownloadLink)} */}

              {assigment.attachment ? (
                <Stack>
                  <Grid container>
                    <FileItem
                      name={`${assigment.attachment}`}
                      onDownload={() => {
                        onDownload();
                      }}
                      newAnswerStatus={editAssignmentStatus}
                    />
                  </Grid>
                </Stack>
              ) : (
                <Typography>Tidak ada Lampiran</Typography>
              )}

              {user.role === "teacher" && (
                <Stack>
                  <Stack
                    border={1}
                    alignItems="center"
                    display="flex"
                    bgcolor={"white"}
                  >
                    <Typography fontSize="20px">Jawaban murid</Typography>
                  </Stack>

                  <Stack pb={4}>
                    {answers.map((answer) => (
                      <AnswerItem
                        key={answer.studentId}
                        answer={answer}
                        student={students.get(answer.studentId)}
                        assignmentId={assignmentId}
                      />
                    ))}
                  </Stack>
                </Stack>
              )}

              {user.role === "student" && (
                <Stack>
                  <Typography fontSize="20px">Jawaban Sebelumnya:</Typography>
                  {prevAnswer && (
                    <Stack>
                      <Grid container>
                        <FileItem
                          name={`${prevAnswer.name}`}
                          onDownload={() => {
                            onDownloadAnswer();
                          }}
                          newAnswerStatus={newAnswerStatus}
                        />
                      </Grid>
                    </Stack>
                  )}

                  <Typography fontSize="20px">Kumpul Jawaban</Typography>
                  <Stack
                    alignItems="flex-start"
                    mb={2}
                    onChange={onAnswerUpload}
                  >
                    <input id="file-input" type="file" hidden />
                    <label htmlFor="file-input">
                      <IconButton component="span">
                        <AttachmentRounded sx={{ color: "#000" }} />
                      </IconButton>
                    </label>
                  </Stack>

                  {answerError && (
                    <Typography color="crimson">{answerError}</Typography>
                  )}
                  <Stack direction="row">
                    <ThemedButton
                      onClick={() => sumbitAnswer()}
                      sx={{ px: 2.5 }}
                      size="small"
                      disabled={isAnswerLoading}
                    >
                      Kumpul
                    </ThemedButton>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Stack>
          <EditAssignmentDialog
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            assignmentId={assignmentId}
            assignment={assigment}
            onEditAssignment={onEditAssignment}
            Snackbar={setSuccessSnackbarMsg}
          />
          <DeleteAssignmentDialog
            open={isDeleteDialogOpen}
            setOpen={setIsDeleteDialogOpen}
            assignment={assigment}
            assignmentId={assignmentId}
          />
        </Stack>
      ) : (
        <Stack justifyContent="center" alignItems="center" flex={1}>
          <Loading />
        </Stack>
      )}

      <Snackbar
        open={!!successSnackbarMsg}
        autoHideDuration={3000}
        onClose={handleCloseCreateSuccessSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseCreateSuccessSnackbar} severity="success">
          {successSnackbarMsg}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

const AnswerItem = ({ answer, student, assignmentId }) => {
  const [studentImgUrl, setStudentImgUrl] = useState("");
  const [downloadLink, setDownloadLink] = useState("");

  const onDownload = () => {
    const link = document.createElement("a");
    link.href = `${downloadLink}`;
    link.click();
    return;
  };

  useEffect(() => {
    if (!student) return;
    async function getImgUrl() {
      const imgUrl = await getFileDownloadLink(student.profileImage);
      setStudentImgUrl(imgUrl);
    }
    async function getAnswerLink() {
      const answerlink = await getFileDownloadLink(
        `/answer/${assignmentId}/${student.id}/${answer.name}`
      );
      setDownloadLink(answerlink);
    }

    getImgUrl();

    getAnswerLink();
  }, [student]);

  return (
    <Paper variant="outlined" square sx={{ borderColor: "#000000" }}>
      <Stack
        p={2}
        direction="row"
        position="relative"
        justifyContent="space-between"
        spacing={1}
      >
        <Stack mb={1} direction="row" alignItems="center" spacing={1}>
          <Box
            width="40px"
            height="40px"
            borderRadius="50%"
            component="img"
            src={studentImgUrl}
            alt={`profile ${student.id}`}
          />
          <Stack>
            <Typography>{student.fullname}</Typography>
          </Stack>
        </Stack>
        <Stack>
          <IconButton sx={{ p: 1 }} onClick={() => onDownload()}>
            <DownloadRounded sx={{ color: "rgba(0,0,0,0.5)" }} />
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
};

//delete tugas dialog

//edit icon deletenya jadi download done
const FileItem = ({ name, onDownload, newAnswerStatus }) => {
  const isSmallMobile = useMediaQuery("(max-width:400px)");
  const content = (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      py={1}
      pl={1}
      borderRadius="8px"
      sx={{
        boxSizing: "border-box",
        border: "3px solid rgba(0,0,0,0.5)",
        color: "rgba(0,0,0,0.5)",
        bgcolor: "background.paper",
      }}
      spacing={1}
      mb={2}
    >
      <InsertDriveFileRounded />
      <Typography fontSize="14px" noWrap>
        {name}
      </Typography>
      {newAnswerStatus ? (
        <IconButton sx={{ p: 1 }} onClick={() => onDownload()}>
          <DownloadRounded sx={{ color: "rgba(0,0,0,0.5)" }} />
        </IconButton>
      ) : (
        <Stack></Stack>
      )}
    </Stack>
  );

  return (
    <Grid xs={isSmallMobile ? 12 : 6} sm={4} md={3}>
      {content}
    </Grid>
  );
};

export default AssignmentDetailPage;
