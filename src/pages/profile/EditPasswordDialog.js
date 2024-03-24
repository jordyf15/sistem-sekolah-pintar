import bcrypt from "bcryptjs";
import { useState } from "react";
import { useSelector } from "react-redux";

import { Dialog, DialogTitle } from "@mui/material";
import { Stack } from "@mui/system";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { updateUserPasswordInDB } from "../../database/user";

const EditPasswordDialog = ({ open, setOpen, onSuccess }) => {
  const user = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const onCloseDialog = () => {
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setConfirmPasswordError("");
    setIsLoading(false);
    setOpen(false);
  };

  const validatePassword = (newPassword) => {
    if (newPassword === confirmPassword) {
      setConfirmPasswordError("");
    } else {
      setConfirmPasswordError("Tidak boleh beda dengan kata sandi baru");
    }
    if (newPassword.length < 1) {
      setPasswordError("Kata sandi baru tidak boleh kosong");
      return false;
    } else if (newPassword.length < 6) {
      setPasswordError("Kata sandi baru harus minimal 6 karakter");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const validateConfirmPassword = (newConfirmPassword) => {
    if (newConfirmPassword !== password) {
      setConfirmPasswordError("Tidak boleh beda dengan kata sandi baru");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  const onPasswordChange = (newPassword) => {
    setPassword(newPassword);

    validatePassword(newPassword);
  };

  const onConfirmPasswordChange = (newConfirmPassword) => {
    setConfirmPassword(newConfirmPassword);

    validateConfirmPassword(newConfirmPassword);
  };

  const handleSubmit = async () => {
    let isValid = true;
    if (!validatePassword(password)) {
      isValid = false;
    }

    if (!validateConfirmPassword(confirmPassword)) {
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      await updateUserPasswordInDB(user.id, hash);
      onSuccess();
      onCloseDialog();
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
      <DialogTitle textAlign="center">Edit Kata Sandi</DialogTitle>
      <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
        <InputField
          labelText="Kata Sandi Baru"
          placeholder="Masukkan kata sandi baru"
          error={passwordError}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onBlur={() => onPasswordChange(password)}
          disabled={isLoading}
          isPasswordField
        />
        <InputField
          labelText="Ulang Kata Sandi Baru"
          placeholder="Masukkan ulang kata sandi baru"
          error={confirmPasswordError}
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          onBlur={() => onConfirmPasswordChange(confirmPassword)}
          disabled={isLoading}
          isPasswordField
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

export default EditPasswordDialog;
