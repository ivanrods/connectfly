import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button } from "@mui/material";

import { useProfile } from "../hooks/use-profile";
import { useConversations } from "../hooks/use-conversations";
import { useMessages, useSendMessage } from "../hooks/use-messages";
import { useConversationSocket } from "../hooks/use-conversation-socket";
import { useReadReceiptSocket } from "../hooks/use-read-receipt-socket";
import { useUnreadSocket } from "../hooks/use-unread-socket";
import { useFavoriteSocket } from "../hooks/use-favorite-conversation-socket";
import { useFavoriteConversation } from "../hooks/use-favorite-conversation";
import { useConversationsSocket } from "../hooks/use-conversations-socket";
import { useSocket } from "../context/socket-context";

import { CreateConversation } from "../components/CreateConversation";
import { Sidebar } from "../components/Sidebar";
import { MessageInput } from "../components/MessageInput";
import { ChatHeader } from "../components/ChatHeader";
import { MessageList } from "../components/MessageList";
import { useAlert } from "../context/alert-context";
import { EditProfile } from "../components/EditProfile";
import { ImageViewer } from "../components/ImageViewer";
import LoadingPage from "../components/LoadingPage";

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [openPofile, setOpenPofile] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const { showAlert } = useAlert();

  const socket = useSocket();

  const {
    user,
    loading: loadingProfile,
    error: errorProfile,
    updateUser,
    deleteUser,
    uploadAvatar,
    refetchUser,
  } = useProfile();

  const {
    conversations,
    loading: loadingConversations,
    error: errorConversations,
    createConversation,
    updateConversation,
    deleteConversation,
    updateFavorite,
    clearUnread,
    incrementUnread,
  } = useConversations();

  const {
    messages,
    setMessages,
    loading: loadingMessages,
    error: errorMessages,
    loadMore,
    hasMore,
  } = useMessages(selectedConversation?.id);

  const {
    sendMessage,
    loading: loadingSendMessage,
    error: errorSendMessage,
  } = useSendMessage(selectedConversation?.id);

  const {
    toggleFavorite,
    loading: loadingFavorite,
    error: errorFavorite,
  } = useFavoriteConversation();

  // Socket em tempo real
  const handleConversationUpdate = useCallback(
    ({ lastMessage }) => {
      updateConversation(lastMessage);
    },
    [updateConversation],
  );

  useConversationsSocket(handleConversationUpdate);

  const handleSendMessage = useCallback(
    async (content) => {
      await sendMessage(content);
    },
    [sendMessage],
  );

  const handleDeleteConversation = useCallback(
    async (conversationId) => {
      try {
        const res = await deleteConversation(conversationId);

        setSelectedConversation((prev) =>
          prev?.id === conversationId ? null : prev,
        );

        showAlert(res.message, "success");
      } catch (err) {
        showAlert(err.message, "error");
      }
    },
    [deleteConversation, showAlert],
  );

  //Atualizar favoritos
  const handleFavoriteUpdate = useCallback(
    ({ conversationId, favorite }) => {
      updateFavorite({ conversationId, favorite });

      setSelectedConversation((prev) =>
        prev?.id === conversationId
          ? {
              ...prev,
              favorite,
            }
          : prev,
      );
    },
    [updateFavorite],
  );

  useFavoriteSocket(handleFavoriteUpdate);

  const handleToggleFavorite = useCallback(
    async (conversationId) => {
      await toggleFavorite(conversationId);
    },
    [toggleFavorite],
  );

  //Mostra menssagens não lidas
  const handleUnread = useCallback(
    ({ conversationId, senderId }) => {
      if (!user?.id) return;
      if (senderId === user.id) return;
      if (selectedConversation?.id === conversationId) return;

      incrementUnread(conversationId);
    },

    [selectedConversation?.id, user?.id, incrementUnread],
  );

  const handleNewMessage = useCallback(
    (newMessage) => {
      setMessages((prev) =>
        prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage],
      );

      if (newMessage.sender.id !== user.id) {
        socket?.emit("markConversationRead", {
          conversationId: newMessage.conversationId,
          userId: user.id,
        });
      }
    },
    [setMessages, user?.id, socket],
  );

  const handleMessagesRead = useCallback(
    ({ messageIds }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg,
        ),
      );
    },
    [setMessages],
  );

  useConversationSocket(selectedConversation?.id, handleNewMessage);

  useReadReceiptSocket(selectedConversation?.id, handleMessagesRead);

  useUnreadSocket(handleUnread);

  useEffect(() => {
    if (!selectedConversation) return;

    clearUnread(selectedConversation.id);
  }, [selectedConversation, clearUnread]);

  //Mostra aleta de erros
  const shownErrorRef = useRef(null);

  useEffect(() => {
    const firstError = [
      errorConversations,
      errorMessages,
      errorSendMessage,
      errorProfile,
      errorFavorite,
    ].find(Boolean);

    if (!firstError) return;
    if (shownErrorRef.current === firstError) return;

    shownErrorRef.current = firstError;
    showAlert(firstError, "error");
  }, [
    errorConversations,
    errorMessages,
    errorSendMessage,
    errorProfile,
    errorFavorite,

    showAlert,
  ]);

  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleOpenModal = useCallback(() => setModalOpen(true), []);
  const handleOpenProfile = useCallback(() => setOpenPofile(true), []);
  const handleCloseProfile = useCallback(() => setOpenPofile(false), []);

  const handleOpenImage = useCallback((url) => {
    setSelectedImage(url);
  }, []);

  const handleCloseImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  if (loadingProfile) {
    return <LoadingPage />;
  }

  return (
    <Box display="flex" height="100dvh">
      <Box>
        <Sidebar
          open={sidebarOpen}
          onClose={handleCloseSidebar}
          conversations={conversations}
          loading={loadingConversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          user={user}
          userId={user.id}
          onAddConversation={handleOpenModal}
          handleProfile={handleOpenProfile}
        />
        <CreateConversation
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={createConversation}
        />
        <EditProfile
          open={openPofile}
          onClose={handleCloseProfile}
          user={user}
          updateProfile={updateUser}
          updateAvatar={uploadAvatar}
          refetchUser={refetchUser}
          deleteUser={deleteUser}
          loading={loadingProfile}
          onOpenImage={handleOpenImage}
        />
        <ImageViewer image={selectedImage} onClose={handleCloseImage} />
      </Box>

      <Box flex={1} display="flex" flexDirection="column">
        {!selectedConversation ? (
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Button variant="text" onClick={handleOpenSidebar}>
              Selecione uma conversa
            </Button>
          </Box>
        ) : (
          <>
            <ChatHeader
              conversation={selectedConversation}
              userId={user.id}
              onMenuClick={handleOpenSidebar}
              onDelete={handleDeleteConversation}
              onToggleFavorite={handleToggleFavorite}
              onOpenImage={handleOpenImage}
              loadingFavorite={loadingFavorite}
            />
            <MessageList
              messages={messages}
              loading={loadingMessages}
              userId={user.id}
              onOpenImage={handleOpenImage}
              loadMore={loadMore}
              hasMore={hasMore}
            />

            <MessageInput
              disabled={!selectedConversation}
              onSend={handleSendMessage}
              loading={loadingSendMessage}
            />
          </>
        )}
      </Box>
    </Box>
  );
}
