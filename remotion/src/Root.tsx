import type { FC } from "react";
import { Composition } from "remotion";
import { HeroBackground } from "./HeroBackground";

export const RemotionRoot: FC = () => {
  return (
    <Composition
      id="HeroBackground"
      component={HeroBackground}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
