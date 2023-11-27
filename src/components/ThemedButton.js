import { Button, darken, useTheme } from "@mui/material";

const ThemedButton = ({
  sx,
  children,
  type,
  size,
  disabled,
  variant = "contained",
  ...otherProps
}) => {
  const theme = useTheme();
  const borderColor = theme.palette.primary.light;
  const hoverColor = darken(
    variant === "contained" ? "#fff" : theme.palette.primary.light,
    0.05
  );
  const hoverBGColor = darken(
    variant === "contained"
      ? theme.palette.primary.light
      : theme.palette.background.paper,
    0.1
  );

  let bgcolor = disabled ? "unset" : "primary.light";
  switch (variant) {
    case "contained":
      bgcolor = "primary.light";
      break;
    case "outlined":
      bgcolor = "background.paper";
      break;
    default:
      break;
  }

  return (
    <Button
      sx={{
        bgcolor: bgcolor,
        color: variant === "contained" ? "#FFF" : "primary.light",
        textTransform: "none",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        fontSize: size === "small" ? "14px" : "16px",
        lineHeight: "normal",
        fontWeight: 500,
        borderRadius: 2,
        py: size === "small" ? 1 : 1.5,
        px: size === "small" ? 1.5 : 2,
        boxShadow:
          variant === "outlined"
            ? `inset 0px 0px 0px 2px ${borderColor}`
            : undefined,
        boxSizing: "border-box",
        "&:hover": {
          background: variant === "contained" ? hoverColor : "transparent",
          boxShadow:
            variant === "outlined"
              ? `inset 0px 0px 0px 2px ${hoverColor}`
              : undefined,
          bgcolor: hoverBGColor,
          color: hoverColor,
        },
        opacity: disabled ? 0.6 : 1,
        "&.Mui-disabled": {
          bgcolor:
            variant === "contained" ? "primary.light" : "background.primary",
          color: variant === "contained" ? "background.paper" : "primary.light",
          boxShadow:
            variant === "outlined"
              ? `inset 0px 0px 0px 2px ${borderColor}`
              : undefined,
        },
        ...sx,
      }}
      variant={variant}
      type={type}
      disabled={disabled}
      disableElevation
      {...otherProps}
    >
      {children}
    </Button>
  );
};

export default ThemedButton;
