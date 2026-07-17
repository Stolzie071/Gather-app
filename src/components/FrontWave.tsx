import Svg, {
  Defs,
  Filter,
  FeFlood,
  FeColorMatrix,
  FeOffset,
  FeGaussianBlur,
  FeComposite,
  FeBlend,
  G,
  Path,
} from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

type FrontWaveProps = {
  style?: StyleProp<ViewStyle>;
};

export function FrontWave({ style }: FrontWaveProps) {
  return (
    <Svg style={style} width={470} height={628} viewBox="0 0 402 628">
      <Defs>
        <Filter
          id="waveShadow"
          x="-54.5"
          y="0"
          width="498.5"
          height="774.696"
          filterUnits="userSpaceOnUse"
        >
          <FeFlood floodOpacity={0} result="BackgroundImageFix" />

          <FeColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />

          <FeOffset dy={-2} />
          <FeGaussianBlur stdDeviation={40} />

          <FeComposite in2="hardAlpha" operator="out" />

          <FeColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
          />

          <FeBlend mode="normal" in2="BackgroundImageFix" result="dropShadow" />

          <FeBlend
            mode="normal"
            in="SourceGraphic"
            in2="dropShadow"
            result="shape"
          />
        </Filter>
      </Defs>

      <G filter="url(#waveShadow)">
        <Path
          d="M110.5 42.5329C62 -7.94664 -20.5 34.6628 -39.5 37.467V762.696L429 747.196V81.7942C405.5 81.7942 390.175 59.4168 356 57.022C312.829 53.9967 294.589 83.3738 251.5 79.4572C237.089 78.1473 210.707 65.0507 192.5 60.7615C175.992 56.8724 162 63.0982 149 62.1634C136 61.2286 123.13 55.6781 110.5 42.5329Z"
          fill="#F8F4FD"
        />
      </G>
    </Svg>
  );
}
