import {
  Drawer,
  List,
  ListItemButton,
  Avatar,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  TextField,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  Badge,
} from "@mui/material";
import { memo, useState } from "react";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import PushPinIcon from "@mui/icons-material/PushPin";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";

import { useAuth } from "../context/auth-context";

export const Sidebar = memo(function Sidebar({
  open,
  onClose,
  conversations,
  loading,
  selectedConversation,
  setSelectedConversation,
  user,
  userId,
  onAddConversation,
  handleProfile,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { signOut } = useAuth();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("recent");

  //filtro de conversas
  const filteredConversations = conversations
    .filter((conversation) => {
      const otherUser = conversation.users.find((u) => u.id !== userId);
      const isFavorite = conversation.favorite ?? false;
      const userSearch =
        otherUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
        otherUser?.email?.toLowerCase().includes(search.toLowerCase());

      if (!otherUser) return false;

      if (filter === "favorites") {
        return isFavorite && userSearch;
      }

      if (filter === "unread") {
        return conversation.unreadCount > 0 && userSearch;
      }

      return userSearch;
    })
    .sort((a, b) => {
      // Coloca conversas favoritas no topo
      const aIsFavorite = a.favorite ?? false;
      const bIsFavorite = b.favorite ?? false;

      if (aIsFavorite === bIsFavorite) return 0;
      return aIsFavorite ? -1 : 1;
    });

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={onClose}
      sx={{
        width: isMobile ? "85%" : 400,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isMobile ? "85%" : 400,
          boxSizing: "border-box",
        },
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="100%"
        sx={{ overflow: "hidden" }}
      >
        <Box display="flex" flexDirection="column" flexGrow={1} minHeight={0}>
          <Box display="flex" flexDirection="column" gap={2} padding={2}>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              justifyContent="space-between"
            >
              <Box
                display="flex"
                gap={2}
                alignItems="center"
                justifyContent="center"
              >
                <Badge
                  color="white"
                  badgeContent={
                    <IconButton>
                      <SettingsIcon
                        fontSize="small"
                        color="primary"
                        onClick={() => handleProfile()}
                      />
                    </IconButton>
                  }
                >
                  <Avatar src={user ? user.avatar : "?"} />
                </Badge>
                <Box>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    alignItems="center"
                    noWrap
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    maxWidth={isMobile ? 150 : 230}
                  >
                    {user.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    noWrap
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    width={isMobile ? 150 : 250}
                  >
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => signOut()} title="Sair">
                <LogoutIcon />
              </IconButton>
            </Box>

            <Box display="flex" alignItems="center">
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
              />

              <IconButton
                onClick={() => onAddConversation()}
                color="primary"
                title="Adicionar nova conexão"
              >
                <AddCircleIcon fontSize="large" />
              </IconButton>
            </Box>
          </Box>

          <List
            sx={{
              flexGrow: 1,
              minHeight: 0,
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: 0, height: 0 },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {filteredConversations.length === 0 && (
              <Typography variant="subtitle1" textAlign="center">
                Nenhuma conversa encontrada
              </Typography>
            )}
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.users.find((u) => u.id !== userId);
              const isSelected = selectedConversation?.id === conversation.id;
              const lastMessage = conversation.messages?.[0];

              return (
                <ListItemButton
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    if (isMobile) onClose();
                  }}
                  sx={{
                    bgcolor: isSelected ? "#ddd" : "transparent",
                  }}
                >
                  <Box
                    width="100%"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box gap={2} display="flex" alignItems="center">
                      <Badge
                        color="primary"
                        badgeContent={conversation.unreadCount}
                        invisible={!conversation.unreadCount}
                      >
                        <Avatar src={otherUser?.avatar} />
                      </Badge>

                      <Box
                        display="flex"
                        flexDirection="column"
                        width={isMobile ? 200 : 300}
                      >
                        <Typography
                          variant="subtitle1"
                          noWrap
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          width={isMobile ? 200 : 300}
                        >
                          {otherUser?.name || "Usuário"}
                        </Typography>
                        <Typography
                          variant="caption"
                          noWrap
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {lastMessage ? lastMessage.content : ""}
                        </Typography>
                      </Box>
                    </Box>
                    {conversation.favorite && (
                      <PushPinIcon fontSize="small" color="primary" />
                    )}
                  </Box>
                </ListItemButton>
              );
            })}
          </List>
        </Box>
        <Box display="flex" justifyContent="center">
          <ToggleButtonGroup
            color="primary"
            value={filter}
            exclusive
            onChange={(_, value) => {
              if (value) setFilter(value);
            }}
            aria-label="Platform"
            fullWidth
            sx={{ margin: 2 }}
          >
            <ToggleButton value="recent" fullWidth>
              Recentes
            </ToggleButton>
            <ToggleButton value="unread" fullWidth>
              Não Lidos
            </ToggleButton>
            <ToggleButton value="favorites" fullWidth>
              Favoritos
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Drawer>
  );
});
