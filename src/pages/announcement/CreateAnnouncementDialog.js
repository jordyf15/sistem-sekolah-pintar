import { useState } from "react";
import { useParams } from "react-router-dom";

const CreateAnnouncementDialog = ({ open, setOpen, onSuccess }) => {
  const { id: classCourseId } = useParams();

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {
    setTitleError("");
    setTitle("");
    setDescription("");
    setDescriptionError("");
    setIsLoading(false);
    setOpen(false);
  };

  const validateTitle = (newTitle) => {
    if (newTitle.length < 1) {
      setTitleError("Judul pengumuman tidak boleh kosong");
      return false;
    } else {
      setTitleError("");
      return true;
    }
  };

  const validateDescription = (newDescription) => {
    if (newDescription.length < 1) {
      setDescriptionError("Deskripsi pengumuman tidak boleh kosong");
      return false;
    } else {
      setDescriptionError("");
      return true;
    }
  };

  const onTitleChange = (newTitle) => {
    setTitle(newTitle);

    validateTitle(newTitle);
  };

  const onDescriptionChange = (newDescription) => {
    setDescription(newDescription);

    validateDescription(newDescription);
  };
};
