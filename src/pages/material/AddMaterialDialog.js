import { AttachmentRounded } from "@mui/icons-material";
import {
  Box,
  Dialog,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { upsertTopicMaterialInDB } from "../../database/material";
import CreateFileItem from "./CreateFileItem";

const AddMaterialDialog = ({ open, setOpen, topic, onSuccess }) => {
  const [name, setName] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [type, setType] = useState("file");
  const [attachment, setAttachment] = useState(null);
  const [nameError, setNameError] = useState("");
  const [videoLinkError, setVideoLinkError] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {
    setName("");
    setVideoLink("");
    setType("file");
    setAttachment(null);
    setNameError("");
    setVideoLinkError("");
    setAttachmentError("");
    setIsLoading(false);
    setOpen(false);
  };

  const validateName = (newName) => {
    if (newName.length < 1) {
      setNameError("Nama materi tidak boleh kosong");
      return false;
    } else {
      setNameError("");
      return true;
    }
  };

  const validateVideoLink = (newVideoLink) => {
    let isValidUrl = true;

    try {
      new URL(newVideoLink);
    } catch (error) {
      isValidUrl = false;
    }

    if (newVideoLink.length < 1) {
      setVideoLinkError("Link video tidak boleh kosong");
      return false;
    } else if (!isValidUrl) {
      setVideoLinkError("Link video harus link yang valid");
      return false;
    } else {
      setVideoLinkError("");
      return true;
    }
  };

  const validateFile = (file) => {
    if (!file) {
      setAttachmentError("Masukkan file");
      return false;
    } else if (file.size > 10e6) {
      setAttachmentError("Ukuran file tidak boleh lebih dari 10MB");
      return false;
    } else {
      setAttachmentError("");
      return true;
    }
  };

  const onNameChange = (newName) => {
    setName(newName);

    validateName(newName);
  };

  const onVideoLinkChange = (newVideoLink) => {
    setVideoLink(newVideoLink);

    validateVideoLink(newVideoLink);
  };

  const onTypeChange = (e) => {
    setType(e.target.value);
  };

  const onFileUpload = (e) => {
    if (!e.target.files) return;

    const file = e.target.files[0];

    setAttachment(file);
    validateFile(file);

    e.target.value = "";
  };

  const onRemoveFile = () => {
    setAttachment(null);
    setAttachmentError("");
  };

  const handleSubmit = async () => {
    let isValid = true;
    if (!validateName(name)) {
      isValid = false;
    }

    if (type === "video") {
      if (!validateVideoLink(videoLink)) {
        isValid = false;
      }
    } else {
      if (!validateFile(attachment)) {
        isValid = false;
      }
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const materialIdPrefix =
        Object.keys(topic.materials).length < 1
          ? 1
          : Math.max(
              ...Object.keys(topic.materials).map((id) =>
                parseInt(id.split(":")[0])
              )
            ) + 1;
      const material = {
        id: `${materialIdPrefix}:${uuid()}`, // idnya di prefix biar urutan material di firestorenya bener
        name: name,
      };

      if (type === "file") {
        material.fileName = attachment.name;
      } else {
        material.link = videoLink;
      }

      await upsertTopicMaterialInDB(topic.id, material);

      onSuccess(topic.id, material);
      onCloseDialog();
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
      <DialogTitle textAlign="center">Tambah Materi</DialogTitle>
      <Stack px={{ xs: 2, sm: 4 }} pb={{ xs: 2, sm: 4 }} spacing={2}>
        <InputField
          labelText="Nama Materi"
          placeholder="Masukkan nama materi"
          error={nameError}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={() => onNameChange(name)}
          disabled={isLoading}
        />
        <Box>
          <Typography
            component="span"
            fontWeight={500}
            fontSize="16px"
            color="#000000"
          >
            Tipe Materi
          </Typography>
          <Stack
            component={RadioGroup}
            direction="row"
            onChange={onTypeChange}
            value={type}
          >
            <FormControlLabel value="file" control={<Radio />} label="File" />
            <FormControlLabel value="video" control={<Radio />} label="Video" />
          </Stack>
        </Box>
        {type === "video" ? (
          <InputField
            labelText="Link Video"
            placeholder="Masukkan link video"
            error={videoLinkError}
            value={videoLink}
            onChange={(e) => onVideoLinkChange(e.target.value)}
            onBlur={() => onVideoLinkChange(videoLink)}
            disabled={isLoading}
          />
        ) : (
          <>
            <Stack alignItems="flex-start" mb={2}>
              <input
                id="file-input"
                type="file"
                hidden
                onChange={onFileUpload}
              />
              <label htmlFor="file-input">
                <IconButton component="span">
                  <AttachmentRounded sx={{ color: "#000" }} />
                </IconButton>
              </label>
            </Stack>

            <CreateFileItem
              attachment={attachment}
              error={attachmentError}
              onRemove={onRemoveFile}
            />
          </>
        )}
        <Stack direction="row" spacing={2}>
          <ThemedButton
            onClick={handleSubmit}
            sx={{ flex: 1 }}
            disabled={isLoading}
          >
            Simpan
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

export default AddMaterialDialog;
