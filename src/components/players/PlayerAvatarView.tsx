import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import { AvatarIcon } from "@assets/icons";
import type { PlayerAvatar } from "@/players/types";
import { getPlayerPhotoUri } from "@/storage/playerPhotoStorage";

type PlayerAvatarViewProps = {
  avatar: PlayerAvatar;
  size: number;
};

export function PlayerAvatarView({ avatar, size }: PlayerAvatarViewProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [avatar]);

  if (avatar.type === "default" || photoFailed) {
    return <AvatarIcon width={size} height={size} />;
  }

  return (
    <View
      style={[
        styles.photoFrame,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Image
        source={{ uri: getPlayerPhotoUri(avatar.fileName) }}
        resizeMode="cover"
        onError={() => setPhotoFailed(true)}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  photoFrame: {
    overflow: "hidden",
  },
});
