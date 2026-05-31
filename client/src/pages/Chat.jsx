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

  const handleSendMessage = async (content) => {
    await sendMessage(content);
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      const res = await deleteConversation(conversationId);

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }

      showAlert(res.message, "success");
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

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

  const handleToggleFavorite = async (conversationId) => {
    await toggleFavorite(conversationId);
  };

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
      setMessages((prev) => [...prev, newMessage]);
    },
    [setMessages],
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

  //Ver imagem
  const handleOpenImage = (url) => {
    setSelectedImage(url);
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  if (loadingProfile) {
    return <LoadingPage />;
  }

  return (
    <Box display="flex" height="100dvh">
      <Box>
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          loading={loadingConversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          user={user}
          userId={user.id}
          onAddConversation={() => setModalOpen(true)}
          handleProfile={() => setOpenPofile(true)}
        />
        <CreateConversation
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={createConversation}
        />
        <EditProfile
          open={openPofile}
          onClose={() => setOpenPofile(false)}
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
            <Button variant="text" onClick={() => setSidebarOpen(true)}>
              Selecione uma conversa
            </Button>
          </Box>
        ) : (
          <>
            <ChatHeader
              conversation={selectedConversation}
              userId={user.id}
              onMenuClick={() => setSidebarOpen(true)}
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
