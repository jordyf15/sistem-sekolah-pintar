import { Dialog, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { deleteFile } from "../../cloudStorage/cloudStorage";
import ThemedButton from "../../components/ThemedButton";
import { deleteTopicInDB } from "../../database/material";

const DeleteTopicDialog = ({ open, setOpen, topic, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {
    setIsLoading(false);
    setOpen(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const deleteFiles = [];
      Object.entries(topic.materials).forEach(([materialId, material]) => {
        if (material.fileName) {
          deleteFiles.push(
            deleteFile(
              `/material-attachments/${materialId}/${material.fileName}`
            )
          );
        }
      });

      await deleteTopicInDB(topic.id);

      onSuccess(topic.id);
      setOpen(false);
    } catch (error) {
      console.log("handleSubmit error", error);
    }

    setIsLoading(true);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={onCloseDialog}
      open={open}
      sx={{
        "& .MuiPaper-root": {
          mx: 1,
          width: "100vw",
        },
      }}
    >
      <Stack px={{ xs: 2, sm: 4 }} py={{ xs: 2, sm: 4 }} spacing={2}>
        <Typography fontSize={{ xs: "14px", sm: "16px" }}>
          Apakah anda yakin ingin menghapus topik <b>{topic.name}</b>?
        </Typography>
        <Stack direction="row" spacing={2}>
          <ThemedButton
            onClick={handleSubmit}
            sx={{ flex: 1 }}
            disabled={isLoading}
          >
            Hapus
          </ThemedButton>
          <ThemedButton
            onClick={onCloseDialog}
            variant="outlined"
            sx={{ flex: 1 }}
            disabled={isLoading}
          >
            Batal
          </ThemedButton>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default DeleteTopicDialog;
