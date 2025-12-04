import React, { useEffect, useState, useCallback, useRef } from "react";

const WheelComponent = ({
  segments,
  segColors,
  winningSegment,
  onFinished,
  primaryColor,
  primaryColoraround,
  contrastColor,
  buttonText,
  isOnlyOnce = true,
  size = 290,
  upDuration = 1000,
  downDuration = 100,
  fontFamily = "proxima-nova",
  width = 100,
  height = 100,
}) => {
  const currentSegment = useRef("");
  const isStarted = useRef(false);
  const [isFinished, setFinished] = useState(false);
  const timerHandle = useRef(0);
  const angleCurrent = useRef(0);
  const angleDelta = useRef(0);
  const canvasContext = useRef(null);
  const maxSpeed = useRef(Math.PI / `${segments.length}`);
  const spinStart = useRef(0);
  const frames = useRef(0);
  const canvasRef = useRef(null);
  const centerX = 240;
  const centerY = 240;

  const upTime = segments.length * upDuration;
  const downTime = segments.length * downDuration;
  const timerDelay = segments.length;

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (navigator.appVersion.indexOf("MSIE") !== -1) {
      const newCanvas = document.createElement("canvas");
      newCanvas.setAttribute("width", width);
      newCanvas.setAttribute("height", height);
      newCanvas.setAttribute("id", "canvas");
      document.getElementById("wheel").appendChild(newCanvas);
      canvasContext.current = newCanvas.getContext("2d");
    } else {
      canvasContext.current = canvas.getContext("2d");
    }
  }, [width, height]);

  const wheelDraw = useCallback(() => {
    clear();
    drawWheel();
    drawNeedle();
  }, []);

  const wheelInit = useCallback(() => {
    initCanvas();
    wheelDraw();
  }, [initCanvas, wheelDraw]);

  const spin = useCallback(() => {
    isStarted.current = true;
    if (timerHandle.current === 0) {
      spinStart.current = new Date().getTime();
      maxSpeed.current = Math.PI / segments.length + Math.random() * 0.1; // Add randomness to the initial speed
      frames.current = 0;
      timerHandle.current = setInterval(onTimerTick, timerDelay);
    }
  }, [segments.length, timerDelay]);

  useEffect(() => {
    const canvas = canvasRef.current;

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      if (isMouseNearCenter(mouseX, mouseY)) {
        canvas.style.cursor = "pointer";
      } else {
        canvas.style.cursor = "default";
      }
    };

    if (canvas) {
      canvas.addEventListener("click", spin);
      canvas.addEventListener("mousemove", handleMouseMove);
    }

    wheelInit();
    setTimeout(() => {
      window.scrollTo(0, 1);
    }, 0);

    return () => {
      if (canvas) {
        canvas.removeEventListener("click", spin);
        canvas.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [spin, wheelInit, centerX, centerY]);

  const onTimerTick = () => {
    frames.current++;
    draw();
    const duration = new Date().getTime() - spinStart.current;
    let progress = 0;
    let finished = false;
    if (duration < upTime) {
      progress = duration / upTime;
      angleDelta.current =
        maxSpeed.current * Math.sin((progress * Math.PI) / 2);
    } else {
      if (winningSegment) {
        if (
          currentSegment.current === winningSegment &&
          frames.current > segments.length
        ) {
          progress = duration / upTime;
          angleDelta.current =
            maxSpeed.current * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
          progress = 1;
        } else {
          progress = duration / downTime;
          angleDelta.current =
            maxSpeed.current * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
        }
      } else {
        progress = duration / downTime;
        if (progress >= 0.8) {
          angleDelta.current =
            (maxSpeed.current / 1.2) *
            Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
        } else if (progress >= 0.98) {
          angleDelta.current =
            (maxSpeed.current / 2) *
            Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
        } else
          angleDelta.current =
            maxSpeed.current * Math.sin((progress * Math.PI) / 2 + Math.PI / 2);
      }
      if (progress >= 1) finished = true;
    }

    angleCurrent.current += angleDelta.current;
    while (angleCurrent.current >= Math.PI * 2)
      angleCurrent.current -= Math.PI * 2;
    if (finished) {
      setFinished(true);
      onFinished(currentSegment.current);
      clearInterval(timerHandle.current);
      timerHandle.current = 0;
      angleDelta.current = 0;
    }
  };

  const draw = () => {
    clear();
    drawWheel();
    drawNeedle();
  };

  const drawSegment = (key, lastAngle, angle) => {
    const ctx = canvasContext.current;
    const value = segments[key];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, size, lastAngle, angle, false);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fillStyle = segColors[key];
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((lastAngle + angle) / 2);
    ctx.fillStyle = contrastColor || "white";
    ctx.font = "bold 1em " + fontFamily;
    ctx.fillText(value.substr(0, 21), size / 2 + 20, 0);
    ctx.restore();
  };

  const drawWheel = () => {
    const ctx = canvasContext.current;
    let lastAngle = angleCurrent.current;
    const len = segments.length;
    const PI2 = Math.PI * 2;
    ctx.lineWidth = 1;
    ctx.strokeStyle = primaryColor || "black";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "1em " + fontFamily;
    for (let i = 1; i <= len; i++) {
      const angle = PI2 * (i / len) + angleCurrent.current;
      drawSegment(i - 1, lastAngle, angle);
      lastAngle = angle;
    }

    // Draw a center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, PI2, false);
    ctx.closePath();
    ctx.fillStyle = primaryColor || "black";
    ctx.lineWidth = 5;
    ctx.strokeStyle = contrastColor || "white";
    ctx.fill();
    ctx.font = "bold 2em " + fontFamily;
    ctx.fillStyle = contrastColor || "white";
    ctx.textAlign = "center";
    ctx.fillText(buttonText || "Spin", centerX, centerY + 3);
    ctx.stroke();

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, PI2, false);
    ctx.closePath();
    ctx.lineWidth = 25;
    ctx.strokeStyle = primaryColoraround || "white";
    ctx.stroke();
  };

  const drawNeedle = () => {
    const ctx = canvasContext.current;
    ctx.lineWidth = 1;
    ctx.strokeStyle = contrastColor || "white";
    ctx.fileStyle = contrastColor || "white";
    ctx.beginPath();
    ctx.moveTo(centerX + 10, centerY - 40);
    ctx.lineTo(centerX - 10, centerY - 40);
    ctx.lineTo(centerX, centerY - 60);
    ctx.closePath();
    ctx.fill();
    const change = angleCurrent.current + Math.PI / 2;
    let i =
      segments.length -
      Math.floor((change / (Math.PI * 2)) * segments.length) -
      1;
    if (i < 0) i = i + segments.length;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "transparent";
    ctx.font = "bold 1.5em " + fontFamily;
    currentSegment.current = segments[i];
    isStarted.current &&
      ctx.fillText(currentSegment.current, centerX + 10, centerY + size + 50);
  };

  const clear = () => {
    const ctx = canvasContext.current;
    ctx.clearRect(0, 0, 1000, 800);
  };

  const isMouseNearCenter = (x, y) => {
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 40; // Adjust the radius as needed
  };

  return (
    <div
      id="wheel"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <canvas
        id="canvas"
        ref={canvasRef}
        width="480"
        height="480"
        style={{
          pointerEvents: isFinished && isOnlyOnce ? "none" : "auto",
        }}
      />
    </div>
  );
};

export default WheelComponent;
