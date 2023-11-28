import { MoreVertRounded } from "@mui/icons-material";
import {
  Alert,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import assignmentIcon from "../assets/icons/assignment.png";
import forumIcon from "../assets/icons/forum.png";
import materialIcon from "../assets/icons/material.png";
import progressIcon from "../assets/icons/progress.png";
import scoreIcon from "../assets/icons/score.png";
import studentIcon from "../assets/icons/student.png";
import { getFileDownloadLink } from "../cloudStorage/cloudStorage";
import BackButton from "../components/BackButton";
import Header from "../components/Header";
import Loading from "../components/Loading";
import { getClassCourseByIDFromDB } from "../database/classCourse";
import { getUserByIDFromDB } from "../database/user";

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
  const [isCreateSuccessSnackbarOpen, setIsCreateSuccessSnackbarOpen] =
    useState(location.state?.justCreated ? true : false);
  const [isJoinSuccessSnackbarOpen, setIsJoinSuccessSnackbarOpen] = useState(
    location.state?.justJoined ? true : false
  );
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

  const handleCloseCreateSuccessSnackbar = () => {
    setIsCreateSuccessSnackbarOpen(false);
  };

  const handleCloseJoinSuccessSnackbar = () => {
    setIsJoinSuccessSnackbarOpen(false);
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
              to={`/class-courses/${classCourseId}/forum`}
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
            <MenuItem>Edit Kelas</MenuItem>
            <MenuItem>Hapus Kelas</MenuItem>
          </Menu>
        </Stack>
      ) : (
        <Stack justifyContent="center" alignItems="center" flex={1}>
          <Loading />
        </Stack>
      )}

      <Snackbar
        open={isCreateSuccessSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseCreateSuccessSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseCreateSuccessSnackbar} severity="success">
          Kelas berhasil dibuat
        </Alert>
      </Snackbar>

      <Snackbar
        open={isJoinSuccessSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseJoinSuccessSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseJoinSuccessSnackbar} severity="success">
          Berhasil gabung ke kelas
        </Alert>
      </Snackbar>
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

// const EditClassCourseDialog = ({ open, setOpen }) => {
//   const [className, setClassName] = useState("");
//   const [courseName, setCourseName] = useState("");
//   const [schoolYear, setSchoolYear] = useState("");
//   const [isActive, setIsActive] = useState(true);
//   const [classNameError, setClassNameError] = useState("");
//   const [courseNameError, setCourseNameError] = useState("");
//   const [schoolYearError, setSchoolYearError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const onCloseDialog = () => {
//     setClassName("");
//     setCourseName("");
//     setSchoolYear("");
//     setClassNameError("");
//     setCourseNameError("");
//     setSchoolYearError("");
//     setIsActive(false);
//     setIsLoading(false);
//     setOpen(false);
//   };

//   const validateClassName = (newClassName) => {
//     if (newClassName.length < 1) {
//       setClassNameError("Nama kelas tidak boleh kosong");
//       return false;
//     } else {
//       setClassNameError("");
//       return true;
//     }
//   };

//   const validateCourseName = (newCourseName) => {
//     if (newCourseName.length < 1) {
//       setCourseNameError("Nama mata pelajaran tidak boleh kosong");
//       return false;
//     } else {
//       setCourseNameError("");
//       return true;
//     }
//   };

//   const validateSchoolYear = (newSchoolYear) => {
//     const schoolYearPattern = /[0-9][0-9][0-9][0-9]\/[0-9][0-9][0-9][0-9]/;

//     if (newSchoolYear.length < 1) {
//       setSchoolYearError("Tahun ajaran tidak boleh kosong");
//       return false;
//     } else if (!schoolYearPattern.test(newSchoolYear)) {
//       setSchoolYearError("Format tahun ajaran harus yyyy/yyyy");
//       return false;
//     }
//     const schoolYears = newSchoolYear.split("/");
//     const firstYear = parseInt(schoolYears[0]);
//     const secondYear = parseInt(schoolYears[1]);

//     if (secondYear - firstYear !== 1) {
//       setSchoolYearError("Tahun ajaran hanya boleh 1 tahun");
//       return false;
//     }
//     setSchoolYearError("");
//     return true;
//   };

//   const onClassNameChange = (newClassName) => {
//     setClassName(newClassName);

//     validateClassName(newClassName);
//   };

//   const onCourseNameChange = (newCourseName) => {
//     setCourseName(newCourseName);

//     validateCourseName(newCourseName);
//   };

//   const onSchoolYearChange = (newSchoolYear) => {
//     setSchoolYear(newSchoolYear);

//     validateSchoolYear(newSchoolYear);
//   };

//   const onIsActiveChange = (e) => {
//     setIsActive(e.target.value === "active");
//   };

//   return (
//     <Dialog
//       fullWidth
//       maxWidth="xs"
//       onClose={onCloseDialog}
//       open={open}
//       sx={{
//         "& .MuiPaper-root": {
//           mx: 1,
//           width: "100vw",
//         },
//       }}
//     >
//       <DialogTitle textAlign="center">Edit Kelas</DialogTitle>
//       <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
//         <InputField
//           labelText="Nama Kelas"
//           placeholder="Masukkan nama kelas"
//           error={classNameError}
//           value={className}
//           onChange={(e) => onClassNameChange(e.target.value)}
//           onBlur={() => onClassNameChange(className)}
//           disabled={isLoading}
//         />
//         <InputField
//           labelText="Nama Mata Pelajaran"
//           placeholder="Masukkan nama mata pelajaran"
//           error={courseNameError}
//           value={courseName}
//           onChange={(e) => onCourseNameChange(e.target.value)}
//           onBlur={() => onCourseNameChange(courseName)}
//           disabled={isLoading}
//         />
//         <InputField
//           labelText="Tahun Ajaran"
//           placeholder="Masukkan tahun ajaran"
//           error={schoolYearError}
//           value={schoolYear}
//           onChange={(e) => onSchoolYearChange(e.target.value)}
//           onBlur={() => onSchoolYearChange(schoolYear)}
//           disabled={isLoading}
//         />
//         {/* <Stack component={RadioGroup} direction="row" onChange={onIsActiveChange} ></Stack> */}
//       </Stack>
//     </Dialog>
//   );
// };

export default ClassCourseDetail;
