import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import ThemedButton from "../../components/ThemedButton";

const ProfilePage = () => {
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    async function getImgUrl() {
      const downloadUrl = await getFileDownloadLink(user.profileImage);
      setImageUrl(downloadUrl);
    }

    getImgUrl();
  }, [user]);

  return (
    <Stack minHeight="100vh" bgcolor="background.default" spacing={3}>
      <Header />
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
        <BackButton onClick={() => navigate(`/`)} />
        <Stack alignItems="center" mt="32px !important" spacing={2}>
          <Typography fontSize="24px">Profil</Typography>
          <Box
            sx={{ border: 3 }}
            width="120px"
            height="120px"
            borderRadius="50%"
            component="img"
            src={imageUrl}
            alt={`profile ${user.id}`}
          />
          <Stack justifyContent="center" alignItems="center">
            <Typography fontWeight="bold">Nama lengkap</Typography>
            <Typography>{user.fullname}</Typography>
          </Stack>
          <Stack justifyContent="center" alignItems="center">
            <Typography fontWeight="bold">Username</Typography>
            <Typography>{user.username}</Typography>
          </Stack>
          <Stack spacing={2}>
            <ThemedButton sx={{ px: 2.5 }}>Edit Profil</ThemedButton>
            <ThemedButton sx={{ px: 2.5 }}>Edit Kata Sandi</ThemedButton>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ProfilePage;
