import { Box, Stack, Typography } from "@mui/material";
import { blue } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getFileDownloadLink } from "../cloudStorage/cloudStorage";
import Header from "../components/Header";

const ProfilePage = () => {

  const user = useSelector((state) => state.user);
  const [imageUrl, setImageUrl] = useState("");
  //const namalengkap = await getFileDownloadLink(user.fullname)
  useEffect(() => {
    async function getImgUrl() {
      const downloadUrl = await getFileDownloadLink(user.profileImage);
      setImageUrl(downloadUrl);
    }
    getImgUrl();
  }, [user]);

  return (
     <Stack minHeight="100vh" bgcolor="background.default">
      <Header />
      <button >back button
      </button>
      <Stack 
      spacing={2}
      mt = "14vh"
      bgcolor={blue[100]}
      alignItems="center"
      justify="center"
      >
      <Typography 
      fontWeight="light"
      fontSize="25px">Profile</Typography>
      
      <Box
      sx={{border :3}}
      width="120px"
      height="120px"
      borderRadius="50%"
      component="img"
      src={imageUrl}
      alt={`profile ${user.id}`}
      />
      <Stack
      justifyContent="center"
      alignItems="center">
      <Typography
      fontWeight="bold"
      fontSize="1.17em"
      >Nama lengkap </Typography>
      <Typography
      fontSize="20px"
      >{user.fullname}</Typography>
      </Stack>
      
      <Stack
      justifyContent="center"
      alignItems="center"
      >
      <Typography
      fontWeight="bold"
      fontSize="1.17em"
      >Username </Typography>

      <Typography
      fontSize="18px"
      >{user.username}</Typography>
      
      </Stack>
      <button>edit profile</button>
      </Stack>
    </Stack>
  );
}

export default ProfilePage;

