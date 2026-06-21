import { memo } from "react";
import { Box, Typography, Paper, Avatar } from "@mui/material";
import { formatTime } from "../utils/format-date";
import DoneAllIcon from "@mui/icons-material/DoneAll";

export const MessageItem = memo(function MessageItem({ msg, isMe, onOpenImage, isMobile }) {
  return (
    <Box
      alignSelf={isMe ? "flex-end" : "flex-start"}
      display="flex"
      flexDirection="column"
      my={1}
    >
      <Box
        display="flex"
        alignItems="center"
        flexDirection={isMe ? "row-reverse" : "row"}
        gap={1}
      >
        <Avatar src={msg.sender.avatar} sx={{ width: 30, height: 30 }} />
        <Paper
          elevation={0}
          sx={{
            bgcolor: isMe ? "primary.main" : "border.main",
            color: isMe ? "text.secondary" : "text.primary",
            p: msg.imageUrl ? 0.3 : 1,
            maxWidth: isMobile ? "75%" : msg.imageUrl ? 300 : 500,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
        >
          {msg.imageUrl && (
            <Box
              component="img"
              src={msg.imageUrl}
              alt="imagem enviada"
              width="100%"
              height="100%"
              borderRadius={1}
              display="block"
              onClick={() => onOpenImage(msg.imageUrl)}
            />
          )}
          {msg.content && (
            <Typography variant="body1">{msg.content}</Typography>
          )}
        </Paper>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        alignSelf={isMe ? "flex-end" : "flex-start"}
      >
        <Typography variant="caption" color="text.primary">
          {formatTime(msg.createdAt)}
        </Typography>
        {isMe && (
          <Box>
            {msg.isRead ? (
              <DoneAllIcon fontSize="small" color="primary" />
            ) : (
              <DoneAllIcon fontSize="small" color="secondary" />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
});
