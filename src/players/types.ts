export type PlayerAvatar =
  | { type: "default" }
  | { type: "photo"; fileName: string };

export type Player = {
  id: string;
  name: string;
  avatar: PlayerAvatar;
  createdAt: string;
};

export type CreatePlayerInput = {
  name: string;
  avatar?: PlayerAvatar;
};
