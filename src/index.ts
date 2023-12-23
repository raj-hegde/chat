import { server as WebSocketServer, connection } from "websocket";
import http from "http";
import { UserManager } from "./UserManager";
import { IncomingMessage, SupportedMessage } from "./messages/incomingMessages";
import { InMemoryStore } from "./store/InMemoryStore";
import {
  OutgoingMessage,
  SupportedMessage as OutgoingSupportedMessages,
} from "./messages/outgoingMessages";

const server = http.createServer(function (request: any, response: any) {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

server;

const userManager = new UserManager();
const store = new InMemoryStore();

server.listen(8080, function () {
  console.log(new Date() + " Server is listening on port 8080");
});

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

function originIsAllowed(origin: string) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on("request", function (request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log(
      new Date() + " Connection from origin " + request.origin + " rejected."
    );
    return;
  }

  var connection = request.accept("echo-protocol", request.origin);
  console.log(new Date() + " Connection accepted.");
  connection.on("message", function (message) {
    if (message.type === "utf8") {
      try {
        messageHandler(connection, JSON.parse(message.utf8Data));
      } catch (e) {}
    }
  });
});

function messageHandler(ws: connection, message: IncomingMessage) {
  if (message.type == SupportedMessage.JoinRoom) {
    const payload = message.payload;
    userManager.addUser(payload.name, payload.userId, payload.roomId, ws);
  }
  if (message.type === SupportedMessage.SendMessage) {
    const payload = message.payload;
    const user = userManager.getUser(payload.roomId, payload.userId);

    if (!user) {
      console.error("User not found in the db");
      return;
    }
    let chat = store.addChat(
      payload.userId,
      user.name,
      payload.roomId,
      payload.message
    );
    if (!chat) {
      return;
    }
    // Todo add broadcast logic here
    const outgoingPayload: OutgoingMessage = {
      type: OutgoingSupportedMessages.AddChat,
      payload: {
        chatId: chat.id,
        roomID: payload.roomId,
        message: payload.message,
        name: user.name,
        upvotes: 0,
      },
    };
    userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
  }

  if (message.type === SupportedMessage.UpvoteMessage) {
    const payload = message.payload;
    const chat = store.upVote(payload.userId, payload.roomId, payload.chatId);
    console.log("inside upvote");
    if (!chat) {
      return;
    }
    console.log("inside upvote 2");

    const outgoingPayload: OutgoingMessage = {
      type: OutgoingSupportedMessages.UpdateChat,
      payload: {
        chatId: payload.chatId,
        roomID: payload.roomId,
        upvotes: chat.upvotes.length,
      },
    };

    console.log("inside upvote 3");
    userManager.broadcast(payload.roomId, payload.userId, outgoingPayload);
  }
}
