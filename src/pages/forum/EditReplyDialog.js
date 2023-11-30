import { useState } from "react";
import { v4 as uuid } from "uuid";

const EditReplyDialog = ({ open, setOpen, replyObj, onSuccess }) => {
  const [reply, setReply] = useState(replyObj.reply);
  const [replyError, setReplyError] = useState("");
  const [newAttachments, setNewAttachments] = useState(new Map());
  const [newAttachmentsError, setNewAttachmentsError] = useState(new Map());
  const [oldAttachments, setOldAttachments] = useState(replyObj.attachments);
  const [deletedOldAttachments, setDeletedOldAttachments] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const onCloseDialog = () => {};

  const validateReply = (newReply) => {
    if (newReply.length < 1) {
      setReplyError("Balasan tidak boleh kosong");
      return false;
    } else {
      setReplyError("");
      return true;
    }
  };

  const validateFile = (file) => {
    if (file.size > 10e6) {
      return "Ukuran file tidak boleh lebih dari 10MB";
    } else {
      return "";
    }
  };

  const onReplyChange = (newReply) => {
    setReply(newReply);

    validateReply(newReply);
  };

  const onFileUpload = (e) => {
    if (!e.target.files) return;

    const file = e.target.files[0];

    const tempNewAttachments = new Map(newAttachments);

    const fileId = uuid();

    tempNewAttachments.set(fileId, file);
    setNewAttachments(tempNewAttachments);

    const fileError = validateFile(file);
    if (fileError) {
      const tempNewAttachmentsError = new Map(newAttachmentsError);
      tempNewAttachmentsError.set(fileId, fileError);
      setNewAttachmentsError(tempNewAttachmentsError);
    }

    e.target.value = "";
  };

  const onRemoveNewAttachments = (id) => {
    const tempNewAttachments = new Map(newAttachments);
    tempNewAttachments.delete(id);
    setNewAttachments(tempNewAttachments);

    const tempNewAttachmentsError = new Map(newAttachmentsError);
    tempNewAttachmentsError.delete(id);
    setNewAttachmentsError(newAttachmentsError);
  };

  const onRemoveOldAttachments = (id) => {};

  const handleSubmit = async () => {};
};

export default EditReplyDialog;
