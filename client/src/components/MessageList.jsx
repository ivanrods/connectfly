import {
  Box,
  Typography,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { memo, useEffect, useMemo, useRef } from "react";
import { formatDay } from "../utils/format-date";
import { MessageItem } from "./MessageItem";

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

          {msgs.map((msg) => (
            <MessageItem
              key={msg.id}
              msg={msg}
              isMe={msg.sender.id === userId}
              onOpenImage={onOpenImage}
              isMobile={isMobile}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
});
