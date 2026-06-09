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
import { useState } from "react";
import { useUsers } from "../hooks/use-users";

export function CreateConversation({ open, onClose, onCreate }) {
  const { users, loading } = useUsers(open);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConnect = async (user) => {
    try {
      await onCreate(user.email);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nova conexão</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box component="form" mt={1}>
              {" "}
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

            <List sx={{ pt: 0 }}>
              {filteredUsers.map((user) => (
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
