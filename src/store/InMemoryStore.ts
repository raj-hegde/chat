import { Store, Chat, UserID } from "./store";
let globalChatID = 0;

export interface Room {
  roomID: string;
  chats: Chat[];
}

export class InMemoryStore implements Store {
  private store: Map<string, Room>;

  constructor() {
    this.store = new Map<string, Room>();
  }

  initRoom(roomID: string) {
    this.store.set(roomID, {
      roomID,
      chats: [],
    });
  }
  getChat(roomID: string, limit: number, offset: number) {
    const room = this.store.get(roomID);
    if (!room) {
      return [];
    }
    return room.chats
      .reverse()
      .slice(0, offset)
      .slice(-1 * limit);
  }

  addChat(
    userID: UserID,
    name: string,
    roomID: string,
    message: string,
    upvotes: UserID
  ) {
    const room = this.store.get(roomID);
    if (!room) {
      return;
    }
    room.chats.push({
      id: (globalChatID++).toString(),
      userID,
      name,
      message,
      upvotes: [],
    });
  }

  upVote(userID: UserID, roomID: string, chatID: string) {
    const room = this.store.get(roomID);
    if (!room) {
      return;
    }
    const chat = room.chats.find(({ id }) => id === chatID); // Did not understand how chat: Chat, and room: Room
    if (chat) {
      chat.upvotes.push(userID);
    }
  }
}
