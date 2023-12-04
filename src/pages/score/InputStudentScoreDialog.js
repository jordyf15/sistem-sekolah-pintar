import { useState } from "react";

import { Dialog, DialogTitle, Stack } from "@mui/material";
import { v4 as uuid } from "uuid";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { upsertStudentScoreToDB } from "../../database/score";

const InputStudentScoreDialog = ({
  open,
  setOpen,
  scoreObj,
  student,
  studentScore,
  onSuccess,
}) => {
  const [score, setScore] = useState(studentScore ? studentScore.score : "");
  const [scoreError, setScoreError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {
    setScore(studentScore ? studentScore.score : "");
    setScoreError("");
    setIsLoading(false);
    setOpen(false);
  };

  const validateScore = (newScore) => {
    if (newScore.length < 1) {
      setScoreError("Nilai tidak boleh kosong");
      return false;
    } else if (parseInt(newScore) < 0) {
      setScoreError("Nilai tidak boleh dibawah 0");
      return false;
    } else if (parseInt(newScore) > 100) {
      setScoreError("Nilai tidak boleh diatas 100");
      return false;
    } else {
      setScoreError("");
      return true;
    }
  };

  const onScoreChange = (newScore) => {
    setScore(newScore);

    validateScore(newScore);
  };

  const handleSubmit = async () => {
    if (!validateScore(score)) return;

    setIsLoading(true);

    try {
      const insertedStudentScore = {
        id: studentScore ? studentScore.id : uuid(),
        studentId: student.id,
        scoreId: scoreObj.id,
        score: parseInt(score),
      };

      await upsertStudentScoreToDB(insertedStudentScore);

      onSuccess(insertedStudentScore);
      setScore(score);
      setIsLoading(false);
      setOpen(false);
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
      <DialogTitle textAlign="center">Isi Nilai Murid</DialogTitle>
      <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
        <InputField
          labelText={`Nilai ${scoreObj.name} (${student.fullname})`}
          placeholder="Masukkan nilai murid"
          error={scoreError}
          value={score}
          onChange={(e) => onScoreChange(e.target.value)}
          onBlur={() => onScoreChange(score)}
          disabled={isLoading}
          type="number"
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

export default InputStudentScoreDialog;
