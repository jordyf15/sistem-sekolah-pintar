import {
  DeleteForeverRounded,
  FileDownloadRounded,
  InsertDriveFileRounded,
} from "@mui/icons-material";
import { IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";

const EditFileItem = ({ id, name, filePath, onRemove }) => {
  const isSmallMobile = useMediaQuery("(max-width:400px)");

  const onDownloadFile = async () => {
    const downloadLink = await getFileDownloadLink(filePath);

    const aElement = document.createElement("a");
    aElement.href = downloadLink;
    aElement.target = "_blank";
    aElement.click();
  };

  return (
    <Grid xs={isSmallMobile ? 12 : 6} sm={4} md={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        py={1}
        pl={1}
        borderRadius="8px"
        sx={{
          boxSizing: "border-box",
          border: "3px solid rgba(0,0,0,0.5)",
          color: "rgba(0,0,0,0.5)",
          bgcolor: "background.paper",
        }}
        spacing={1}
        mb={2}
      >
        <InsertDriveFileRounded />
        <Typography fontSize="14px" noWrap>
          {name}
        </Typography>
        <Stack direction="row" justifyContent="center" alignItems="center">
          <IconButton sx={{ p: 1 }} onClick={onDownloadFile}>
            <FileDownloadRounded sx={{ color: "rgba(0,0,0,0.5)" }} />
          </IconButton>
          <IconButton sx={{ p: 1 }} onClick={() => onRemove(id)}>
            <DeleteForeverRounded sx={{ color: "rgba(0,0,0,0.5)" }} />
          </IconButton>
        </Stack>
      </Stack>
    </Grid>
  );
};

export default EditFileItem;
