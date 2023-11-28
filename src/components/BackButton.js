import { useTheme } from "@emotion/react";
import { ArrowBackIosRounded } from "@mui/icons-material";
import { IconButton, darken } from "@mui/material";

const BackButton = ({ onClick }) => {
  const theme = useTheme();
  const hoverBgColor = darken(theme.palette.background.paper, 0.05);

  return (
    <IconButton
      sx={{
        width: "40px",
        height: "40px",
        bgcolor: "background.paper",
        "&:hover": {
          bgcolor: hoverBgColor,
        },
        boxShadow:
          "0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12);",
      }}
      onClick={onClick}
    >
      <ArrowBackIosRounded sx={{ fontSize: "20px", color: "#000" }} />
    </IconButton>
  );
};

export default BackButton;
