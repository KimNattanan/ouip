import { Point } from "../types";
import { Entity } from "./entity";
import { Animator, AnimFrame, useAnimator } from "./animator";
import { randomRangeFloat } from "@/utils/random";
import { useEffect } from "react";

export type Enemy = Entity<{
  status: string;
  debounce: number;
  upd: (dt: number) => void;
  draw: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
  reset: () => void;
}>;

const runAnimFrames: AnimFrame[] = [
  {
    url: '/dino-reverse/run1.png',
    sec: 0.1,
  },{
    url: '/dino-reverse/run2.png',
    sec: 0.1,
  },
];

export const useEnemy = (pos0: Point, size0: Point, speed: number, reloadTime: number, startTime: number) => {
  const anims = new Map<string,Animator>();
  anims.set('running', useAnimator(runAnimFrames));

  const enemy0 = {
    pos: pos0,
    size: size0,
    pivot: {
      x: size0.x * 0.5,
      y: size0.y,
    },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    status: "running",
    anims: anims,
    debounce: startTime,
  } as Enemy;
  const reset = (enemy: Enemy) => {
    enemy.pos = { ...enemy0.pos };
    enemy.size = { ...enemy0.size };
    enemy.pivot = { ...enemy0.pivot };
    enemy.velocity = { ...enemy0.velocity };
    enemy.acceleration = { ...enemy0.acceleration };
    enemy.status = enemy0.status;
    enemy.debounce = enemy0.debounce;
    enemy.anims = enemy0.anims;
  }
  const enemy = {
    reset: () => reset(enemy),
    upd: (dt: number) => {
      enemy.pos = {
        x: enemy.pos.x + enemy.velocity.x * dt,
        y: enemy.pos.y + enemy.velocity.y * dt,
      };
      enemy.velocity = {
        x: enemy.velocity.x + enemy.acceleration.x * dt,
        y: enemy.velocity.y + enemy.acceleration.y * dt,
      };
      if(enemy.pos.x - enemy.pivot.x + enemy.size.x < 0){
        enemy.pos.x = pos0.x;
        enemy.debounce = reloadTime * randomRangeFloat(0.5,1.2);
      }
      if(enemy.debounce <= 0){
        enemy.velocity.x = -speed;
      }
      else{
        enemy.velocity.x = 0;
        enemy.debounce -= dt;
      }
      enemy.anims.get(enemy.status)?.upd(dt);
    },
    draw: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const img = enemy.anims.get(enemy.status)?.getImg();
      if(img){
        ctx.drawImage(
          img,
          enemy.pos.x - enemy.pivot.x,
          enemy.pos.y - enemy.pivot.y,
          enemy.size.x,
          enemy.size.y,
        )
      }
    },
  } as Enemy;
  useEffect(()=>{
    reset(enemy);
  },[]);
  return enemy;
};