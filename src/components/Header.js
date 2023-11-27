import { ArrowDropDownRounded } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getFileDownloadLink } from "../cloudStorage/cloudStorage";
import { removeUser } from "../slices/user";

const Header = () => {
  const user = useSelector((state) => state.user);
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
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Stack p={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography>Sistem Belajar Pintar</Typography>
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
      </Stack>
      <Menu onClose={handleClose} anchorEl={anchorEl} open={open}>
        <MenuItem onClick={()=>{navigate("/profile")}}>Profil</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
