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

  addChat(userID: UserID, name: string, roomID: string, message: string) {
    const room = this.store.get(roomID);
    if (!room) {
      return;
    }
    const chat = {
      id: (globalChatID++).toString(),
      userID,
      name,
      message,
      upvotes: [],
    };
    room.chats.push(chat);
    return chat;
  }

  upVote(userID: UserID, roomID: string, chatID: string) {
    const room = this.store.get(roomID);
    if (!room) {
      return;
    }
    const chat = room.chats.find(({ id }) => id === chatID); // Did not understand how chat: Chat, and room: Room
    if (chat) {
      if (chat.upvotes.find((x) => x === userID)) {
        return chat;
      }
      chat.upvotes.push(userID);
    }
    return chat;
  }
}
