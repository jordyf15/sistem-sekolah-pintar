import { MoreVertRounded } from "@mui/icons-material";
import {
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { getClassCourseScoresFromDB } from "../../database/score";
import { getUserByIDFromDB } from "../../database/user";
import AddScoreDialog from "./AddScoreDialog";

const TeacherScorePage = () => {
  const navigate = useNavigate();
  const { id: classCourseId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [classCourse, setClassCourse] = useState(null);
  const [scores, setScores] = useState([]);
  const [students, setStudents] = useState([]);
  const [isAddScoreDialogOpen, setIsAddScoreDialogOpen] = useState(false);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");

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

        const getStudents = [];

        fetchedClassCourse.studentIds.forEach((studentId) => {
          getStudents.push(getUserByIDFromDB(studentId));
        });

        const fetchedStudents = await Promise.all(getStudents);
        setStudents(fetchedStudents);
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
          </Typography>{" "}
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
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Murid</TableCell>
                  {scores.map((score) => (
                    <ScoreItem score={score} key={score.id} />
                  ))}
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
          <AddScoreDialog
            open={isAddScoreDialogOpen}
            setOpen={setIsAddScoreDialogOpen}
            onSuccess={handleSuccessAddScore}
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

const ScoreItem = ({ score }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  return (
    <TableCell>
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
        <MenuItem>Edit Kolom Nilai</MenuItem>
        <MenuItem>Hapus Kolom Nilai</MenuItem>
      </Menu>
    </TableCell>
  );
};

export default TeacherScorePage;
