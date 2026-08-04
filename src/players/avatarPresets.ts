import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

import {
  GirlAvatar1,
  GirlAvatar2,
  GirlAvatar3,
  GirlAvatar4,
  GirlAvatar5,
  GirlAvatar6,
  GirlAvatar7,
  GirlAvatar8,
  GirlAvatar9,
  GirlAvatar10,
  GirlAvatar11,
  GirlAvatar12,
  GirlAvatar13,
  GirlAvatar14,
  GirlAvatar15,
  GirlAvatar16,
  ManAvatar1,
  ManAvatar2,
  ManAvatar3,
  ManAvatar4,
  ManAvatar5,
  ManAvatar6,
  ManAvatar7,
  ManAvatar8,
  ManAvatar9,
  ManAvatar10,
  ManAvatar11,
  ManAvatar12,
  ManAvatar13,
  ManAvatar14,
  ManAvatar15,
} from "@assets/avatars";
import {
  GirlAvatarPreview1,
  GirlAvatarPreview2,
  GirlAvatarPreview3,
  GirlAvatarPreview4,
  GirlAvatarPreview5,
  GirlAvatarPreview6,
  GirlAvatarPreview7,
  GirlAvatarPreview8,
  GirlAvatarPreview9,
  GirlAvatarPreview10,
  GirlAvatarPreview11,
  GirlAvatarPreview12,
  GirlAvatarPreview13,
  GirlAvatarPreview14,
  GirlAvatarPreview15,
  GirlAvatarPreview16,
  ManAvatarPreview1,
  ManAvatarPreview2,
  ManAvatarPreview3,
  ManAvatarPreview4,
  ManAvatarPreview5,
  ManAvatarPreview6,
  ManAvatarPreview7,
  ManAvatarPreview8,
  ManAvatarPreview9,
  ManAvatarPreview10,
  ManAvatarPreview11,
  ManAvatarPreview12,
  ManAvatarPreview13,
  ManAvatarPreview14,
  ManAvatarPreview15,
} from "@assets/avatars/previews";
import type { PlayerAvatarPresetId } from "@/players/types";

export const DEFAULT_PLAYER_AVATAR_ID: PlayerAvatarPresetId = "man-1";

export const MALE_AVATAR_PRESET_IDS: readonly PlayerAvatarPresetId[] = [
  "man-1",
  "man-10",
  "man-8",
  "man-3",
  "man-14",
  "man-6",
  "man-2",
  "man-12",
  "man-5",
  "man-15",
  "man-9",
  "man-4",
  "man-11",
  "man-7",
  "man-13",
];

export const FEMALE_AVATAR_PRESET_IDS: readonly PlayerAvatarPresetId[] = [
  "girl-1",
  "girl-10",
  "girl-8",
  "girl-3",
  "girl-14",
  "girl-6",
  "girl-2",
  "girl-12",
  "girl-5",
  "girl-15",
  "girl-9",
  "girl-4",
  "girl-11",
  "girl-7",
  "girl-13",
  "girl-16",
];

export const QUICK_AVATAR_PRESET_IDS: readonly PlayerAvatarPresetId[] = [
  "man-1",
  "man-10",
  "girl-10",
  "girl-8",
];

const PRESET_COMPONENTS: Record<
  PlayerAvatarPresetId,
  ComponentType<SvgProps>
> = {
  "man-1": ManAvatar1,
  "man-2": ManAvatar2,
  "man-3": ManAvatar3,
  "man-4": ManAvatar4,
  "man-5": ManAvatar5,
  "man-6": ManAvatar6,
  "man-7": ManAvatar7,
  "man-8": ManAvatar8,
  "man-9": ManAvatar9,
  "man-10": ManAvatar10,
  "man-11": ManAvatar11,
  "man-12": ManAvatar12,
  "man-13": ManAvatar13,
  "man-14": ManAvatar14,
  "man-15": ManAvatar15,
  "girl-1": GirlAvatar1,
  "girl-2": GirlAvatar2,
  "girl-3": GirlAvatar3,
  "girl-4": GirlAvatar4,
  "girl-5": GirlAvatar5,
  "girl-6": GirlAvatar6,
  "girl-7": GirlAvatar7,
  "girl-8": GirlAvatar8,
  "girl-9": GirlAvatar9,
  "girl-10": GirlAvatar10,
  "girl-11": GirlAvatar11,
  "girl-12": GirlAvatar12,
  "girl-13": GirlAvatar13,
  "girl-14": GirlAvatar14,
  "girl-15": GirlAvatar15,
  "girl-16": GirlAvatar16,
};

const PRESET_PREVIEWS: Record<PlayerAvatarPresetId, number> = {
  "man-1": ManAvatarPreview1,
  "man-2": ManAvatarPreview2,
  "man-3": ManAvatarPreview3,
  "man-4": ManAvatarPreview4,
  "man-5": ManAvatarPreview5,
  "man-6": ManAvatarPreview6,
  "man-7": ManAvatarPreview7,
  "man-8": ManAvatarPreview8,
  "man-9": ManAvatarPreview9,
  "man-10": ManAvatarPreview10,
  "man-11": ManAvatarPreview11,
  "man-12": ManAvatarPreview12,
  "man-13": ManAvatarPreview13,
  "man-14": ManAvatarPreview14,
  "man-15": ManAvatarPreview15,
  "girl-1": GirlAvatarPreview1,
  "girl-2": GirlAvatarPreview2,
  "girl-3": GirlAvatarPreview3,
  "girl-4": GirlAvatarPreview4,
  "girl-5": GirlAvatarPreview5,
  "girl-6": GirlAvatarPreview6,
  "girl-7": GirlAvatarPreview7,
  "girl-8": GirlAvatarPreview8,
  "girl-9": GirlAvatarPreview9,
  "girl-10": GirlAvatarPreview10,
  "girl-11": GirlAvatarPreview11,
  "girl-12": GirlAvatarPreview12,
  "girl-13": GirlAvatarPreview13,
  "girl-14": GirlAvatarPreview14,
  "girl-15": GirlAvatarPreview15,
  "girl-16": GirlAvatarPreview16,
};

export const PLAYER_AVATAR_PREVIEW_SOURCES: readonly number[] = [
  ...MALE_AVATAR_PRESET_IDS,
  ...FEMALE_AVATAR_PRESET_IDS,
].map((id) => PRESET_PREVIEWS[id]);

const PLAYER_AVATAR_PRESET_IDS = new Set<PlayerAvatarPresetId>([
  ...MALE_AVATAR_PRESET_IDS,
  ...FEMALE_AVATAR_PRESET_IDS,
]);

export function isPlayerAvatarPresetId(
  value: unknown,
): value is PlayerAvatarPresetId {
  return (
    typeof value === "string" &&
    PLAYER_AVATAR_PRESET_IDS.has(value as PlayerAvatarPresetId)
  );
}

export function getPlayerAvatarPresetComponent(id: PlayerAvatarPresetId) {
  return PRESET_COMPONENTS[id];
}

export function getPlayerAvatarPresetPreview(id: PlayerAvatarPresetId) {
  return PRESET_PREVIEWS[id];
}
