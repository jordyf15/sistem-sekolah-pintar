import { Box, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import scheduleIcon from "../../assets/icons/calendar.png";
import classIcon from "../../assets/icons/teaching.png";

const MenuButton = ({ text, img, to }) => {
  return (
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
          xs: "12px",
          sm: "16px",
        }}
        textAlign="center"
      >
        {text}
      </Typography>
    </Stack>
  );
};

const TeacherHomePage = () => {
  return (
    <Stack justifyContent="center" flexGrow={1}>
      <Stack>
        {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            sx={{ bgcolor: "primary.light", color: "#fff" }}
            views={["day"]}
          />
        </LocalizationProvider> */}
        {/* schedule disini */}
      </Stack>
      <Stack direction="row" justifyContent="space-around" alignItems="center">
        <MenuButton text="Jadwal" img={scheduleIcon} to="/schedule" />
        <MenuButton text="Daftar Kelas" img={classIcon} to="/class-courses" />
      </Stack>
    </Stack>
  );
};

export default TeacherHomePage;
