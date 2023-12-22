export type UserID = string;

export interface Chat {
  id: string;
  userID: UserID;
  name: string;
  message: string;
  upvotes: UserID[];
}

export abstract class Store {
  constructor() {}
  initRoom(roomID: string) {}
  getChat(room: string, limit: number, offset: number) {}
  addChat(
    userID: UserID,
    name: string,
    room: string,
    message: string,
    upvotes: UserID
  ) {}
  upVote(userID: UserID, room: string, chatID: string) {}
}
