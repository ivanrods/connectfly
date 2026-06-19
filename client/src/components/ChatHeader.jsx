import {
  Box,
  Avatar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Backdrop,
  Card,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PushPinIcon from "@mui/icons-material/PushPin";
import StarIcon from "@mui/icons-material/Star";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { memo, useState } from "react";
import { useOnlineStatus } from "../hooks/use-online-status";

export const ChatHeader = memo(function ChatHeader({
  conversation,
  userId,
  onMenuClick,
  onDelete,
  onToggleFavorite,
  onOpenImage,
  loadingFavorite,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isOnline } = useOnlineStatus();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDeleteConversation, setOpenDeleteConversation] = useState(false);

  if (!conversation) return null;

  const otherUser = conversation.users.find((user) => user.id !== userId);
  const isFavorite = conversation.favorite ?? false;

  //Abrir e fechar o menu
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseDeleteConversation = () => {
    setOpenDeleteConversation(false);
  };
  const handleOpenDeleteConversation = () => {
    setOpenDeleteConversation(true);
  };

  return (
    <Box
      padding={1.5}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      borderBottom={"1px solid #ddd"}
    >
      <Box display="flex" alignItems="center" gap={2}>
        {onMenuClick && (
          <IconButton onClick={onMenuClick} sx={{ display: { md: "none" } }}>
            <MenuIcon />
          </IconButton>
        )}

        <Avatar
          src={otherUser?.avatar}
          onClick={() => otherUser?.avatar && onOpenImage(otherUser.avatar)}
        />
        <Box>
          <Typography
            variant="subtitle1"
            noWrap
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            maxWidth={isMobile ? 200 : "100%"}
          >
            {otherUser?.name || "Usuário"}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5} p={0} m={0}>
            <Typography variant="caption">
              {isOnline(otherUser?.id) ? "online" : "offline"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box>
        <IconButton
          aria-label="more"
          id="long-button"
          aria-controls={open ? "long-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              style: {
                width: "20ch",
              },
            },
            list: {
              "aria-labelledby": "long-button",
            },
          }}
        >
          <MenuItem
            title="Adicionar aos favitos"
            disabled={loadingFavorite}
            onClick={() => {
              onToggleFavorite(conversation.id);
            }}
          >
            {isFavorite ? <PushPinIcon color="primary" /> : <PushPinIcon />}
            <Typography variant="body2" marginX={1}>
              Favoritar
            </Typography>
          </MenuItem>

          <MenuItem
            title="Apagar todas as mensagens"
            onClick={handleOpenDeleteConversation}
          >
            <RemoveCircleOutlineIcon color="error" />
            <Typography variant="body2" marginX={1}>
              Desconectar
            </Typography>
          </MenuItem>
        </Menu>
      </Box>

      <Backdrop
        sx={(theme) => ({
          zIndex: theme.zIndex.drawer + 1,
          paddingX: 2,
        })}
        open={openDeleteConversation}
      >
        <Card>
          <Box
            padding={2}
            display="flex"
            flexDirection="column"
            gap={2}
            maxWidth="sm"
          >
            <Typography variant="h6">Você tem certeza absoluta?</Typography>
            <Typography>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente
              suas conversas e removerá seus dados de nossos servidores.
            </Typography>
            <Box display="flex" gap={1} justifyContent="end">
              <Button
                variant="contained"
                color="inherit"
                onClick={handleCloseDeleteConversation}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  onDelete(conversation.id);
                }}
              >
                Confirmar
              </Button>
            </Box>
          </Box>
        </Card>
      </Backdrop>
    </Box>
  );
});
