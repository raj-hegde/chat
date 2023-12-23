import { connection } from "websocket";
import { OutgoingMessage } from "./messages/outgoingMessages";

interface User {
  name: string;
  id: string;
  conn: connection;
}

interface Room {
  users: User[];
}
export class UserManager {
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map<string, Room>();
  }

  addUser(name: string, userID: string, roomID: string, socket: connection) {
    if (!this.rooms.get(roomID)) {
      this.rooms.set(roomID, {
        users: [],
      });
    }
    this.rooms.get(roomID)?.users.push({
      id: userID,
      name,
      conn: socket,
    });
    socket.on("close", (reasonCode, description) => {
      this.removeUser(roomID, userID);
    });
  }

  removeUser(roomID: string, userID: string) {
    const users = this.rooms.get(roomID)?.users;
    if (users) {
      users.filter(({ id }) => id != userID);
    }
  }
  getUser(roomID: string, userId: string): User | null {
    const user = this.rooms.get(roomID)?.users.find(({ id }) => id === userId);
    return user ?? null;
  }
  broadcast(roomId: string, userId: string, message: OutgoingMessage) {
    const user = this.getUser(roomId, userId);
    if (!user) {
      console.error("User not found");
      return;
    }
    const room = this.rooms.get(roomId);
    if (!room) {
      console.error("Room not found");
      return;
    }

    room.users.forEach(({ conn, id }) => {
      if (id === userId) {
        return;
      }
      console.log("outgoing message " + JSON.stringify(message));
      conn.sendUTF(JSON.stringify(message));
    });
  }
}
