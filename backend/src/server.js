const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

const users = new Map(); // Para armazenar usuários conectados

wss.on("connection", (ws) => {
  ws.on("error", console.error);

  // Evento de mensagem recebida
  ws.on("message", (data) => {
    const message = JSON.parse(data);

    // Se for uma nova conexão
    if (message.event === "user_connected") {
      const { userName, userId } = message;
      users.set(userId, userName); // Adiciona o usuário à lista

      // Enviar a notificação para todos os clientes
      const userConnectedMessage = JSON.stringify({
        event: "user_connected",
        userName: userName,
        userId: userId,
      });
      broadcast(userConnectedMessage);
    } else {
      // Caso contrário, é uma mensagem normal (incluindo áudio e imagem)
      broadcast(data.toString());
    }
  });

  // Remover o usuário quando desconectar
  ws.on("close", () => {
    users.forEach((userName, userId) => {
      if (ws === userId) {
        users.delete(userId);

        const userDisconnectedMessage = JSON.stringify({
          event: "user_disconnected",
          userName: userName,
          userId: userId,
        });
        broadcast(userDisconnectedMessage);
      }
    });
  });

  console.log("Client connected");
});

// Função para enviar mensagens para todos os clientes
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}

// Enviar pings a cada 30 segundos para manter as conexões ativas
setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ event: "ping" }));
    }
  });
}, 30000);
