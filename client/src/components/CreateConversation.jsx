import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  CircularProgress,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useRef, useCallback } from "react";
import { useUsers } from "../hooks/use-users";

export function CreateConversation({ open, onClose, onCreate }) {
  const [search, setSearch] = useState("");
  const { users, loading, hasMore, loadMore } = useUsers(open, search);
  const listRef = useRef(null);

  const handleConnect = async (user) => {
    try {
      await onCreate(user.email);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;

    const threshold = 50;
    if (
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold &&
      hasMore &&
      !loading
    ) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nova conexão</DialogTitle>

      <DialogContent
        ref={listRef}
        onScroll={handleScroll}
        sx={{ overflow: "auto" }}
      >
        <Box mb={2} mt={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Busque por nome ou email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 1 }}
          />
        </Box>

        {loading && users.length === 0 ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <List sx={{ pt: 0 }}>
              {users.map((user) => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleConnect(user)}
                    >
                      Conectar
                    </Button>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={user.email}
                    secondaryTypographyProps={{ sx: { color: "#999" } }}
                  />
                </ListItem>
              ))}
            </List>

            {loading && users.length > 0 && (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
