import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useAlert } from "../context/alert-context";

export const MessageInput = memo(function MessageInput({ onSend, disabled, loading }) {
  const { showAlert } = useAlert();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const imageUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSend = () => {
    if (!message.trim() && !file) return;

    if (file && file.size > 4 * 1024 * 1024) {
      showAlert("Imagem muito grande (máx 4MB)", "warning");
      return;
    }

    onSend({
      content: message,
      image: file,
    });
    setMessage("");
    setFile(null);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      padding={2}
      gap={1}
      borderTop={"1px solid #ddd"}
    >
      {file && (
        <Box position="relative">
          <Box
            component="img"
            src={imageUrl}
            maxHeight={40}
            maxWidth={40}
            borderRadius={1}
            alt="preview"
          />
          <IconButton
            size="small"
            onClick={() => setFile(null)}
            sx={{
              position: "absolute",
              top: -8,
              left: -8,
            }}
          >
            <DeleteOutlineIcon color="error" />
          </IconButton>
        </Box>
      )}

      <TextField
        fullWidth
        size="small"
        multiline
        maxRows={3}
        placeholder="Digite uma mensagem..."
        value={message}
        disabled={loading}
        onChange={(e) => setMessage(e.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleSend}
                  disabled={disabled}
                  color="primary"
                >
                  {loading ? <CircularProgress size={20} /> : <SendIcon />}
                </IconButton>
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="start">
                <IconButton onClick={handleAttachClick} disabled={file}>
                  <AttachFileIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        hidden
        onChange={handleFileChange}
      />
    </Box>
  );
});
