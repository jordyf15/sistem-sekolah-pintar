import { NavigateNextRounded } from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogTitle,
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
import { useNavigate } from "react-router-dom";
import ShortUniqueId from "short-unique-id";
import { v4 as uuid } from "uuid";
import { getFileDownloadLink } from "../cloudStorage/cloudStorage";
import Header from "../components/Header";
import InputField from "../components/InputField";
import ThemedButton from "../components/ThemedButton";
import {
  addClassCourseToDB,
  getClassCourseByJoinCodeFromDB,
  getStudentClassCoursesFromDB,
  getTeacherClassCoursesFromDB,
  updateClassCourseInDB,
} from "../database/classCourse";
import { getUserByIDFromDB } from "../database/user";

const HomePage = () => {
  const [statusFilter, setStatusFilter] = useState("active");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [classCourses, setClassCourses] = useState([]);

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
    }

    getClassCourses();
  }, [user]);

  return (
    <Stack minHeight="100vh" bgcolor="background.default" spacing={3}>
      <Header />
      <Stack spacing={3}>
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
      </Stack>
      <CreateClassCourseDialog
        open={isCreateDialogOpen}
        setOpen={setIsCreateDialogOpen}
      />
      <JoinClassCourseDialog
        open={isJoinDialogOpen}
        setOpen={setIsJoinDialogOpen}
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
        <Stack direction="row" p={2} justifyContent="space-between">
          <Stack>
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

const JoinClassCourseDialog = ({ open, setOpen }) => {
  const [joinCode, setJoinCode] = useState("");
  const [joinCodeError, setJoinCodeError] = useState("");
  const [dialogStep, setDialogStep] = useState("search-class");
  const [isLoading, setIsLoading] = useState(false);
  const [foundClassCourse, setFoundClassCourse] = useState(null);
  const [foundTeacher, setFoundTeacher] = useState(null);
  const [foundTeacherImgUrl, setFoundTeacherImgUrl] = useState("");

  const user = useSelector((state) => state.user);

  const navigate = useNavigate();

  useEffect(() => {
    if (!foundTeacher) return;
    async function getImgUrl() {
      const imgUrl = await getFileDownloadLink(foundTeacher.profileImage);
      setFoundTeacherImgUrl(imgUrl);
    }
    getImgUrl();
  }, [foundTeacher]);

  const onCloseDialog = () => {
    setJoinCode("");
    setJoinCodeError("");
    setDialogStep("search-class");
    setIsLoading(false);
    setFoundClassCourse(null);
    setFoundTeacher(null);
    setOpen(false);
  };

  const validateJoinCode = (newJoinCode) => {
    if (newJoinCode.length < 1) {
      setJoinCodeError("Kode kelas tidak boleh kosong");
      return false;
    } else {
      setJoinCodeError("");
      return true;
    }
  };

  const onJoinCodeChange = (newJoinCode) => {
    setJoinCode(newJoinCode);

    validateJoinCode(newJoinCode);
  };

  const handleSearchClass = async () => {
    if (!validateJoinCode(joinCode)) return;

    setIsLoading(true);

    try {
      const classCourseWithJoinCode = await getClassCourseByJoinCodeFromDB(
        joinCode
      );

      if (!classCourseWithJoinCode) {
        setJoinCodeError("Kelas tidak ditemukan");
        setIsLoading(false);
        return;
      }

      if (classCourseWithJoinCode.studentIds.includes(user.id)) {
        setJoinCodeError("Anda sudah bergabung ke kelas ini");
        setIsLoading(false);
        return;
      }

      setFoundClassCourse(classCourseWithJoinCode);
      const classCourseTeacher = await getUserByIDFromDB(
        classCourseWithJoinCode.teacherId
      );
      setFoundTeacher(classCourseTeacher);

      setDialogStep("join-class");
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const handleJoinClass = async () => {
    try {
      setIsLoading(true);
      const updatedClassCourse = { ...foundClassCourse };

      updatedClassCourse.studentIds.push(user.id);
      await updateClassCourseInDB(updatedClassCourse);

      setIsLoading(false);

      navigate(`class-courses/${updatedClassCourse.id}`);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
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
      <DialogTitle textAlign="center">Gabung Kelas</DialogTitle>
      {dialogStep === "search-class" ? (
        <>
          <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
            <InputField
              labelText="Kode Kelas"
              placeholder="Masukkan kode kelas"
              error={joinCodeError}
              value={joinCode}
              onChange={(e) => onJoinCodeChange(e.target.value)}
              onBlur={() => onJoinCodeChange(joinCode)}
              disabled={isLoading}
            />
            <Stack direction="row" spacing={2}>
              <ThemedButton
                onClick={handleSearchClass}
                disabled={isLoading}
                sx={{ flex: 1 }}
              >
                Cari
              </ThemedButton>
              <ThemedButton
                disabled={isLoading}
                variant="outlined"
                sx={{ flex: 1 }}
                onClick={onCloseDialog}
              >
                Batal
              </ThemedButton>
            </Stack>
          </Stack>
        </>
      ) : (
        <>
          <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
            <Stack>
              <Typography>{foundClassCourse.className}</Typography>
              <Typography>{foundClassCourse.courseName}</Typography>
              <Stack direction="row" alignItems="center" spacing={1} my={0.5}>
                <Box
                  width="32px"
                  height="32px"
                  borderRadius="50%"
                  component="img"
                  src={foundTeacherImgUrl}
                  alt={`profile ${user.id}`}
                />
                <Typography>{foundTeacher.fullname}</Typography>
              </Stack>
              <Typography>{foundClassCourse.schoolYear}</Typography>
              <Typography>
                Status Kelas:{" "}
                <Typography
                  component="span"
                  fontWeight={600}
                  color={foundClassCourse.isActive ? "#44a716" : "#e01d33"}
                >
                  {foundClassCourse.isActive ? "Aktif" : "Tidak Aktif"}
                </Typography>
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <ThemedButton
                onClick={handleJoinClass}
                disabled={isLoading}
                sx={{ flex: 1 }}
              >
                Gabung
              </ThemedButton>
              <ThemedButton
                disabled={isLoading}
                variant="outlined"
                sx={{ flex: 1 }}
                onClick={onCloseDialog}
              >
                Batal
              </ThemedButton>
            </Stack>
          </Stack>
        </>
      )}
    </Dialog>
  );
};

const CreateClassCourseDialog = ({ open, setOpen }) => {
  const [className, setClassName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [classNameError, setClassNameError] = useState("");
  const [courseNameError, setCourseNameError] = useState("");
  const [schoolYearError, setSchoolYearError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector((state) => state.user);

  const navigate = useNavigate();

  const onCloseDialog = () => {
    setClassName("");
    setCourseName("");
    setSchoolYear("");
    setClassNameError("");
    setCourseNameError("");
    setSchoolYearError("");
    setIsLoading(false);
    setOpen(false);
  };

  const validateClassName = (newClassName) => {
    if (newClassName.length < 1) {
      setClassNameError("Nama kelas tidak boleh kosong");
      return false;
    } else {
      setClassNameError("");
      return true;
    }
  };

  const validateCourseName = (newCourseName) => {
    if (newCourseName.length < 1) {
      setCourseNameError("Nama mata pelajaran tidak boleh kosong");
      return false;
    } else {
      setCourseNameError("");
      return true;
    }
  };

  const validateSchoolYear = (newSchoolYear) => {
    const schoolYearPattern = /[0-9][0-9][0-9][0-9]\/[0-9][0-9][0-9][0-9]/;

    if (newSchoolYear.length < 1) {
      setSchoolYearError("Tahun ajaran tidak boleh kosong");
      return false;
    } else if (!schoolYearPattern.test(newSchoolYear)) {
      setSchoolYearError("Format tahun ajaran harus yyyy/yyyy");
      return false;
    }
    const schoolYears = newSchoolYear.split("/");
    const firstYear = parseInt(schoolYears[0]);
    const secondYear = parseInt(schoolYears[1]);

    if (secondYear - firstYear !== 1) {
      setSchoolYearError("Tahun ajaran hanya boleh 1 tahun");
      return false;
    }
    setSchoolYearError("");
    return true;
  };

  const onClassNameChange = (newClassName) => {
    setClassName(newClassName);

    validateClassName(newClassName);
  };

  const onCourseNameChange = (newCourseName) => {
    setCourseName(newCourseName);

    validateCourseName(newCourseName);
  };

  const onSchoolYearChange = (newSchoolYear) => {
    setSchoolYear(newSchoolYear);

    validateSchoolYear(newSchoolYear);
  };

  const handleSubmit = async () => {
    let isValid = true;

    if (!validateClassName(className)) {
      isValid = false;
    }

    if (!validateCourseName(courseName)) {
      isValid = false;
    }

    if (!validateSchoolYear(schoolYear)) {
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const { randomUUID } = new ShortUniqueId({ length: 10 });
      const classCourse = {
        id: uuid(),
        className: className,
        courseName: courseName,
        schoolYear: schoolYear,
        teacherId: user.id,
        studentIds: [],
        isActive: true,
        joinCode: randomUUID(),
      };

      await addClassCourseToDB(classCourse);

      navigate(`/class-courses/${classCourse.id}`);
    } catch (error) {
      console.log("handleSubmit error", error);
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
      <DialogTitle textAlign="center">Buat Kelas</DialogTitle>
      <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
        <InputField
          labelText="Nama Kelas"
          placeholder="Masukkan nama kelas"
          error={classNameError}
          value={className}
          onChange={(e) => onClassNameChange(e.target.value)}
          onBlur={() => onClassNameChange(className)}
          disabled={isLoading}
        />
        <InputField
          labelText="Nama Mata Pelajaran"
          placeholder="Masukkan nama mata pelajaran"
          error={courseNameError}
          value={courseName}
          onChange={(e) => onCourseNameChange(e.target.value)}
          onBlur={() => onCourseNameChange(courseName)}
          disabled={isLoading}
        />
        <InputField
          labelText="Tahun Ajaran"
          placeholder="Masukkan tahun ajaran"
          error={schoolYearError}
          value={schoolYear}
          onChange={(e) => onSchoolYearChange(e.target.value)}
          onBlur={() => onSchoolYearChange(schoolYear)}
          disabled={isLoading}
        />
        <Stack direction="row" spacing={2}>
          <ThemedButton
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{ flex: 1 }}
          >
            Simpan
          </ThemedButton>
          <ThemedButton
            disabled={isLoading}
            variant="outlined"
            sx={{ flex: 1 }}
            onClick={onCloseDialog}
          >
            Batal
          </ThemedButton>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default HomePage;
