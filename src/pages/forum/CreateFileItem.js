import {
  DeleteForeverRounded,
  InsertDriveFileRounded,
} from "@mui/icons-material";
import {
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2

const CreateFileItem = ({ id, name, error, onRemove }) => {
  const isSmallMobile = useMediaQuery("(max-width:400px)");
  const content = (
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
      <IconButton sx={{ p: 1 }} onClick={() => onRemove(id)}>
        <DeleteForeverRounded
          sx={{ color: error ? "error.main" : "rgba(0,0,0,0.5)" }}
        />
      </IconButton>
    </Stack>
  );

  return (
    <Grid xs={isSmallMobile ? 12 : 6} sm={4} md={3}>
      {error ? (
        <Tooltip
          title={error}
          followCursor
          sx={{ bgcolor: "error.main" }}
          enterTouchDelay={0}
          leaveTouchDelay={3000}
        >
          {content}
        </Tooltip>
      ) : (
        content
      )}
    </Grid>
  );
};

export default CreateFileItem;
