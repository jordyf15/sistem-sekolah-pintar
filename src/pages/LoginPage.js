import { Box, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import ThemedButton from "../components/ThemedButton";
import { getUserByUsernameFromDB } from "../database/user";
import { updateUser } from "../slices/user";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateUsername = (newUsername) => {
    if (newUsername.length === 0) {
      setUsernameError("Username tidak boleh kosong");
      return false;
    } else {
      setUsernameError("");
      return true;
    }
  };

  const validatePassword = (newPassword) => {
    if (newPassword.length === 0) {
      setPasswordError("Kata sandi tidak boleh kosong");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const onUsernameChange = (newUsername) => {
    setUsername(newUsername);

    validateUsername(newUsername);
  };

  const onPasswordChange = (newPassword) => {
    setPassword(newPassword);

    validatePassword(newPassword);
  };

  const handleSubmit = async () => {
    let isValid = true;
    if (!validateUsername(username)) {
      isValid = false;
    }

    if (!validatePassword(password)) {
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const userWithUsername = await getUserByUsernameFromDB(username);

      if (!userWithUsername) {
        setUsernameError("Username tidak ditemukan");
        setIsLoading(false);
        return;
      }

      if (userWithUsername.password !== password) {
        setPasswordError("Kata sandi salah");
        setIsLoading(false);
        return;
      }

      dispatch(updateUser(userWithUsername));
      navigate("/");
    } catch (error) {
      console.log("handleSubmit error", error);
    }
    setIsLoading(false);
  };

  return (
    <Stack
      minHeight="100vh"
      bgcolor="#f2f2f2"
      alignItems="center"
      justifyContent="center"
    >
      <Stack spacing={3}>
        <Typography textAlign="center" fontSize="20px">
          Sistem Belajar Pintar
        </Typography>
        <Stack
          border="1px solid #000000"
          width="80vw"
          bgcolor="background.paper"
          maxWidth="400px"
          p={2}
          spacing={2}
          borderRadius="16px"
        >
          <Typography textAlign="center" fontSize="20px">
            Masuk
          </Typography>
          <InputField
            labelText="Username"
            placeholder="Masukkan username anda"
            error={usernameError}
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            onBlur={() => onUsernameChange(username)}
            disabled={isLoading}
          />
          <InputField
            labelText="Kata Sandi"
            placeholder="Masukkan kata sandi anda"
            error={passwordError}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onBlur={() => onPasswordChange(password)}
            isPasswordField
            disabled={isLoading}
          />
          <ThemedButton onClick={handleSubmit}>Masuk</ThemedButton>
          <Box textAlign="center">
            <Typography component="span">Belum memiliki akun? </Typography>
            <Typography to="/register" component={Link}>
              Daftar
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LoginPage;
