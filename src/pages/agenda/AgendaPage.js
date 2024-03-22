import {
  CalendarTodayRounded,
  CircleRounded,
  Event,
  ExpandMoreRounded,
  MoreVertRounded,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  DateCalendar,
  LocalizationProvider,
  PickersDay,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import { getClassCourseAgendasFromDB } from "../../database/agenda";
import { getClassCourseByIDFromDB } from "../../database/classCourse";
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
  const [currentDate, setCurrentDate] = useState(dayjs(new Date()));

  const agendaDateToDateMapKey = (date) => {
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
  };

  const agendasMap = useMemo(() => {
    const newAgendaMap = new Map();
    agendas.forEach((agenda) => {
      const agendaDateKey = agendaDateToDateMapKey(agenda.date);
      if (newAgendaMap.has(agendaDateKey)) {
        newAgendaMap.set(
          agendaDateKey,
          newAgendaMap.get(agendaDateKey).concat([agenda])
        );
      } else {
        newAgendaMap.set(agendaDateKey, [agenda]);
      }
    });
    return newAgendaMap;
  }, [agendas]);

  const highlightedDates = useMemo(() => {
    return Array.from(agendasMap.keys());
  }, [agendasMap]);

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

  const handleSuccessDeleteAgenda = (deletedAgendaId) => {
    setAgendas(agendas.filter((agenda) => agenda.id !== deletedAgendaId));
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
            Daftar Agenda
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Paper
                elevation={3}
                sx={{
                  width: 1,
                  maxWidth: "430px",
                }}
              >
                <DateCalendar
                  sx={{
                    width: "100%",
                    height: "100%",
                    "& .MuiDayCalendar-slideTransition": {
                      minHeight: "250px",
                    },
                  }}
                  showDaysOutsideCurrentMonth
                  value={currentDate}
                  disableHighlightToday={true}
                  onChange={(newCurrentDate) => setCurrentDate(newCurrentDate)}
                  slotProps={{
                    day: {
                      highlightedDays: highlightedDates,
                    },
                  }}
                  slots={{
                    day: HighlightedDate,
                  }}
                />
              </Paper>
            </LocalizationProvider>
            {agendasMap.get(agendaDateToDateMapKey(currentDate.$d)) ? (
              agendasMap
                .get(agendaDateToDateMapKey(currentDate.$d))
                .map((agenda) => (
                  <AgendaItem
                    key={agenda.id}
                    agenda={agenda}
                    onEditSuccess={handleSuccessEditAgenda}
                    onDeleteSuccess={handleSuccessDeleteAgenda}
                  />
                ))
            ) : (
              <Stack
                flexGrow={1}
                spacing={1}
                justifyContent="center"
                alignItems="center"
              >
                <CalendarTodayRounded
                  sx={{ fontSize: "76px", color: "text.secondary" }}
                />
                <Typography
                  textAlign="center"
                  fontSize="18px"
                  color="text.primary"
                >
                  Tanggal ini tidak ada agenda
                </Typography>
                <Typography
                  fontSize="14px"
                  textAlign="center"
                  color="text.secondary"
                >
                  {user.role === "teacher"
                    ? "Cobalah membuat agenda baru."
                    : "Mohon tunggu guru anda membuat agenda."}
                </Typography>
              </Stack>
            )}
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

const HighlightedDate = ({
  highlightedDays = [],
  day,
  outsideCurrentMonth,
  selected,
  ...other
}) => {
  const isHighlighted = highlightedDays.includes(
    `${day.$d.getDate()}/${day.$d.getMonth()}/${day.$d.getFullYear()}`
  );

  return (
    <Box position="relative">
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        selected={selected}
      />
      {!outsideCurrentMonth && isHighlighted && !selected && (
        <CircleRounded
          sx={{
            color: "primary.main",
            fontSize: "12px",
            position: "absolute",
            top: 0,
            right: 0,
          }}
        />
      )}
    </Box>
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
            <Stack direction="row" alignItems="center" spacing={1}>
              <Event />
              <Typography>{agenda.title}</Typography>
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
