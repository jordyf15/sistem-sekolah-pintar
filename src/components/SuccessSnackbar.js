import { Alert, Snackbar } from "@mui/material";

const SuccessSnackbar = ({ text, onClose }) => {
  return (
    <Snackbar
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      open={!!text}
    >
      <Alert
        onClose={onClose}
        severity="success"
        sx={{
          bgcolor: "success.light",
          color: "#fff",
          "& .MuiAlert-icon": {
            color: "#fff",
          },
        }}
      >
        {text}
      </Alert>
    </Snackbar>
  );
};

export default SuccessSnackbar;
