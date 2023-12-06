import {
  DeleteForeverRounded,
  InsertDriveFileRounded,
} from "@mui/icons-material";
import { IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2

const CreateFileItem = ({ name, error, onRemove }) => {
  const isSmallMobile = useMediaQuery("(max-width:400px)");

  return (
    <Grid xs={isSmallMobile ? 12 : 8} sm={5} md={4}>
      <Stack spacing={0.5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          py={1}
          pl={1}
          borderRadius="8px"
          sx={{
            boxSizing: "border-box",
            border: error ? "3px solid #d32f2f" : "3px solid rgba(0,0,0,0.5)",
            color: error ? "error.main" : "rgba(0,0,0,0.5)",
            bgcolor: "background.paper",
          }}
          spacing={1}
          mb={2}
        >
          <InsertDriveFileRounded />
          <Typography fontSize="14px" noWrap>
            {name}
          </Typography>
          <IconButton sx={{ p: 1 }} onClick={() => onRemove()}>
            <DeleteForeverRounded
              sx={{ color: error ? "error.main" : "rgba(0,0,0,0.5)" }}
            />
          </IconButton>
        </Stack>
        {error && (
          <Typography ml="14px !important" fontSize="12px" color="error.main">
            {error}
          </Typography>
        )}
      </Stack>
    </Grid>
  );
};

export default CreateFileItem;
