import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import type { PlayerAvatar } from "@/players/types";

const PLAYER_PHOTOS_DIRECTORY_NAME = "player-photos";
const PLAYER_PHOTO_SIZE = 1024;
const PLAYER_PHOTO_QUALITY = 0.85;
const PLAYER_PHOTO_PREVIEW_SIZE = 256;

export type PlayerPhotoSource = {
  uri: string;
  width: number;
  height: number;
  previewUri?: string;
  crop?: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  };
};

function applyPlayerPhotoCrop(
  context: ReturnType<typeof ImageManipulator.manipulate>,
  source: PlayerPhotoSource,
) {
  if (source.crop) {
    context.crop(source.crop);
    return;
  }

  if (source.width > 0 && source.height > 0) {
    const squareSize = Math.min(source.width, source.height);

    context.crop({
      originX: Math.max(0, (source.width - squareSize) / 2),
      originY: Math.max(0, (source.height - squareSize) / 2),
      width: squareSize,
      height: squareSize,
    });
  }
}

export async function createPlayerPhotoPreview(source: PlayerPhotoSource) {
  const context = ImageManipulator.manipulate(source.uri);

  applyPlayerPhotoCrop(context, source);
  context.resize({
    width: PLAYER_PHOTO_PREVIEW_SIZE,
    height: PLAYER_PHOTO_PREVIEW_SIZE,
  });

  const renderedImage = await context.renderAsync();
  const preview = await renderedImage.saveAsync({
    compress: PLAYER_PHOTO_QUALITY,
    format: SaveFormat.JPEG,
  });

  return preview.uri;
}

function getPlayerPhotosDirectory() {
  return new Directory(Paths.document, PLAYER_PHOTOS_DIRECTORY_NAME);
}

function ensurePlayerPhotosDirectory() {
  const directory = getPlayerPhotosDirectory();

  directory.create({ intermediates: true, idempotent: true });

  return directory;
}

function createPlayerPhotoFileName() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);

  return `avatar_${timestamp}_${randomPart}.jpg`;
}

export function getPlayerPhotoUri(fileName: string) {
  return new File(getPlayerPhotosDirectory(), fileName).uri;
}

export async function createStoredPlayerPhoto(
  source: PlayerPhotoSource,
): Promise<PlayerAvatar> {
  const context = ImageManipulator.manipulate(source.uri);

  applyPlayerPhotoCrop(context, source);

  context.resize({
    width: PLAYER_PHOTO_SIZE,
    height: PLAYER_PHOTO_SIZE,
  });

  const renderedImage = await context.renderAsync();
  const cachedImage = await renderedImage.saveAsync({
    compress: PLAYER_PHOTO_QUALITY,
    format: SaveFormat.JPEG,
  });
  const fileName = createPlayerPhotoFileName();
  const storedImage = new File(ensurePlayerPhotosDirectory(), fileName);
  const cachedFile = new File(cachedImage.uri);

  cachedFile.copy(storedImage);

  if (cachedFile.exists) {
    cachedFile.delete();
  }

  return { type: "photo", fileName };
}

export function deleteStoredPlayerPhoto(fileName: string) {
  const file = new File(getPlayerPhotosDirectory(), fileName);

  if (file.exists) {
    file.delete();
  }
}

export function clearStoredPlayerPhotos() {
  const directory = getPlayerPhotosDirectory();

  if (directory.exists) {
    directory.delete();
  }
}
