import {
  DeleteForeverRounded,
  FileDownloadRounded,
  InsertDriveFileRounded,
} from "@mui/icons-material";
import { IconButton, Stack, Typography } from "@mui/material";
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";

const EditFileItem = ({ name, filePath, onRemove }) => {
  const onDownloadFile = async () => {
    const downloadLink = await getFileDownloadLink(filePath);

    const aElement = document.createElement("a");
    aElement.href = downloadLink;
    aElement.target = "_blank";
    aElement.click();
  };

  return (
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
    >
      <InsertDriveFileRounded />
      <Typography fontSize="14px" noWrap>
        {name}
      </Typography>
      <Stack direction="row" justifyContent="center" alignItems="center">
        <IconButton sx={{ p: 1 }} onClick={onDownloadFile}>
          <FileDownloadRounded sx={{ color: "rgba(0,0,0,0.5)" }} />
        </IconButton>
        <IconButton sx={{ p: 1 }} onClick={onRemove}>
          <DeleteForeverRounded sx={{ color: "rgba(0,0,0,0.5)" }} />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default EditFileItem;
