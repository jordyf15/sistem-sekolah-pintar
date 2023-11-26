import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import InputField from "../components/InputField";
import ThemedButton from "../components/ThemedButton";
import { addUserToDB, getUserByUsernameFromDB } from "../database/user";

const RegisterPage = () => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullnameError, setFullnameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

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
    if (newPassword.length < 1) {
      setPasswordError("Kata sandi tidak boleh kosong");
      return false;
    } else if (newPassword.length < 6) {
      setPasswordError("Kata sandi harus minimal 6 karakter");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const validateConfirmPassword = (newConfirmPassword) => {
    if (newConfirmPassword !== password) {
      setConfirmPasswordError("Tidak boleh beda dengan kata sandi");
      return false;
    } else {
      setConfirmPasswordError("");
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

  const onPasswordChange = (newPassword) => {
    setPassword(newPassword);

    validatePassword(newPassword);
  };

  const onConfirmPasswordChange = (newConfirmPassword) => {
    setConfirmPassword(newConfirmPassword);

    validateConfirmPassword(newConfirmPassword);
  };

  const onRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleSubmit = async () => {
    let isValid = true;
    if (!validateFullname(fullname)) {
      isValid = false;
    }

    if (!validateUsername(username)) {
      isValid = false;
    }

    if (!validatePassword(password)) {
      isValid = false;
    }

    if (!validateConfirmPassword(confirmPassword)) {
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const userWithUsername = await getUserByUsernameFromDB(username);
      if (userWithUsername) {
        setUsernameError("Username tersebut sudah diambil");
        setIsLoading(false);
        return;
      }

      const user = {
        id: uuid(),
        fullname: fullname,
        username: username,
        password: password,
        role: role,
        profileImage: "profile-image/default.jpg",
      };

      await addUserToDB(user);

      navigate("login");
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
          spacing={1.5}
          borderRadius="16px"
        >
          <Typography textAlign="center" fontSize="20px">
            Daftar
          </Typography>
          <InputField
            labelText="Nama Lengkap"
            placeholder="Masukkan nama lengkap anda"
            error={fullnameError}
            value={fullname}
            onChange={(e) => onFullnameChange(e.target.value)}
            onBlur={() => onFullnameChange(fullname)}
            disabled={isLoading}
          />
          <InputField
            labelText="Username"
            placeholder="Masukkan username anda"
            error={usernameError}
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            onBlur={() => onUsernameChange(username)}
            disabled={isLoading}
          />
          <Box>
            <Typography
              component="span"
              fontWeight={500}
              fontSize="16px"
              color="#000000"
            >
              Peran
            </Typography>
            <Stack
              component={RadioGroup}
              direction="row"
              onChange={onRoleChange}
              value={role}
            >
              <FormControlLabel
                value="student"
                control={<Radio />}
                label="Murid"
              />
              <FormControlLabel
                value="teacher"
                control={<Radio />}
                label="Guru"
              />
            </Stack>
          </Box>
          <InputField
            labelText="Kata Sandi"
            placeholder="Masukkan kata sandi anda"
            error={passwordError}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onBlur={() => onPasswordChange(password)}
            disabled={isLoading}
            isPasswordField
          />
          <InputField
            labelText="Ulang Kata Sandi"
            placeholder="Masukkan ulang kata sandi anda"
            error={confirmPasswordError}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            onBlur={() => onConfirmPasswordChange(confirmPassword)}
            disabled={isLoading}
            isPasswordField
          />
          <ThemedButton onClick={handleSubmit}>Daftar</ThemedButton>
          <Box textAlign="center">
            <Typography component="span">Sudah memiliki akun? </Typography>
            <Typography to="/login" component={Link}>
              Masuk
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default RegisterPage;
