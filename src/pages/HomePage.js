import { AutoStories, NavigateNextRounded } from "@mui/icons-material";
import {
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Loading from "../components/Loading";
import SuccessSnackbar from "../components/SuccessSnackbar";
import ThemedButton from "../components/ThemedButton";
import {
  getStudentClassCoursesFromDB,
  getTeacherClassCoursesFromDB,
} from "../database/classCourse";
import CreateClassCourseDialog from "./classCourse/CreateClassCourseDialog";
import JoinClassCourseDialog from "./classCourse/JoinClassCourseDialog";

const HomePage = () => {
  const location = useLocation();

  const [statusFilter, setStatusFilter] = useState("active");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [classCourses, setClassCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState(
    location.state?.justDeleted ? "Kelas berhasil dihapus" : ""
  );

  const user = useSelector((state) => state.user);

  const onStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const displayedClassCourses = useMemo(() => {
    if (statusFilter === "active") {
      return classCourses.filter((classCourse) => classCourse.isActive);
    } else if (statusFilter === "inactive") {
      return classCourses.filter((classCourse) => !classCourse.isActive);
    } else {
      return classCourses;
    }
  }, [classCourses, statusFilter]);

  useEffect(() => {
    async function getClassCourses() {
      try {
        setIsLoading(true);
        let fetchedClassCourses;
        if (user.role === "student") {
          fetchedClassCourses = await getStudentClassCoursesFromDB(user.id);
        } else {
          fetchedClassCourses = await getTeacherClassCoursesFromDB(user.id);
        }

        setClassCourses(fetchedClassCourses);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }

    getClassCourses();
  }, [user]);

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  return (
    <Stack minHeight="100vh" bgcolor="background.default" spacing={3}>
      <Header />
      <Stack spacing={3} flex={1}>
        <Typography textAlign="center" fontSize="20px">
          Daftar Kelas
        </Typography>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="end"
          px={4}
        >
          {user.role === "student" ? (
            <ThemedButton
              onClick={() => setIsJoinDialogOpen(true)}
              sx={{ px: { xs: 1.25, sm: 2.5 } }}
              size="small"
            >
              Gabung Kelas
            </ThemedButton>
          ) : (
            <ThemedButton
              onClick={() => setIsCreateDialogOpen(true)}
              sx={{ px: 2.5 }}
              size="small"
            >
              Buat Kelas
            </ThemedButton>
          )}
          <Stack alignItems="end">
            <Typography fontSize="14px">Status Kelas</Typography>
            <Select
              inputProps={{
                "aria-label": "Without label",
              }}
              sx={{
                bgcolor: "background.paper",
                "& .MuiSelect-select": {
                  py: "5px",
                },
                minWidth: "126px",
                textAlign: "center",
              }}
              value={statusFilter}
              onChange={onStatusFilterChange}
            >
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="inactive">Tidak Aktif</MenuItem>
              <MenuItem value="all">Semua</MenuItem>
            </Select>
          </Stack>
        </Stack>
        {isLoading ? (
          <Stack
            justifyContent="center"
            alignItems="center"
            flex={1}
            mt="0 !important"
          >
            <Loading />
          </Stack>
        ) : (
          <Grid
            px={4}
            pb={4}
            container
            columnSpacing={{ xs: 0, sm: 4, md: 8, lg: 12, xl: 16 }}
          >
            {displayedClassCourses.map((classCourse) => (
              <ClassCourseItem key={classCourse.id} classCourse={classCourse} />
            ))}
          </Grid>
        )}
      </Stack>
      <CreateClassCourseDialog
        open={isCreateDialogOpen}
        setOpen={setIsCreateDialogOpen}
      />
      <JoinClassCourseDialog
        open={isJoinDialogOpen}
        setOpen={setIsJoinDialogOpen}
      />
      <SuccessSnackbar
        text={successSnackbarMsg}
        onClose={handleCloseSuccessSnackbar}
      />
    </Stack>
  );
};

const ClassCourseItem = ({ classCourse }) => {
  const navigate = useNavigate();

  const onViewClassCourse = () => {
    navigate(`/class-courses/${classCourse.id}`);
  };
  return (
    <Grid xs={12} sm={6} mb={4}>
      <Paper elevation={3}>
        <Stack direction="row" pr={2} justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Stack
              bgcolor="#A4DBFB"
              justifyContent="center"
              alignItems="center"
              height={1}
              boxSizing="border-box"
              px={{
                xs: 1,
                sm: 1.5,
              }}
              sx={{
                borderTopLeftRadius: "4px",
                borderBottomLeftRadius: "4px",
              }}
            >
              <AutoStories sx={{ color: "#fff", fontSize: "36px" }} />
            </Stack>
            <Stack py={2}>
              <Typography>{classCourse.className}</Typography>
              <Typography>{classCourse.courseName}</Typography>
              <Typography fontSize="12px">{classCourse.schoolYear}</Typography>
              <Typography fontSize="12px">
                Status Kelas:{" "}
                <Typography
                  component="span"
                  fontSize="12px"
                  fontWeight={600}
                  color={classCourse.isActive ? "#44a716" : "#e01d33"}
                >
                  {classCourse.isActive ? "Aktif" : "Tidak Aktif"}
                </Typography>
              </Typography>
            </Stack>
          </Stack>

          <Stack justifyContent="center">
            <IconButton onClick={onViewClassCourse}>
              <NavigateNextRounded sx={{ color: "#000", fontSize: "32px" }} />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>
    </Grid>
  );
};

export default HomePage;
