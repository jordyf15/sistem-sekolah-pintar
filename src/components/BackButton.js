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
        border: "2px solid #000",
        "&:hover": {
          bgcolor: hoverBgColor,
        },
      }}
      onClick={onClick}
    >
      <ArrowBackIosRounded sx={{ fontSize: "20px", color: "#000" }} />
    </IconButton>
  );
};

export default BackButton;
