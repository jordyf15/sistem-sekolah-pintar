import {
  Box,
  Dialog,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { updateClassCourseInDB } from "../../database/classCourse";

const EditClassCourseDialog = ({ open, setOpen, classCourse, onSuccess }) => {
  const [className, setClassName] = useState(classCourse.className);
  const [courseName, setCourseName] = useState(classCourse.courseName);
  const [schoolYear, setSchoolYear] = useState(classCourse.schoolYear);
  const [isActive, setIsActive] = useState(classCourse.isActive);
  const [classNameError, setClassNameError] = useState("");
  const [courseNameError, setCourseNameError] = useState("");
  const [schoolYearError, setSchoolYearError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {
    setClassName(classCourse.className);
    setCourseName(classCourse.courseName);
    setSchoolYear(classCourse.schoolYear);
    setIsActive(classCourse.isActive);
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

  const onIsActiveChange = (e) => {
    setIsActive(e.target.value === "active");
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
      const updatedClassCourse = {
        ...classCourse,
        className: className,
        courseName: courseName,
        schoolYear: schoolYear,
        isActive: isActive,
      };

      await updateClassCourseInDB(updatedClassCourse);
      onSuccess(updatedClassCourse);
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
      <DialogTitle textAlign="center">Edit Kelas</DialogTitle>
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

        <Box>
          <Typography
            component="span"
            fontWeight={500}
            fontSize="16px"
            color="#000000"
          >
            Status Kelas
          </Typography>
          <Stack
            component={RadioGroup}
            direction="row"
            onChange={onIsActiveChange}
            value={isActive ? "active" : "inactive"}
          >
            <FormControlLabel
              value="active"
              control={<Radio />}
              label="Aktif"
            />
            <FormControlLabel
              value="inactive"
              control={<Radio />}
              label="Tidak Aktif"
            />
          </Stack>
        </Box>

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

export default EditClassCourseDialog;
