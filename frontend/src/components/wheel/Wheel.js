import React from "react";
import WheelComponent from "./WheelComponent";

function Wheel({ segments, segColors, onFinished }) {
  return (
    <div id="wheelCircle">
      <WheelComponent
        segments={segments}
        segColors={segColors}
        winningSegment=""
        onFinished={onFinished}
        primaryColor="#0d1b2a"
        primaryColoraround="#1b3b4f"
        contrastColor="#ffffff"
        buttonText="Spin"
        isOnlyOnce={false}
        size={190}
        upDuration={100}
        downDuration={500}
      />
    </div>
  );
}

export default Wheel;
