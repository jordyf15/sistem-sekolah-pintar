import {
  CampaignRounded,
  DeleteForeverRounded,
  ExpandMoreRounded,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseAnnouncementsFromDB } from "../../database/announcement";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { formatDateToString } from "../../utils/utils";
import CreateAnnouncementDialog from "./CreateAnnouncementDialog";
import DeleteAnnouncementDialog from "./DeleteAnnouncementDialog";

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

        const fetchedAnnouncements = await getClassCourseAnnouncementsFromDB(
          classCourseId
        );
        setAnnouncements(fetchedAnnouncements);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    getClassCourseAndAnnouncements();
  }, [classCourseId]);

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  const handleSuccessCreateAnnouncement = (announcement) => {
    setAnnouncements([announcement].concat(announcements));
    setSuccessSnackbarMsg("Pengumuman berhasil dibuat");
  };

  const handleSuccessDeleteAnnouncement = (announcementId) => {
    setAnnouncements(
      announcements.filter((announcement) => announcement.id !== announcementId)
    );
    setSuccessSnackbarMsg("Pengumuman berhasil dihapus");
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
          flexGrow={1}
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
          {announcements.length > 0 ? (
            <Stack
              spacing={4}
              mt={user.role === "student" ? "32px !important" : 2}
              alignItems="center"
            >
              {announcements.map((announcement) => (
                <AnnouncementItem
                  key={announcement.id}
                  announcement={announcement}
                  onDeleteSuccess={handleSuccessDeleteAnnouncement}
                />
              ))}
            </Stack>
          ) : (
            <Stack
              flexGrow={1}
              spacing={1}
              justifyContent="center"
              alignItems="center"
            >
              <CampaignRounded
                sx={{ fontSize: "76px", color: "text.secondary" }}
              />
              <Typography
                textAlign="center"
                fontSize="18px"
                color="text.primary"
              >
                Kelas ini belum ada pengumuman
              </Typography>
              <Typography
                fontSize="14px"
                textAlign="center"
                color="text.secondary"
              >
                {user.role === "teacher"
                  ? "Cobalah buat pengumuman baru."
                  : "Mohon tunggu guru anda untuk membuat pengumuman."}
              </Typography>
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

const AnnouncementItem = ({ announcement, onDeleteSuccess }) => {
  const user = useSelector((state) => state.user);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Accordion sx={{ width: 1, maxWidth: "900px" }} elevation={4}>
        <AccordionSummary
          sx={{
            flexDirection: "row-reverse",
            boxShadow:
              "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
            "& .MuiSvgIcon-root": {
              color: "#000",
            },
            "& .MuiAccordionSummary-content": {
              my: "0px !important",
            },
            px: {
              xs: 1,
              sm: 2,
            },
          }}
          expandIcon={<ExpandMoreRounded />}
        >
          <Stack
            direction="row"
            flex={1}
            ml={1}
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <CampaignRounded sx={{ fontSize: "28px" }} />
              <Stack>
                <Typography fontWeight="bold">{announcement.title}</Typography>
                <Typography fontSize="12px">
                  {formatDateToString(announcement.createdAt)}
                </Typography>
              </Stack>
            </Stack>
            {user.role === "teacher" && (
              <Tooltip
                title="Hapus pengumuman"
                arrow
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -14],
                        },
                      },
                    ],
                  },
                }}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <DeleteForeverRounded sx={{ color: "#000" }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography mt={1} whiteSpace="pre-wrap" fontSize="14px">
            {announcement.description}
          </Typography>
        </AccordionDetails>
      </Accordion>
      <DeleteAnnouncementDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        announcement={announcement}
        onSuccess={onDeleteSuccess}
      />
    </>
  );
};

export default AnnouncementPage;
