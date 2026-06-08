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
} from "@mui/material";
import { useUsers } from "../hooks/use-users";

export function CreateConversation({ open, onClose, onCreate }) {
  const { users, loading } = useUsers(open);

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
        )}
      </DialogContent>
    </Dialog>
  );
}
