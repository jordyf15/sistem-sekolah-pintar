import {
  Box,
  Dialog,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFileDownloadLink,
  uploadFile,
} from "../../cloudStorage/cloudStorage";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { updateUserInDB } from "../../database/user";

const EditProfileDialog = ({ open, setOpen, onEditUser }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [imageUrl, setImageUrl] = useState("");
  const [fullname, setFullname] = useState(user.fullname);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [oldpassword, setOldPassword] = useState(user.password);
  const [pic, setPic] = useState(null);
  const [picError, setPicError] = useState("");
  const [newpicpath, setPicpath] = useState(`/profile-image/${user.id}`);
  const [oldpicpath, setOldPicpath] = useState(user.profileImage);
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [fullnameError, setFullnameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    async function getImgUrl() {
      const downloadUrl = await getFileDownloadLink(user.profileImage);
      setImageUrl(downloadUrl);
    }

    getImgUrl();
  }, [user]);

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

  const validatePassword = (newPassword) => {
    if (newPassword.length === 0) return true;
    if (newPassword.length < 6) {
      setPasswordError("Kata sandi harus minimal 6 karakter");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const validateConfirmPassword = (newConfirm) => {
    if (newConfirm !== password) {
      setConfirmPasswordError("Tidak boleh beda dengan kata sandi");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  const validatePic = (pic) => {
    const MAX_FILE_SIZE = 5120;
    if (pic === null) {
      return true;
    }

    if (pic.size >= 5e6) {
      setPicError("ukuran file mesti dibawah 5MB");
      return false;
    }

    if (
      pic.type === "image/png" ||
      pic.type === "image/jpeg" ||
      pic.type === "image/jpg"
    ) {
      console.log("yessu");
      return true;
    }
    setPicError("Hanya .png /.jpeg/ .jpg");
    console.log("nope");
    return false;
  };

  const onFullnameChange = (newFullname) => {
    setFullname(newFullname);

    validateFullname(newFullname);
  };

  const onUsernameChange = (newUsername) => {
    setUsername(newUsername);

    validateUsername(newUsername);
  };

  const onPasswordChange = (newPassword) => {
    setPassword(newPassword);

    validatePassword(newPassword);
  };

  const onConfirmPasswordChange = (newConfirm) => {
    setConfirm(newConfirm);

    validateConfirmPassword(newConfirm);
  };

  const onCloseDialog = () => {
    setFullname(fullname);
    setUsername(username);
    password ? setOldPassword(password) : setOldPassword(oldpassword);
    setPassword("");
    setConfirm("");
    setPicpath(`/profile-image/${user.id}`);
    setPic(null);
    setPicError("");
    setIsLoading(false);
    setOpen(false);
    setPasswordError("");
    setConfirmPasswordError("");
  };

  const handleSubmit = async () => {
    let isValid = true;

    if (!validatePic(pic)) {
      isValid = false;
    }

    if (!validateFullname(fullname)) {
      isValid = false;
    }

    if (!validateUsername(username)) {
      isValid = false;
    }

    if (!validatePassword(password)) {
      isValid = false;
    }

    if (!validateConfirmPassword(confirm)) {
      isValid = false;
    }
    // file size dan tipe validation
    //alert bila sukses
    if (!isValid) return;
    setIsLoading(true);

    try {
      const img = {
        id: user.id,
        image: pic,
      };

      if (img.image != null) {
        await uploadFile(pic, newpicpath);
      }

      const editUser = {
        id: user.id,
        fullname: fullname,
        username: username,
        password: password ? password : oldpassword,
        role: user.role,
        profileImage: img.image ? newpicpath : oldpicpath,
      };

      await updateUserInDB(editUser);
      onEditUser(editUser);
    } catch (error) {
      console.log("handleEditProfile error", error);
    }

    onCloseDialog();
    setIsLoading(false);
    setOpen(false);
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
      <DialogTitle textAlign="center">Edit Profile</DialogTitle>
      <Stack alignItems="center" justifyContent="center">
        <Box
          sx={{ border: 1 }}
          width="110px"
          height="110px"
          borderRadius="50%"
          component="img"
          src={imageUrl}
          alt={`profile ${user.id}`}
        />
      </Stack>

      <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
        <InputField
          labelText="Nama Lengkap"
          placeholder={user.fullname}
          error={fullnameError}
          value={fullname}
          onChange={(e) => onFullnameChange(e.target.value)}
          onBlur={() => onFullnameChange(fullname)}
          disabled={isLoading}
        />
        <InputField
          labelText="UserName"
          placeholder={user.username}
          error={usernameError}
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onBlur={() => onUsernameChange(username)}
          disabled={isLoading}
        />
        <InputField
          labelText="Password"
          placeholder="Biarkan kosong bila tidak mau mengubah password"
          error={passwordError}
          onChange={(e) => onPasswordChange(e.target.value)}
          onBlur={() => onPasswordChange(password)}
          disabled={isLoading}
        />
        <InputField
          labelText="Confirm Password"
          placeholder="Confirm Password"
          error={confirmPasswordError}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          onBlur={() => onConfirmPasswordChange(confirm)}
          disabled={isLoading}
        />
        <Typography>Upload foto profile</Typography>
        <TextField
          name="upload-photo"
          type="file"
          error={!!picError}
          helperText={picError}
          onChange={(e) => {
            setPic(e.target.files[0]);
          }}
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
