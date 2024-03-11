import {
  DeleteForeverRounded,
  EditRounded,
  Groups,
  MoreVertRounded,
} from "@mui/icons-material";
import {
  IconButton,
  Menu,
  MenuItem,
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
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import {
  getClassCourseScoresFromDB,
  getStudentScoresByScoreIdFromDB,
} from "../../database/score";
import { getUserByIdsFromDB } from "../../database/user";
import { splitArrayIntoChunks } from "../../utils/utils";
import AddScoreDialog from "./AddScoreDialog";
import DeleteScoreDialog from "./DeleteScoreDialog";
import DeleteStudentScoreDialog from "./DeleteStudentScoreDialog";
import EditScoreDialog from "./EditScoreDialog";
import InputStudentScoreDialog from "./InputStudentScoreDialog";

const tableCellStyle = {
  borderRight: "1px solid #000",
  borderBottom: "1px solid #000",
  pl: 2,
  pr: 0,
  py: 0,
  width: "150px",
  boxSizing: "border-box",
  minWidth: "145px",
  bgcolor: "#fff",
  height: "45px",
};

const TeacherScorePage = () => {
  const navigate = useNavigate();
  const { id: classCourseId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [classCourse, setClassCourse] = useState(null);
  const [scores, setScores] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentScores, setStudentScores] = useState([]);
  const [isAddScoreDialogOpen, setIsAddScoreDialogOpen] = useState(false);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");

  const onSetStudents = (newStudents) => {
    setStudents(
      newStudents.sort((a, b) =>
        a.fullname > b.fullname ? 1 : b.fullname > a.fullname ? -1 : 0
      )
    );
  };

  const studentScoreMap = useMemo(() => {
    const tempMap = new Map();
    studentScores.forEach((studentScore) => {
      tempMap.set(
        `${studentScore.scoreId}|${studentScore.studentId}`,
        studentScore
      );
    });

    return tempMap;
  }, [studentScores]);

  const scoreMap = useMemo(() => {
    const tempMap = new Map();
    scores.forEach((score) => tempMap.set(score.id, score));

    return tempMap;
  }, [scores]);

  const studentMap = useMemo(() => {
    const tempMap = new Map();
    students.forEach((student) => tempMap.set(student.id, student));

    return tempMap;
  }, [students]);

  useEffect(() => {
    async function getClassCourseScores() {
      setIsLoading(true);
      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);

        const fetchedScores = await getClassCourseScoresFromDB(classCourseId);
        setScores(fetchedScores);

        const fetchedScoreIds = fetchedScores.map((score) => score.id);
        let fetchedStudentScores;

        if (fetchedScoreIds.length > 30) {
          const scoreIdsBatches = splitArrayIntoChunks(fetchedScoreIds, 30);

          const getStudentScoreBatches = [];
          scoreIdsBatches.forEach((scoreIdBatch) => {
            getStudentScoreBatches.push(
              getStudentScoresByScoreIdFromDB(scoreIdBatch)
            );
          });

          const fetchedStudentScoreBatches = await Promise.all(
            getStudentScoreBatches
          );
          setStudentScores(fetchedStudentScoreBatches.flat());
        } else {
          fetchedStudentScores = await getStudentScoresByScoreIdFromDB(
            fetchedScoreIds
          );

          setStudentScores(fetchedStudentScores);
        }

        if (fetchedClassCourse.studentIds.length > 30) {
          const studentIdBatches = splitArrayIntoChunks(
            fetchedClassCourse.studentIds,
            30
          );

          const getStudentBatches = [];
          studentIdBatches.forEach((studentIdBatch) =>
            getStudentBatches.push(getUserByIdsFromDB(studentIdBatch))
          );

          const fetchedStudentBatches = await Promise.all(getStudentBatches);
          onSetStudents(fetchedStudentBatches.flat());
        } else {
          const fetchedStudents = await getUserByIdsFromDB(
            fetchedClassCourse.studentIds
          );
          onSetStudents(fetchedStudents);
        }
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    getClassCourseScores();
  }, [classCourseId]);

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  const handleSuccessAddScore = (score) => {
    setScores(scores.concat([score]));
    setSuccessSnackbarMsg("Kolom nilai berhasil ditambah");
  };

  const handleSuccessInputStudentScore = (inputtedStudentScore) => {
    const oldStudentScore = studentScores.filter(
      (studentScore) => studentScore.id === inputtedStudentScore.id
    )[0];
    if (oldStudentScore) {
      setStudentScores(
        studentScores.map((studentScore) =>
          studentScore.id === inputtedStudentScore.id
            ? inputtedStudentScore
            : studentScore
        )
      );
    } else {
      setStudentScores(studentScores.concat([inputtedStudentScore]));
    }

    setSuccessSnackbarMsg("Nilai murid berhasil diisi");
  };

  const handleSuccessEditScore = (scoreId, scoreName) => {
    const editedScore = scores.filter((score) => score.id === scoreId)[0];

    editedScore.name = scoreName;

    setScores(
      scores.map((score) => (score.id === scoreId ? editedScore : score))
    );
    setSuccessSnackbarMsg("Kolom nilai berhasil diedit");
  };

  const handleSuccessDeleteStudentScore = (studentScoreId) => {
    setStudentScores(
      studentScores.filter((studentScore) => studentScore.id !== studentScoreId)
    );
    setSuccessSnackbarMsg("Nilai murid berhasil dihapus");
  };

  const handleSuccessDeleteScore = (scoreId) => {
    setStudentScores(
      studentScores.filter((studentScore) => studentScore.scoreId !== scoreId)
    );
    setScores(scores.filter((score) => score.id !== scoreId));
    setSuccessSnackbarMsg("Kolom nilai berhasil dihapus");
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
          pb={4}
        >
          <BackButton
            onClick={() => navigate(`/class-courses/${classCourseId}`)}
          />
          <Typography
            textAlign="center"
            fontSize={{
              xs: "18px",
              md: "20px",
            }}
          >
            Nilai
            <br />
            {`${classCourse.className} ${classCourse.courseName}`}
          </Typography>
          <Stack alignItems="flex-end">
            <ThemedButton
              sx={{ px: 2.5 }}
              size="small"
              onClick={() => setIsAddScoreDialogOpen(true)}
            >
              Tambah Kolom Nilai
            </ThemedButton>
          </Stack>
          <TableContainer component={Paper}>
            <Table
              sx={{
                borderCollapse: "separate",
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      "&.MuiTableCell-root": {
                        ...tableCellStyle,
                        position: "sticky",
                        left: 0,
                        zIndex: 5,
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Groups />
                      <Typography>Murid</Typography>
                    </Stack>
                  </TableCell>
                  {scores.map((score) => (
                    <ScoreItem
                      score={score}
                      key={score.id}
                      classCourse={classCourse}
                      setClassCourse={setClassCourse}
                      studentScoreIds={studentScores
                        .filter(
                          (studentScore) => studentScore.scoreId === score.id
                        )
                        .map((studentScore) => studentScore.id)}
                      onDeleteScoreSuccess={handleSuccessDeleteScore}
                      onEditScoreSuccess={handleSuccessEditScore}
                    />
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell
                      sx={{
                        "&.MuiTableCell-root": {
                          ...tableCellStyle,
                          position: "sticky",
                          left: 0,
                          zIndex: 5,
                        },
                      }}
                    >
                      {student.fullname}
                    </TableCell>
                    {scores.map((score) => (
                      <StudentScoreItem
                        key={`${student.id}-${score.id}`}
                        studentScore={
                          studentScoreMap.has(`${score.id}|${student.id}`)
                            ? studentScoreMap.get(`${score.id}|${student.id}`)
                            : null
                        }
                        scoreObj={scoreMap.get(score.id)}
                        student={studentMap.get(student.id)}
                        classCourse={classCourse}
                        setClassCourse={setClassCourse}
                        onInputSuccess={handleSuccessInputStudentScore}
                        onDeleteSuccess={handleSuccessDeleteStudentScore}
                      />
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <AddScoreDialog
            open={isAddScoreDialogOpen}
            setOpen={setIsAddScoreDialogOpen}
            onSuccess={handleSuccessAddScore}
            classCourse={classCourse}
            setClassCourse={setClassCourse}
          />
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

const ScoreItem = ({
  score,
  onEditScoreSuccess,
  studentScoreIds,
  classCourse,
  setClassCourse,
  onDeleteScoreSuccess,
}) => {
  const [isDeleteScoreDialogOpen, setIsDeleteScoreDialogOpen] = useState(false);
  const [isEditScoreDialogOpen, setIsEditScoreDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  return (
    <TableCell
      sx={{
        "&.MuiTableCell-root": {
          ...tableCellStyle,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography>{score.name}</Typography>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setMenuAnchorEl(e.currentTarget);
          }}
        >
          <MoreVertRounded sx={{ color: "#000", fontSize: "28px" }} />
        </IconButton>
      </Stack>
      <Menu onClose={handleCloseMenu} anchorEl={menuAnchorEl} open={isMenuOpen}>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setIsEditScoreDialogOpen(true);
          }}
        >
          Edit Kolom Nilai
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setIsDeleteScoreDialogOpen(true);
          }}
        >
          Hapus Kolom Nilai
        </MenuItem>
      </Menu>
      <EditScoreDialog
        open={isEditScoreDialogOpen}
        setOpen={setIsEditScoreDialogOpen}
        score={score}
        classCourse={classCourse}
        setClassCourse={setClassCourse}
        onSuccess={onEditScoreSuccess}
      />
      <DeleteScoreDialog
        open={isDeleteScoreDialogOpen}
        setOpen={setIsDeleteScoreDialogOpen}
        score={score}
        classCourse={classCourse}
        setClassCourse={setClassCourse}
        onSuccess={onDeleteScoreSuccess}
        studentScoreIds={studentScoreIds}
      />
    </TableCell>
  );
};

const StudentScoreItem = ({
  studentScore,
  onInputSuccess,
  onDeleteSuccess,
  scoreObj,
  classCourse,
  setClassCourse,
  student,
}) => {
  const [isInputStudentScoreDialogOpen, setIsInputStudentScoreDialogOpen] =
    useState(false);
  const [isDeleteStudentScoreDialogOpen, setIsDeleteStudentScoreDialogOpen] =
    useState(false);

  return (
    <TableCell
      sx={{
        "&.MuiTableCell-root": {
          ...tableCellStyle,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography>{studentScore ? studentScore.score : ""}</Typography>
        <Stack direction="row" alignItems="center">
          <IconButton onClick={() => setIsInputStudentScoreDialogOpen(true)}>
            <EditRounded sx={{ color: "#000", fontSize: "20px" }} />
          </IconButton>
          {studentScore && (
            <IconButton onClick={() => setIsDeleteStudentScoreDialogOpen(true)}>
              <DeleteForeverRounded sx={{ color: "#000", fontSize: "20px" }} />
            </IconButton>
          )}
        </Stack>
      </Stack>
      <InputStudentScoreDialog
        open={isInputStudentScoreDialogOpen}
        setOpen={setIsInputStudentScoreDialogOpen}
        studentScore={studentScore}
        onSuccess={onInputSuccess}
        scoreObj={scoreObj}
        classCourse={classCourse}
        setClassCourse={setClassCourse}
        student={student}
      />
      {studentScore && (
        <DeleteStudentScoreDialog
          open={isDeleteStudentScoreDialogOpen}
          setOpen={setIsDeleteStudentScoreDialogOpen}
          scoreName={scoreObj.name}
          studentName={student.fullname}
          studentScoreId={studentScore.id}
          classCourse={classCourse}
          setClassCourse={setClassCourse}
          onSuccess={onDeleteSuccess}
        />
      )}
    </TableCell>
  );
};

export default TeacherScorePage;
