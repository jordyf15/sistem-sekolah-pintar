import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  IconButton,
  InputAdornment,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const InputField = ({
  id,
  value,
  type = "text",
  labelText,
  placeholder,
  isPasswordField,
  error,
  onChange,
  onFocus,
  onKeyUp,
  onBlur,
  disabled,
  containerSx,
  textFieldSx,
  adornmentSx,
  inputProps,
  labelTextSx,
  multiline = false,
  rows = 1,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const toggleVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <Box sx={{ ...containerSx }}>
      <InputLabel
        sx={{
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          mb: "8px",
        }}
        htmlFor={id}
      >
        <Typography
          component="span"
          fontWeight={500}
          fontSize="16px"
          color="#000000"
          sx={labelTextSx}
        >
          {labelText}
        </Typography>
      </InputLabel>
      <TextField
        id={id}
        error={!!error}
        helperText={error}
        placeholder={placeholder}
        value={value}
        size="small"
        fullWidth
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyUp={onKeyUp}
        multiline={multiline}
        rows={rows}
        sx={{
          fontFamily: ["Encode Sans", "sans-serif"].join(","),
          input: {
            py: "12px",
            px: "16px",
          },
          fieldset: {
            borderColor: "rgba(0,0,0,0.4)",
            borderRadius: "8px",
          },
          "& ::placeholder": {
            color: "#000000",
          },
          fontWeight: 500,
          fontSize: "20px",
          ...textFieldSx,
        }}
        type={!isPasswordField ? type : isPasswordVisible ? "text" : "password"}
        disabled={disabled}
        inputProps={inputProps}
        InputProps={{
          endAdornment: isPasswordField ? (
            <InputAdornment position="end">
              <IconButton
                sx={{ height: "100%", ...adornmentSx }}
                onClick={toggleVisibility}
                edge="end"
              >
                {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      ></TextField>
    </Box>
  );
};

export default InputField;
