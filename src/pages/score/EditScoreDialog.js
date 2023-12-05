import { Dialog, DialogTitle, Stack } from "@mui/material";
import { useState } from "react";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { updateScoreInDB } from "../../database/score";

const EditScoreDialog = ({ open, setOpen, score, onSuccess }) => {
  const [name, setName] = useState(score.name);
  const [nameError, setNameError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {
    setName(score.name);
    setNameError("");
    setIsLoading(false);
    setOpen(false);
  };

  const validateName = (newName) => {
    if (newName.length < 1) {
      setNameError("Nama nilai tidak boleh kosong");
      return false;
    } else {
      setNameError("");
      return true;
    }
  };

  const onNameChange = (newName) => {
    setName(newName);

    validateName(newName);
  };

  const handleSubmit = async () => {
    if (!validateName(name)) return;

    setIsLoading(true);

    try {
      await updateScoreInDB(score.id, name);
      setOpen(false);
      onSuccess(score.id, name);
    } catch (error) {
      console.log("handleSubmit error", error);
    }

    setIsLoading(false);
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
      <DialogTitle textAlign="center">Edit Kolom Nilai</DialogTitle>
      <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
        <InputField
          labelText="Nama Nilai"
          placeholder="Masukkan nama nilai"
          error={nameError}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={() => onNameChange(name)}
          disabled={isLoading}
        />

        <Stack direction="row" spacing={2}>
          <ThemedButton
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{ flex: 1 }}
          >
            Simpan
          </ThemedButton>
          <ThemedButton
            disabled={isLoading}
            variant="outlined"
            sx={{ flex: 1 }}
            onClick={onCloseDialog}
          >
            Batal
          </ThemedButton>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default EditScoreDialog;
