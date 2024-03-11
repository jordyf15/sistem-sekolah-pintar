import { AutoStories, GroupsRounded } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import Header from "../../components/Header";
import ThemedButton from "../../components/ThemedButton";
import AdminClassCoursesTab from "./AdminClassCoursesTab";
import AdminUsersTab from "./AdminUsersTab";

const AdminHomePage = () => {
  const [currentTab, setCurrentTab] = useState("users");

  return (
    <Stack minHeight="100vh" bgcolor="background.default" spacing={3}>
      <Header />
      <Stack
        spacing={3}
        flex={1}
        px={{
          xs: 2,
          sm: 4,
          md: 6,
          lg: 8,
          xl: 10,
        }}
      >
        <Typography textAlign="center" fontSize="20px">
          Administrasi
        </Typography>
        <Stack direction="row" spacing={2}>
          <ThemedButton
            size="small"
            variant={currentTab === "users" ? "contained" : "outlined"}
            onClick={() => setCurrentTab("users")}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <GroupsRounded />
              <Typography>Pengguna</Typography>
            </Stack>
          </ThemedButton>
          <ThemedButton
            size="small"
            variant={currentTab === "classCourses" ? "contained" : "outlined"}
            onClick={() => setCurrentTab("classCourses")}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <AutoStories />
              <Typography>Kelas</Typography>
            </Stack>
          </ThemedButton>
        </Stack>
        {currentTab === "users" ? <AdminUsersTab /> : <AdminClassCoursesTab />}
      </Stack>
    </Stack>
  );
};

export default AdminHomePage;
