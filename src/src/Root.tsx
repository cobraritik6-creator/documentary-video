import React from "react";
import {Composition} from "remotion";
import {DURATION, Video} from "./Video";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Documentary"
      component={Video}
      durationInFrames={DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
