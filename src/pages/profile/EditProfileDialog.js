import { Box, Dialog, DialogTitle, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFileDownloadLink,
  uploadFile,
} from "../../cloudStorage/cloudStorage";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { getUserByUsernameFromDB, updateUserInDB } from "../../database/user";
import { updateUser } from "../../slices/user";

const EditProfileDialog = ({ open, setOpen, onSuccess }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [fullname, setFullname] = useState(user.fullname);
  const [username, setUsername] = useState(user.username);
  const [oldImgUrl, setOldImgUrl] = useState("");
  const [profileImg, setProfileImg] = useState(null);
  const [fullnameError, setFullnameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [profileImgError, setProfileImgError] = useState("");
  const fileInput = useRef();

  useEffect(() => {
    async function getImgUrl() {
      const downloadUrl = await getFileDownloadLink(user.profileImage);
      setOldImgUrl(downloadUrl);
    }

    getImgUrl();
  }, [user]);

  const onCloseDialog = () => {
    setFullname(user.fullname);
    setUsername(user.username);
    setProfileImg(null);
    setFullnameError("");
    setUsernameError("");
    setProfileImgError("");
    setIsLoading(false);
    setOpen(false);
  };

  const validateFullname = (newFullname) => {
    if (newFullname.length < 1) {
      setFullnameError("Nama lengkap tidak boleh kosong");
      return false;
    } else {
      setFullnameError("");
      return true;
    }
  };

  const validateUsername = (newUsername) => {
    if (newUsername.length < 1) {
      setUsernameError("Username tidak boleh kosong");
      return false;
    } else {
      setUsernameError("");
      return true;
    }
  };

  const validateProfileImg = (newProfileImg) => {
    if (!newProfileImg) return true;

    if (newProfileImg.size > 5e6) {
      setProfileImgError("Ukuran file tidak boleh diatas 5MB");
      return false;
    } else if (
      newProfileImg.type !== "image/png" &&
      newProfileImg.type !== "image/jpeg" &&
      newProfileImg.type !== "image/jpg"
    ) {
      setProfileImgError("File hanya boleh format .png, .jpeg, atau .jpg");
      return false;
    } else {
      setProfileImgError("");
      return true;
    }
  };

  const onFullnameChange = (newFullname) => {
    setFullname(newFullname);

    validateFullname(newFullname);
  };

  const onUsernameChange = (newUsername) => {
    setUsername(newUsername);

    validateUsername(newUsername);
  };

  const onFileUpload = (e) => {
    if (!e.target.files) return;

    const file = e.target.files[0];

    setProfileImg(file);
    validateProfileImg(file);

    e.target.value = "";
  };

  const handleSubmit = async () => {
    let isValid = true;

    if (!validateProfileImg(profileImg)) {
      isValid = false;
    }

    if (!validateFullname(fullname)) {
      isValid = false;
    }

    if (!validateUsername(username)) {
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      if (username !== user.username) {
        const userWithUsername = await getUserByUsernameFromDB(username);
        if (userWithUsername) {
          setUsernameError("Username tersebut sudah diambil");
          setIsLoading(false);
          return;
        }
      }

      if (profileImg) {
        await uploadFile(profileImg, `/profile-image/${user.id}`);
      }

      const updatedUser = {
        id: user.id,
        fullname: fullname,
        username: username,
        profileImage: profileImg
          ? `/profile-image/${user.id}`
          : user.profileImage,
      };

      await updateUserInDB(updatedUser);
      setFullname(updatedUser.fullname);
      setUsername(updatedUser.username);
      setProfileImg(null);
      setOpen(false);
      dispatch(
        updateUser({
          ...user,
          fullname: updatedUser.fullname,
          username: updatedUser.username,
          profileImage: updatedUser.profileImage,
        })
      );
      onSuccess();
    } catch (error) {
      console.log("handleSubmit error", error);
    }
    setIsLoading(false);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={onCloseDialog}
      open={open}
      sx={{
        "& .MuiPaper-root": {
          mx: 1,
          width: "100vw",
        },
      }}
    >
      <DialogTitle textAlign="center">Edit Profil</DialogTitle>
      <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
        <Stack alignItems="center" justifyContent="center" spacing={1}>
          <Box
            sx={{ border: 1 }}
            width="110px"
            height="110px"
            borderRadius="50%"
            component="img"
            src={profileImg ? URL.createObjectURL(profileImg) : oldImgUrl}
            alt={`profile ${user.id}`}
          />
          <input
            id="profile-image-input"
            type="file"
            hidden
            ref={fileInput}
            onChange={onFileUpload}
          />
          <ThemedButton onClick={() => fileInput.current.click()} size="small">
            Pilih Foto
          </ThemedButton>
          {profileImgError && (
            <Typography fontSize="12px" color="error.main">
              {profileImgError}
            </Typography>
          )}
        </Stack>
        <InputField
          labelText="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          error={fullnameError}
          value={fullname}
          onChange={(e) => onFullnameChange(e.target.value)}
          onBlur={() => onFullnameChange(fullname)}
          disabled={isLoading}
        />
        <InputField
          labelText="UserName"
          placeholder="Masukkan username"
          error={usernameError}
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onBlur={() => onUsernameChange(username)}
          disabled={isLoading}
        />
        <Stack direction="row" spacing={2}>
          <ThemedButton
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{ flex: 1 }}
          >
            Simpan
          </ThemedButton>
          <ThemedButton
            disabled={isLoading}
            variant="outlined"
            sx={{ flex: 1 }}
            onClick={onCloseDialog}
          >
            Batal
          </ThemedButton>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default EditProfileDialog;
