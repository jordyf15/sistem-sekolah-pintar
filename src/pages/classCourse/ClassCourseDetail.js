import { MoreVertRounded } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import assignmentIcon from "../../assets/icons/assignment.png";
import forumIcon from "../../assets/icons/forum.png";
import materialIcon from "../../assets/icons/material.png";
import progressIcon from "../../assets/icons/progress.png";
import scoreIcon from "../../assets/icons/score.png";
import studentIcon from "../../assets/icons/student.png";
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { getUserByIDFromDB } from "../../database/user";
import EditClassCourseDialog from "./EditClassCourseDialog";

const ClassCourseDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state) => state.user);
  const { id: classCourseId } = useParams();

  const [classCourse, setClassCourse] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [teacherImgUrl, setTeacherImgUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState(
    location.state?.justCreated
      ? "Kelas berhasil dibuat"
      : location.state?.justJoined
      ? "Berhasil gabung ke kelas"
      : ""
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isMenuOpen = Boolean(anchorEl);

  useEffect(() => {
    async function getClassCourse() {
      setIsLoading(true);
      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);
        if (user.role === "student") {
          const fetchedTeacher = await getUserByIDFromDB(
            fetchedClassCourse.teacherId
          );
          setTeacher(fetchedTeacher);
        }
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    getClassCourse();
  }, [user, classCourseId]);

  useEffect(() => {
    if (!teacher) return;
    async function getImgUrl() {
      const imgUrl = await getFileDownloadLink(teacher.profileImage);
      setTeacherImgUrl(imgUrl);
    }
    getImgUrl();
  }, [teacher]);

  const handleOpenMenu = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  const onSuccessEditClassCourse = (updatedClassCourse) => {
    setClassCourse(updatedClassCourse);
    setIsEditDialogOpen(false);
    setSuccessSnackbarMsg("Kelas berhasil diedit");
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
            <BackButton onClick={() => navigate("/")} />
            <Paper elevation={3}>
              <Stack direction="row" p={2} position="relative">
                <Stack flex={1}>
                  <Typography>{classCourse.className}</Typography>
                  <Typography>{classCourse.courseName}</Typography>
                  {user.role === "student" && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      my={0.5}
                    >
                      <Box
                        width="32px"
                        height="32px"
                        borderRadius="50%"
                        component="img"
                        src={teacherImgUrl}
                        alt={`profile ${user.id}`}
                      />
                      <Typography>{teacher.fullname}</Typography>
                    </Stack>
                  )}
                  <Typography>{classCourse.schoolYear}</Typography>
                  <Typography>
                    Status Kelas:{" "}
                    <Typography
                      component="span"
                      fontWeight={600}
                      color={classCourse.isActive ? "#44a716" : "#e01d33"}
                    >
                      {classCourse.isActive ? "Aktif" : "Tidak Aktif"}
                    </Typography>
                  </Typography>
                  {user.role === "teacher" && (
                    <Typography>{`Kode Kelas: ${classCourse.joinCode}`}</Typography>
                  )}
                </Stack>
                {user.role === "teacher" && (
                  <Stack
                    position="absolute"
                    top="8px"
                    right="4px"
                    justifyContent="flex-start"
                  >
                    <IconButton onClick={handleOpenMenu}>
                      <MoreVertRounded
                        sx={{ color: "#000", fontSize: "28px" }}
                      />
                    </IconButton>
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Stack>
          <Grid container>
            {user.role === "teacher" && (
              <MenuButton
                img={studentIcon}
                text="Murid"
                to={`/class-courses/${classCourseId}/students`}
              />
            )}
            <MenuButton
              img={materialIcon}
              text="Materi"
              to={`/class-courses/${classCourseId}/materials`}
            />
            <MenuButton
              img={assignmentIcon}
              text="Tugas"
              to={`/class-courses/${classCourseId}/assignments`}
            />
            <MenuButton
              img={forumIcon}
              text="Forum"
              to={`/class-courses/${classCourseId}/threads`}
            />
            <MenuButton
              img={scoreIcon}
              text="Nilai"
              to={`/class-courses/${classCourseId}/scores`}
            />
            <MenuButton
              img={progressIcon}
              text="Progres"
              to={`/class-courses/${classCourseId}/progress`}
            />
          </Grid>
          <Menu onClose={handleCloseMenu} anchorEl={anchorEl} open={isMenuOpen}>
            <MenuItem
              onClick={() => {
                setIsEditDialogOpen(true);
                handleCloseMenu();
              }}
            >
              Edit Kelas
            </MenuItem>
            <MenuItem>Hapus Kelas</MenuItem>
          </Menu>

          <EditClassCourseDialog
            open={isEditDialogOpen}
            setOpen={setIsEditDialogOpen}
            classCourse={classCourse}
            onSuccess={onSuccessEditClassCourse}
          />
        </Stack>
      ) : (
        <Stack justifyContent="center" alignItems="center" flex={1}>
          <Loading />
        </Stack>
      )}
      <SuccessSnackbar
        text={successSnackbarMsg}
        onClose={handleCloseSuccessSnackbar}
      />
    </Stack>
  );
};

const MenuButton = ({ text, img, to }) => {
  return (
    <Grid xs={6} sm={3} mb={4}>
      <Stack alignItems="center" spacing={1.5}>
        <Box
          component={Link}
          to={to}
          bgcolor="primary.light"
          width={0.45}
          p={1.5}
          borderRadius="30px"
        >
          <Box component="img" width={1} src={img} />
        </Box>
        <Typography
          fontSize={{
            xs: "14px",
            md: "16px",
          }}
          textAlign="center"
        >
          {text}
        </Typography>
      </Stack>
    </Grid>
  );
};

export default ClassCourseDetail;
