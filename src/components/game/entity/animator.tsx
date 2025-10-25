import { loadImageBitmap } from "@/utils/game";
import { useEffect, useRef } from "react";

export type AnimFrame = {
  url: string,
  sec: number,
};
export type Animator = {
  t: number;
  frame: number,
  upd: (dt: number) => void;
  getImg: () => ImageBitmap|null;
  reset: () => void;
};

export const useAnimator = (frames: AnimFrame[]) => {
  const imgsRef = useRef<Array<ImageBitmap | null>>(new Array(frames.length).fill(null));

  useEffect(() => {
    frames.forEach((frame, i) => {
      loadImageBitmap(frame.url, (img: ImageBitmap) => {
        imgsRef.current[i] = img;
      });
    });
  }, [frames]);
  
  const animator = {
    t: 0,
    frame: 0,
    upd: (dt: number) => {
      animator.t += dt;
      if (animator.t >= frames[animator.frame].sec) {
        animator.t = 0;
        animator.frame = (animator.frame + 1) % frames.length;
      }
    },
    getImg: () => imgsRef.current[animator.frame] || null,
    reset: () => {
      animator.t = 0;
      animator.frame = 0;
    }
  } as Animator;

  return animator;
};