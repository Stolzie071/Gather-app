type ManAvatarNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
type GirlAvatarNumber = ManAvatarNumber | 16;

export type PlayerAvatarPresetId =
  | `man-${ManAvatarNumber}`
  | `girl-${GirlAvatarNumber}`;

export type PlayerAvatar =
  | { type: "default" }
  | { type: "preset"; id: PlayerAvatarPresetId }
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
