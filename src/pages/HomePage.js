import { NavigateNextRounded } from "@mui/icons-material";
import {
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
import { v4 as uuid } from "uuid";
import Header from "../components/Header";
import InputField from "../components/InputField";
import ThemedButton from "../components/ThemedButton";
import {
  addClassCourseToDB,
  getTeacherClassCoursesFromDB,
} from "../database/classCourse";

const HomePage = () => {
  const [statusFilter, setStatusFilter] = useState("active");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [classCourses, setClassCourses] = useState([]);

  const user = useSelector((state) => state.user);

  const onStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const onAddClassCourse = (classCourse) => {
    setClassCourses(classCourses.unshift(classCourse));
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
        const fetchedClassCourses = await getTeacherClassCoursesFromDB(user.id);

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
            <></>
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
          {displayedClassCourses.map((classCourse, idx) => (
            <ClassCourseItem
              key={classCourse.id}
              idx={idx}
              classCourse={classCourse}
            />
          ))}
        </Grid>
      </Stack>
      <CreateClassCourseDialog
        open={isCreateDialogOpen}
        setOpen={setIsCreateDialogOpen}
        onAddClassCourse={onAddClassCourse}
      />
    </Stack>
  );
};

const ClassCourseItem = ({ classCourse, idx }) => {
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

const CreateClassCourseDialog = ({ open, setOpen, onAddClassCourse }) => {
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
      const classCourse = {
        id: uuid(),
        className: className,
        courseName: courseName,
        schoolYear: schoolYear,
        teacherId: user.id,
        studentIds: [],
        isActive: true,
        joinCode: uuid(),
      };

      await addClassCourseToDB(classCourse);

      onAddClassCourse(classCourse);

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
