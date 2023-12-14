import { Box, Dialog, DialogTitle, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import {
  getClassCourseByJoinCodeFromDB,
  updateClassCourseStudentsInDB,
} from "../../database/classCourse";
import { getUserByIDFromDB } from "../../database/user";

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
      await updateClassCourseStudentsInDB(
        updatedClassCourse.id,
        updatedClassCourse.studentIds
      );

      setIsLoading(false);

      navigate(`class-courses/${updatedClassCourse.id}`, {
        state: { justJoined: true },
      });
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

export default JoinClassCourseDialog;
