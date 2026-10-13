import React from "react";
import {Composition} from "remotion";
import {WordTips} from "./WordTips";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="WordTips"
      component={WordTips}
      durationInFrames={300} // 10 detik @ 30fps
      fps={30}
      width={1080}
      height={1920} // portrait 9:16
    />
  );
};
