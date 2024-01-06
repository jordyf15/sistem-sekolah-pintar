import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import CreateAnnouncementDialog from "./CreateAnnouncementDialog";

const AnnouncementPage = () => {
  const { id: classCourseId } = useParams();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const [isCreateAnnouncementDialogOpen, setIsCreateAnnouncementDialogOpen] =
    useState(false);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [classCourse, setClassCourse] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    async function getClassCourseAndAnnouncements() {
      setIsLoading(true);

      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    getClassCourseAndAnnouncements();
  }, [classCourseId]);

  useEffect(() => {
    console.log("announcements", announcements);
  }, [announcements]);

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  const handleSuccessCreateAnnouncement = (announcement) => {
    setAnnouncements([announcement].concat(announcements));
    setSuccessSnackbarMsg("Pengumuman berhasil dibuat");
  };

  return (
    <Stack
      minHeight="100vh"
      bgcolor="background.default"
      spacing={!isLoading ? 3 : 0}
      pb={4}
      boxSizing="border-box"
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
            Pengumuman
            <br />
            {`${classCourse.className} ${classCourse.courseName}`}
          </Typography>
          {user.role === "teacher" && (
            <Stack alignItems="flex-end">
              <ThemedButton
                onClick={() => setIsCreateAnnouncementDialogOpen(true)}
                sx={{ px: 2.5 }}
                size="small"
              >
                Buat Pengumuman
              </ThemedButton>
            </Stack>
          )}
          <CreateAnnouncementDialog
            open={isCreateAnnouncementDialogOpen}
            setOpen={setIsCreateAnnouncementDialogOpen}
            onSuccess={handleSuccessCreateAnnouncement}
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

export default AnnouncementPage;
