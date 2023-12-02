import {
  DeleteForeverRounded,
  InsertDriveFileRounded,
} from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/material";

const CreateFileItem = ({ attachment, error, onRemove }) => {
  return (
    <Stack spacing={0.5} mt={!attachment ? "0px !important" : 2}>
      {attachment && (
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
        >
          <InsertDriveFileRounded />
          <Typography fontSize="14px" noWrap>
            {attachment.name}
          </Typography>
          <IconButton sx={{ p: 1 }} onClick={() => onRemove()}>
            <DeleteForeverRounded
              sx={{ color: error ? "error.main" : "rgba(0,0,0,0.5)" }}
            />
          </IconButton>
        </Stack>
      )}
      {error && (
        <Typography
          mx={attachment ? "14px !important" : "8px !important"}
          fontSize="12px"
          color="error.main"
        >
          {error}
        </Typography>
      )}
    </Stack>
  );
};

export default CreateFileItem;
