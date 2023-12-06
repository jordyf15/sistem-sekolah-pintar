import { FileDownloadRounded } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import {
  getAssignmentAnswersFromDB,
  getAssignmentByIdFromDB,
} from "../../database/assignment";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { getUserByIdsFromDB } from "../../database/user";
import { formatDateToString, splitArrayIntoChunks } from "../../utils/utils";
import ViewFileItem from "./ViewFileItem";

const TeacherAssignmentDetail = () => {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const { classCourseId, assignmentId } = useParams();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [classCourse, setClassCourse] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState(
    location.state?.justCreated ? "Tugas berhasil dibuat" : ""
  );

  const studentMap = useMemo(() => {
    const tempMap = new Map();
    students.forEach((student) => tempMap.set(student.id, student));
    return tempMap;
  }, [students]);

  useEffect(() => {
    async function getAssignmentDetail() {
      setIsLoading(true);

      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);

        const fetchedAssignment = await getAssignmentByIdFromDB(assignmentId);
        setAssignment(fetchedAssignment);

        const fetchedAnswers = await getAssignmentAnswersFromDB(assignmentId);
        setAnswers(fetchedAnswers);

        let fetchedStudents;
        if (fetchedClassCourse.studentIds > 30) {
          const studentIdBatches = splitArrayIntoChunks(
            fetchedClassCourse.studentIds,
            30
          );
          const getStudentBatches = [];
          studentIdBatches.forEach((studentIdBatch) =>
            getStudentBatches.push(getUserByIdsFromDB(studentIdBatch))
          );

          const fetchedStudentBatches = await Promise.all(getStudentBatches);
          fetchedStudents = fetchedStudentBatches.flat();
        } else {
          fetchedStudents = await getUserByIdsFromDB(
            fetchedClassCourse.studentIds
          );
        }
        setStudents(fetchedStudents);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }

    getAssignmentDetail();
  }, [classCourseId, assignmentId]);

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
                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  alignItems={{ sm: "center" }}
                  justifyContent={{ sm: "space-between" }}
                  width={1}
                  spacing={{ xs: 1, sm: 0 }}
                >
                  <Typography fontWeight="bold">{assignment.title}</Typography>
                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <ThemedButton
                      onClick={() => setIsEditDialogOpen(true)}
                      sx={{ px: 2.5 }}
                      size="small"
                    >
                      Edit tugas
                    </ThemedButton>
                    <ThemedButton
                      onClick={() => setIsDeleteDialogOpen(true)}
                      sx={{ px: 2.5 }}
                      size="small"
                    >
                      Hapus Tugas
                    </ThemedButton>
                  </Stack>
                </Stack>
                <Typography fontSize="14px">
                  Batas Waktu: {formatDateToString(assignment.deadline)}
                </Typography>
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

                <TableContainer sx={{ mt: "32px !important" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            "&.MuiTableCell-root": {
                              border: "2px solid #000",
                            },
                          }}
                        >
                          <Typography textAlign="center">
                            Jawaban Murid
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {answers.map((answer) => (
                        <AnswerItem
                          key={answer.id}
                          answer={answer}
                          student={studentMap.get(answer.studentId)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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

const AnswerItem = ({ student, answer }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    async function getImgUrl() {
      const downloadUrl = await getFileDownloadLink(student.profileImage);
      setImageUrl(downloadUrl);
    }
    getImgUrl();
  }, [student]);

  return (
    <TableRow>
      <TableCell
        sx={{
          "&.MuiTableCell-root": {
            px: {
              xs: 1,
              sm: 2,
            },
            border: "2px solid #000",
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              width="32px"
              height="32px"
              borderRadius="50%"
              component="img"
              src={imageUrl}
              alt={`profile ${student.id}`}
            />
            <Stack>
              <Typography>{student.fullname}</Typography>
              <Typography fontSize="12px">
                {formatDateToString(answer.createdAt)}
              </Typography>
            </Stack>
          </Stack>
          <IconButton>
            <FileDownloadRounded sx={{ color: "#000" }} />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default TeacherAssignmentDetail;
