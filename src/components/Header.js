import { ArrowDropDownRounded } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Link,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeSchool } from "../slices/school";
import { removeUser } from "../slices/user";
import { getFileDownloadLink } from "../utils/cloudStorage";

const Header = () => {
  const user = useSelector((state) => state.user);
  const school = useSelector((state) => state.school);
  const [imageUrl, setImageUrl] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    async function getImgUrl() {
      const downloadUrl = await getFileDownloadLink(user.profileImage);
      setImageUrl(downloadUrl);
    }
    getImgUrl();
  }, [user]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOpenMenu = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(removeUser());
    dispatch(removeSchool());
    navigate("/login");
  };

  const handleViewProfile = () => {
    navigate("/profile");
  };

  let navigationLinks;

  switch (user.role) {
    case "teacher":
      navigationLinks = (
        <>
          <Link sx={{ color: "#FFF" }} to="/schedule">
            Jadwal
          </Link>
          <Link sx={{ color: "#fff" }} to="/class">
            Daftar Kelas
          </Link>
        </>
      );
      break;
    case "student":
      navigationLinks = <></>;
      break;
    case "parent":
      navigationLinks = <></>;
      break;
    default:
      break;
  }

  return (
    <AppBar position="static">
      <Stack p={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography>Logo</Typography>
          <Typography>{school?.name}</Typography>
          <Stack
            p={0}
            direction="row"
            component={Button}
            onClick={handleOpenMenu}
          >
            <Box
              width="32px"
              height="32px"
              borderRadius="50%"
              component="img"
              src={imageUrl}
              alt={`profile ${user.id}`}
            />
            <ArrowDropDownRounded sx={{ color: "background.paper" }} />
          </Stack>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          sx={{
            textDecoration: "underline",
          }}
        >
          {navigationLinks}
        </Stack>
      </Stack>
      <Menu onClose={handleClose} anchorEl={anchorEl} open={open}>
        <MenuItem onClick={handleViewProfile}>Profil</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
