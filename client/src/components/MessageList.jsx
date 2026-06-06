import {
  Box,
  Typography,
  Paper,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { memo, useEffect, useMemo, useRef } from "react";
import { formatTime, formatDay } from "../utils/format-date";
import DoneAllIcon from "@mui/icons-material/DoneAll";

export const MessageList = memo(function MessageList({
  messages,
  loading,
  userId,
  onOpenImage,
  loadMore,
  hasMore,
}) {
  const messageRef = useRef(null);
  const isFirstLoad = useRef(true);
  const previousHeight = useRef(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Agrupar mensagens por data
  const groupedMessages = useMemo(() => {
    const groups = {};

    messages.forEach((msg) => {
      const date = formatDay(msg.createdAt);

      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });

    return groups;
  }, [messages]);

  const handleScroll = () => {
    const el = messageRef.current;
    if (!el) return;

    if (el.scrollTop === 0 && hasMore && !loading) {
      previousHeight.current = el.scrollHeight;
      loadMore();
    }
  };

  useEffect(() => {
    const el = messageRef.current;
    if (!el) return;

    if (isFirstLoad.current) {
      el.scrollTop = el.scrollHeight;
      isFirstLoad.current = false;
      return;
    }

    const newHeight = el.scrollHeight;
    const diff = newHeight - previousHeight.current;

    if (diff > 0) {
      el.scrollTop += diff;
    }
  }, [messages]);

  return (
    <Box
      ref={messageRef}
      onScroll={handleScroll}
      flexGrow={1}
      width="100%"
      mx="auto"
      py={2}
      px={isMobile ? 2 : 4}
      display="flex"
      flexDirection="column"
      gap={3}
      overflow="auto"
    >
      {loading && <LinearProgress />}

      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <Box key={date}>
          <Typography
            variant="body2"
            textAlign="center"
            color="text.primary"
            mb={1}
          >
            {date}
          </Typography>

          {msgs.map((msg) => {
            const isMe = msg.sender.id === userId;

            return (
              <Box
                key={msg.id}
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
                  <Avatar
                    src={msg.sender.avatar}
                    sx={{
                      width: 30,
                      height: 30,
                    }}
                  />

                  {msg && (
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
                  )}
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
          })}
        </Box>
      ))}
    </Box>
  );
});
