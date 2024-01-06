import { ExpandMoreRounded, MoreVertRounded } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Menu,
  MenuItem,
  Stack,
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
import { getClassCourseAgendasFromDB } from "../../database/agenda";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
import { formatDateToString } from "../../utils/utils";
import CreateAgendaDialog from "./CreateAgendaDialog";
import DeleteAgendaDialog from "./DeleteAgendaDialog";
import EditAgendaDialog from "./EditAgendaDialog";

const AgendaPage = () => {
  const { id: classCourseId } = useParams();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(true);
  const [classCourse, setClassCourse] = useState(null);
  const [isCreateAgendaDialogOpen, setIsCreateAgendaDialogOpen] =
    useState(false);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");
  const [agendas, setAgendas] = useState([]);

  useEffect(() => {
    async function getClassCourseAndAgendas() {
      setIsLoading(true);

      try {
        const fetchedClassCourse = await getClassCourseByIDFromDB(
          classCourseId
        );
        setClassCourse(fetchedClassCourse);

        const fetchedAgendas = await getClassCourseAgendasFromDB(classCourseId);
        setAgendas(fetchedAgendas);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    getClassCourseAndAgendas();
  }, [classCourseId]);

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

  const handleSuccessCreateAgenda = (agenda) => {
    setAgendas(agendas.concat([agenda]));
    setSuccessSnackbarMsg("Agenda berhasil dibuat");
  };

  const handleSuccessEditAgenda = (updatedAgenda) => {
    setAgendas(
      agendas.map((agenda) =>
        agenda.id === updatedAgenda.id ? updatedAgenda : agenda
      )
    );
    setSuccessSnackbarMsg("Agenda berhasil diedit");
  };

  const handleSuccessDeleteAgenda = (agendaId) => {
    // delete agenda dr state
    setSuccessSnackbarMsg("Agenda berhasil dihapus");
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
            Agenda
            <br />
            {`${classCourse.className} ${classCourse.courseName}`}
          </Typography>
          {user.role === "teacher" && (
            <Stack alignItems="flex-end">
              <ThemedButton
                onClick={() => setIsCreateAgendaDialogOpen(true)}
                sx={{ px: 2.5 }}
                size="small"
              >
                Buat Agenda
              </ThemedButton>
            </Stack>
          )}
          <Stack
            spacing={4}
            mt={user.role === "student" ? "32px !important" : 2}
            alignItems="center"
          >
            {agendas.map((agenda) => (
              <AgendaItem
                key={agenda.id}
                agenda={agenda}
                onEditSuccess={handleSuccessEditAgenda}
                onDeleteSuccess={handleSuccessDeleteAgenda}
              />
            ))}
          </Stack>
          <CreateAgendaDialog
            open={isCreateAgendaDialogOpen}
            setOpen={setIsCreateAgendaDialogOpen}
            onSuccess={handleSuccessCreateAgenda}
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

const AgendaItem = ({ agenda, onEditSuccess, onDeleteSuccess }) => {
  const user = useSelector((state) => state.user);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

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
            <Stack>
              <Typography fontWeight="bold">{agenda.title}</Typography>
              <Typography fontSize="12px">
                {formatDateToString(agenda.date)}
              </Typography>
            </Stack>
            {user.role === "teacher" && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuAnchorEl(e.currentTarget);
                }}
              >
                <MoreVertRounded sx={{ color: "#000", fontSize: "28px" }} />
              </IconButton>
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Typography mt={1} whiteSpace="pre-wrap" fontSize="14px">
            {agenda.description}
          </Typography>
        </AccordionDetails>
        <Menu
          onClose={handleCloseMenu}
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
        >
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setIsEditDialogOpen(true);
            }}
          >
            Edit Agenda
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setIsDeleteDialogOpen(true);
            }}
          >
            Hapus Agenda
          </MenuItem>
        </Menu>
      </Accordion>
      <EditAgendaDialog
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
        agenda={agenda}
        onSuccess={onEditSuccess}
      />
      <DeleteAgendaDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        agenda={agenda}
        onSuccess={onDeleteSuccess}
      />
    </>
  );
};

export default AgendaPage;
