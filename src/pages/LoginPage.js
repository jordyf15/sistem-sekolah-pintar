import { Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import ThemedButton from "../components/ThemedButton";
import { updateSchool } from "../slices/school";
import { updateUser } from "../slices/user";
import {
  getSchoolByIdFromDB,
  getUserByUsernameFromDB,
} from "../utils/firestore";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onUsernameChange = (newUsername) => {
    setUsername(newUsername);

    if (newUsername.length === 0) {
      setUsernameError("Username tidak boleh kosong");
    } else {
      setUsernameError("");
    }
  };

  const onPasswordChange = (newPassword) => {
    setPassword(newPassword);

    if (newPassword.length === 0) {
      setPasswordError("Kata sandi tidak boleh kosong");
    } else {
      setPasswordError("");
    }
  };

  const handleRegister = () => {
    navigate("/register");
  }

  const handleSubmit = () => {
    let isValid = true;
    if (username.length === 0) {
      setUsernameError("Username tidak boleh kosong");
      isValid = false;
    }
    if (password.length === 0) {
      setPasswordError("Kata sandi tidak boleh kosong");
      isValid = false;
    }

    if (!isValid) return;

    getUserByUsernameFromDB(username)
      .then((result) => {
        if (result === null) {
          setUsernameError("Username tidak ditemukan");
        } else {
          if (password !== result.password) {
            setPasswordError("Kata sandi salah");
          } else {
            dispatch(updateUser(result));
            getSchoolByIdFromDB(result.schoolId).then((school) => {
              dispatch(updateSchool(school));
              navigate("/");
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
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
          Sistem Sekolah Pintar
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
          <Typography textAlign="center">Masuk</Typography>
          <InputField
            labelText="Username"
            placeholder="Masukkan username anda"
            error={usernameError}
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            onBlur={() => onUsernameChange(username)}
          />
          <InputField
            labelText="Kata Sandi"
            placeholder="Masukkan kata sandi anda"
            error={passwordError}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onBlur={() => onPasswordChange(password)}
            isPasswordField
          />
          <ThemedButton onClick={handleSubmit}>Masuk</ThemedButton>
          <ThemedButton onClick={handleRegister}>Register</ThemedButton>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default LoginPage;
