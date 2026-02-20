import React from 'react';
import styled from 'styled-components';
import { motion, HTMLMotionProps } from 'framer-motion';

export const RollingBall = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>((props, ref) => {
  return (
    <StyledWrapper {...props} ref={ref}>
      <motion.div
        className="ball-bounce"
        initial={{ y: 0 }}
        whileInView={{ y: [0, 0, 0, 0, 0, 0, -150, 0] }}
        viewport={{ margin: "-50px" }}
        transition={{
          duration: 6,
          times: [0, 0.15, 0.35, 0.5, 0.7, 0.85, 0.925, 1],
          ease: ["linear", "linear", "linear", "linear", "linear", "easeOut", "easeIn"],
          repeat: Infinity,
        }}
      >
        <motion.div
          className="ball-visuals"
          initial={{ rotate: 0 }}
          whileInView={{ rotate: [0, 0, 720, 720, 1440, 1440, 720, 0] }}
          viewport={{ margin: "-50px" }}
          transition={{
            duration: 6,
            times: [0, 0.15, 0.35, 0.5, 0.7, 0.85, 0.925, 1],
            ease: ["linear", "easeInOut", "linear", "easeInOut", "linear", "linear", "linear"],
            repeat: Infinity,
          }}
        >
          <div className="bg-texture">
            <div className="w-full h-[2px] bg-black/50 absolute top-1/2 left-0 -translate-y-1/2 rotate-45" />
            <div className="w-[2px] h-full bg-black/50 absolute top-0 left-1/2 -translate-x-1/2 rotate-45" />
            <div className="w-full h-[2px] bg-black/30 absolute top-1/2 left-0 -translate-y-1/2 -rotate-45" />
            <div className="w-[2px] h-full bg-black/30 absolute top-0 left-1/2 -translate-x-1/2 -rotate-45" />
          </div>

          <div className="loader-number">
            <div className="number-circle">
              <motion.span
                initial={{ opacity: 1 }}
                whileInView={{ opacity: [1, 1, 0, 0, 0, 0, 1, 1] }}
                viewport={{ margin: "-50px" }}
                transition={{ duration: 6, times: [0, 0.24, 0.26, 0.59, 0.61, 0.92, 0.94, 1], ease: "linear", repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center font-black"
              >01</motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: [0, 0, 1, 1, 0, 0, 0, 0] }}
                viewport={{ margin: "-50px" }}
                transition={{ duration: 6, times: [0, 0.24, 0.26, 0.59, 0.61, 0.92, 0.94, 1], ease: "linear", repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center font-black"
              >02</motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: [0, 0, 0, 0, 1, 1, 0, 0] }}
                viewport={{ margin: "-50px" }}
                transition={{ duration: 6, times: [0, 0.24, 0.26, 0.59, 0.61, 0.92, 0.94, 1], ease: "linear", repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center font-black"
              >03</motion.span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Ground Shadow - Shrinks when ball jumps! */}
      <motion.div
        className="ball-shadow"
        initial={{ scale: 1, opacity: 1 }}
        whileInView={{ scale: [1, 1, 1, 1, 1, 1, 0.5, 1], opacity: [1, 1, 1, 1, 1, 1, 0.2, 1] }}
        viewport={{ margin: "-50px" }}
        transition={{
          duration: 6,
          times: [0, 0.15, 0.35, 0.5, 0.7, 0.85, 0.925, 1],
          ease: ["linear", "linear", "linear", "linear", "linear", "easeOut", "easeIn"],
          repeat: Infinity,
        }}
      />
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

  .ball-bounce {
    position: absolute;
    inset: 0;
    z-index: 4;
  }

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
    z-index: 4;
  }

  .number-circle {
    position: relative;
    background: white;
    color: #000;
    font-size: 28px;
    font-family: ui-sans-serif, system-ui, sans-serif;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    box-shadow: inset 0 0 5px rgba(0,0,0,0.5), 0 0 15px rgba(255,255,255,0.1);
  }
`;
