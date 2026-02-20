import React from 'react';
import styled from 'styled-components';
import { motion, HTMLMotionProps } from 'framer-motion';

export const RollingBall = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>((props, ref) => {
  return (
    <StyledWrapper {...props} ref={ref}>
      <motion.div
        className="ball-visuals"
        initial={{ rotate: 0 }}
        whileInView={{ rotate: [0, 0, 720, 720, 1440, 1440, 720, 0] }}
        viewport={{ margin: "-50px" }}
        transition={{
          duration: 6,
          times: [0, 0.15, 0.35, 0.5, 0.7, 0.85, 0.925, 1],
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <div className="bg-texture">
          {/* Dynamic grid to emphasize rotation speed */}
          <div className="w-full h-[2px] bg-black/50 absolute top-1/2 left-0 -translate-y-1/2 rotate-45" />
          <div className="w-[2px] h-full bg-black/50 absolute top-0 left-1/2 -translate-x-1/2 rotate-45" />
          <div className="w-full h-[2px] bg-black/30 absolute top-1/2 left-0 -translate-y-1/2 -rotate-45" />
          <div className="w-[2px] h-full bg-black/30 absolute top-0 left-1/2 -translate-x-1/2 -rotate-45" />
        </div>
        <div className="loader-number" />
      </motion.div>
      <div className="ball-shadow" />
    </StyledWrapper>
  );
});

const StyledWrapper = styled(motion.div)`
  position: absolute;
  top: 50%;
  margin-top: -48px;
  margin-left: -48px;
  z-index: 30;
  width: 96px;
  height: 96px;

  /* Stationary layer for consistent lighting and ground shadow */
  .ball-shadow {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.9), inset 0 -15px 25px rgba(0,0,0,0.9), inset 0 6px 10px rgba(255,255,255,0.2);
    background: radial-gradient(circle at 35% 25%, rgba(255,255,255,0.15) 0%, transparent 50%);
    z-index: 3;
    pointer-events: none;
  }

  /* Visually rotating layer */
  .ball-visuals {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: #111;
    z-index: 2;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .bg-texture {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .loader-number {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loader-number::before {
    content: "01";
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    color: #000;
    font-weight: 900;
    font-size: 28px;
    font-family: ui-sans-serif, system-ui, sans-serif;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    box-shadow: inset 0 0 5px rgba(0,0,0,0.5), 0 0 15px rgba(255,255,255,0.1);
    animation: numberChange 6s infinite ease-in-out;
  }

  /* Sync numbers swapping exactly across the 6-second motion cycle */
  @keyframes numberChange {
    0%, 20% { content: "01"; }
    28%, 62% { content: "02"; }
    68%, 85% { content: "03"; }
    92%, 100% { content: "01"; }
  }
`;
