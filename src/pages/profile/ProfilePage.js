import { Box, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";
import BackButton from "../../components/BackButton";
import Header from "../../components/Header";
import SuccessSnackbar from "../../components/SuccessSnackbar";
import ThemedButton from "../../components/ThemedButton";
import EditPasswordDialog from "./EditPasswordDialog";
import EditProfileDialog from "./EditProfileDialog";

const ProfilePage = () => {
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  const [imageUrl, setImageUrl] = useState("");
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [isEditPasswordDialogOpen, setIsEditPasswordDialogOpen] =
    useState(false);
  const [successSnackbarMsg, setSuccessSnackbarMsg] = useState("");

  useEffect(() => {
    async function getImgUrl() {
      const downloadUrl = await getFileDownloadLink(user.profileImage);
      setImageUrl(downloadUrl);
    }

    getImgUrl();
  }, [user]);

  const handleSuccessEditProfile = () => {
    setSuccessSnackbarMsg("Profil berhasil diedit");
  };

  const handleSuccessEditPassword = () => {
    setSuccessSnackbarMsg("Kata sandi berhasil diedit");
  };

  const handleCloseSuccessSnackbar = () => {
    setSuccessSnackbarMsg("");
  };

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
            <ThemedButton
              onClick={() => setIsEditProfileDialogOpen(true)}
              sx={{ px: 2.5 }}
            >
              Edit Profil
            </ThemedButton>
            <ThemedButton
              onClick={() => setIsEditPasswordDialogOpen(true)}
              sx={{ px: 2.5 }}
            >
              Edit Kata Sandi
            </ThemedButton>
          </Stack>
        </Stack>
      </Stack>
      <EditProfileDialog
        open={isEditProfileDialogOpen}
        setOpen={setIsEditProfileDialogOpen}
        onSuccess={handleSuccessEditProfile}
      />
      <EditPasswordDialog
        open={isEditPasswordDialogOpen}
        setOpen={setIsEditPasswordDialogOpen}
        onSuccess={handleSuccessEditPassword}
      />
      <SuccessSnackbar
        text={successSnackbarMsg}
        onClose={handleCloseSuccessSnackbar}
      />
    </Stack>
  );
};

export default ProfilePage;
