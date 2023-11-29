import { Snackbar } from "@mui/base";
import { Alert } from "@mui/material";
import { Stack } from "@mui/system";
import { useState } from "react";
import { useLocation } from "react-router";
import Header from "../components/Header";

const ThreadDetailPage = () => {
  const location = useLocation();

  const [isCreateSuccessSnackbarOpen, setIsCreateSuccessSnackbarOpen] =
    useState(location.state?.justCreated ? true : false);

  const handleCloseCreateSuccessSnackbar = () => {
    setIsCreateSuccessSnackbarOpen(false);
  };

  return (
    <Stack minHeight="100vh" bgcolor="background.default" spacing={3}>
      <Header />

      <Snackbar
        open={isCreateSuccessSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseCreateSuccessSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseCreateSuccessSnackbar} severity="success">
          Thread berhasil dibuat
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default ThreadDetailPage;
