import { CircularProgress, Stack, Typography } from "@mui/material";

const Loading = () => {
  return (
    <Stack spacing={1} justifyContent="center" alignItems="center">
      <Typography>Loading...</Typography>
      <CircularProgress
        thickness={5}
        sx={{
          color: "#000",
        }}
      />
    </Stack>
  );
};

export default Loading;
