import {
  FileDownloadRounded,
  InsertDriveFileRounded,
} from "@mui/icons-material";
import { IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { getFileDownloadLink } from "../../cloudStorage/cloudStorage";

const ViewFileItem = ({ name, filePath }) => {
  const isSmallMobile = useMediaQuery("(max-width:400px)");

  const onDownloadFile = async () => {
    const downloadLink = await getFileDownloadLink(filePath);

    const aElement = document.createElement("a");
    aElement.href = downloadLink;
    aElement.target = "_blank";
    aElement.click();
  };

  return (
    <Grid xs={isSmallMobile ? 12 : 8} sm={5} md={4}>
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
        <IconButton sx={{ p: 1 }} onClick={onDownloadFile}>
          <FileDownloadRounded sx={{ color: "rgba(0,0,0,0.5)" }} />
        </IconButton>
      </Stack>
    </Grid>
  );
};

export default ViewFileItem;
