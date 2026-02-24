# ConnectFly

ConnectFly é uma aplicação de **chat em tempo real**, desenvolvida com foco em **performance, escalabilidade e experiência do usuário**, utilizando **React no front-end**, **Node.js no back-end** e **Socket.IO** para comunicação em tempo real.

O projeto simula funcionalidades presentes em aplicações reais como WhatsApp e Telegram, incluindo **mensagens em tempo real, contagem de mensagens não lidas, favoritos e atualização instantânea da interface**.

---

## Demonstração

<img src="https://i.ibb.co/ZpmD853N/connect-chat.png" width="100%" alt="Imagem da tela de chat">

---

## Funcionalidades

### Autenticação

- Login com JWT
- Rotas protegidas
- Sessão persistente

### Chat em tempo real

- Envio e recebimento de mensagens via **Socket.IO**
- Atualização instantânea das conversas
- Notificação de mensagens não lidas

### Mensagens não lidas

- Contador de mensagens não lidas por conversa
- Incremento automático ao receber mensagens
- Reset ao abrir a conversa

### Favoritos

- Marcar / desmarcar conversas como favoritas
- Atualização em tempo real para o usuário
- Filtro de conversas favoritas

### Conversas

- Lista ordenada por atividade recente
- Última mensagem exibida na sidebar
- Busca por nome ou e-mail
- Envio de imagens

### Performance

- Paginação de mensagens no back-end
- Renderização otimizada no front-end
- Arquitetura preparada para grandes volumes de mensagens

## Arquitetura

### Front-end

- React + Vite
- Hooks personalizados
- Context API
- Material UI
- Socket.IO Client
- React Hook Form + Zod

### Back-end

- Node.js
- Express
- Sequelize
- PostgreSQL
- Socket.IO
- JWT
- Cloudinary
- Zod

### Comunicação em tempo real

- Salas por usuário (`user_{id}`)
- Salas por conversa (`conversation_{id}`)
- Eventos customizados:
  - `newMessage`
  - `unreadMessage`
  - `conversationUpdated`
  - `toggleFavorite`

## Estrutura de Pastas (resumida)

```txt
Connectfly/
├── server/
│   ├── controllers/
│   ├── models/
│   │   └── index.js
│   ├── routes/
│   ├── middlewares
│   ├── schemas
│   ├── config/
│   │   └── socket.js
│   └── app.js
│   └── server.js
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   │   └── Chat.jsx
│   │   ├── utils/
│   │   ├── theme/
│   └── main.jsx
```
