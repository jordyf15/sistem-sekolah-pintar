import {
  Dialog,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import Header from "../components/Header";
import InputField from "../components/InputField";
import ThemedButton from "../components/ThemedButton";
import { addClassCourseToDB } from "../database/classCourse";

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
      </Stack>
      <CreateClassCourseDialog
        open={isCreateDialogOpen}
        setOpen={setIsCreateDialogOpen}
        onAddClassCourse={onAddClassCourse}
      />
    </Stack>
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

      navigate(`/class-course/${classCourse.id}`);
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
