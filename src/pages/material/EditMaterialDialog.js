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
import { deleteFile, uploadFile } from "../../cloudStorage/cloudStorage";
import InputField from "../../components/InputField";
import ThemedButton from "../../components/ThemedButton";
import { upsertTopicMaterialInDB } from "../../database/material";
import CreateFileItem from "./CreateFileItem";
import EditFileItem from "./EditFileItem";

const EditMaterialDialog = ({
  open,
  setOpen,
  topicId,
  material,
  materialId,
  onSuccess,
}) => {
  const [name, setName] = useState(material.name);
  const [link, setLink] = useState(material.link ? material.link : "");
  const [type, setType] = useState(material.link ? "link" : "file");
  const [newAttachment, setNewAttachment] = useState(null);
  const [oldAttachment, setOldAttachment] = useState(
    material.fileName ? material.fileName : ""
  );
  const [nameError, setNameError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [newAttachmentError, setNewAttachmentError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {
    setName(material.name);
    setLink(material.link ? material.link : "");
    setType(material.link ? "link" : "file");
    setNewAttachment(null);
    setOldAttachment(material.fileName ? material.fileName : "");
    setNameError("");
    setLinkError("");
    setNewAttachmentError("");
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

  const validateLink = (newLink) => {
    let isValidUrl = true;

    try {
      new URL(newLink);
    } catch (error) {
      isValidUrl = false;
    }

    if (newLink.length < 1) {
      setLinkError("Link tidak boleh kosong");
      return false;
    } else if (!isValidUrl) {
      setLinkError("Link tidak valid");
      return false;
    } else {
      setLinkError("");
      return true;
    }
  };

  const validateFile = (file) => {
    if (file.size > 10e6) {
      setNewAttachmentError("Ukuran file tidak boleh lebih dari 10MB");
      return false;
    } else {
      setNewAttachmentError("");
      return true;
    }
  };

  const onNameChange = (newName) => {
    setName(newName);

    validateName(newName);
  };

  const onLinkChange = (newLink) => {
    setLink(newLink);

    validateLink(newLink);
  };

  const onTypeChange = (e) => {
    setType(e.target.value);
  };

  const onFileUpload = (e) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    setNewAttachment(file);
    validateFile(file);
    setOldAttachment("");

    e.target.value = "";
  };

  const onRemoveNewAttachment = () => {
    setNewAttachment(null);
    setNewAttachmentError("Masukkan file");
  };

  const onRemoveOldAttachment = () => {
    setOldAttachment("");
    setNewAttachmentError("Masukkan file");
  };

  const handleSubmit = async () => {
    let isValid = true;
    if (!validateName(name)) {
      isValid = false;
    }

    if (type === "link") {
      if (!validateLink(link)) {
        isValid = false;
      }
    } else {
      if (!oldAttachment) {
        if (!newAttachment) {
          setNewAttachmentError("Masukkan file");
          isValid = false;
        } else if (!validateFile(newAttachment)) {
          isValid = false;
        }
      }
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const updatedMaterial = {
        id: materialId,
        name: name,
      };
      const fileRequests = [];

      if (type === "file") {
        if (newAttachment) {
          updatedMaterial.fileName = newAttachment.name;
          fileRequests.push(
            uploadFile(
              newAttachment,
              `/material-attachments/${materialId}/${newAttachment.name}`
            )
          );
          if (material.fileName) {
            fileRequests.push(
              deleteFile(
                `/material-attachments/${materialId}/${material.fileName}`
              )
            );
          }
        } else {
          updatedMaterial.fileName = oldAttachment;
        }
      } else {
        updatedMaterial.link = link;
        if (material.fileName) {
          fileRequests.push(
            deleteFile(
              `/material-attachments/${materialId}/${material.fileName}`
            )
          );
        }
      }

      await Promise.all(fileRequests);
      await upsertTopicMaterialInDB(topicId, updatedMaterial);

      onSuccess(topicId, updatedMaterial);
      setName(updatedMaterial.name);
      setLink(updatedMaterial.link ? updatedMaterial.link : "");
      setType(updatedMaterial.link ? "link" : "file");
      setNewAttachment(null);
      setOldAttachment(
        updatedMaterial.fileName ? updatedMaterial.fileName : ""
      );
      setNameError("");
      setLinkError("");
      setNewAttachmentError("");
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
      <DialogTitle textAlign="center">Edit Materi</DialogTitle>
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
            <FormControlLabel value="link" control={<Radio />} label="Link" />
          </Stack>
        </Box>
        {type === "link" ? (
          <InputField
            labelText="Link"
            placeholder="Masukkan link"
            error={linkError}
            value={link}
            onChange={(e) => onLinkChange(e.target.value)}
            onBlur={() => onLinkChange(link)}
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
            {oldAttachment && (
              <EditFileItem
                name={oldAttachment}
                filePath={`/material-attachments/${materialId}/${oldAttachment}`}
                onRemove={onRemoveOldAttachment}
              />
            )}
            <CreateFileItem
              attachment={newAttachment}
              error={newAttachmentError}
              onRemove={onRemoveNewAttachment}
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

export default EditMaterialDialog;
