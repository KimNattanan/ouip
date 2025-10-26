import { useGameContext } from "../game";
import { Point } from "../types";
import { Entity } from "./entity";
import { Animator, AnimFrame, useAnimator } from "./animator";
import { useEffect } from "react";

export type Player = Entity<{
  status: string;
  grounded: boolean;
  upd: (dt: number) => void;
  draw: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
  reset: ()=>void;
}>;

const idleAnimFrames: AnimFrame[] = [
  {
    url: '/cactus/cactus.png',
    sec: 999,
  },
];
const runAnimFrames: AnimFrame[] = [
  {
    url: '/dino/run1.png',
    sec: 0.2,
  },{
    url: '/dino/run2.png',
    sec: 0.2,
  },
];
const deadAnimFrames: AnimFrame[] = [
  {
    url: '/dino/dead.png',
    sec: 999,
  },
];

const screenWidth = 600;

export const usePlayer = (pos0: Point, size0: Point, gravity: number) => {
  const { game } = useGameContext();

  const anims = new Map<string,Animator>();
  anims.set('idle', useAnimator(idleAnimFrames));
  anims.set('jumping', useAnimator(idleAnimFrames));
  anims.set('running', useAnimator(idleAnimFrames));
  anims.set('ducking', useAnimator(idleAnimFrames));
  anims.set('dead', useAnimator(idleAnimFrames));

  const plr0 = {
    pos: pos0,
    size: size0,
    pivot: {
      x: size0.x * 0.5,
      y: size0.y,
    },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: gravity },
    status: "idle",
    grounded: true,
    anims: anims,
  } as Player;
  const reset = (plr: Player) => {
    plr.pos = { ...plr0.pos };
    plr.size = { ...plr0.size };
    plr.pivot = { ...plr0.pivot };
    plr.velocity = { ...plr0.velocity };
    plr.acceleration = { ...plr0.acceleration };
    plr.status = plr0.status;
    plr.grounded = plr0.grounded;
    plr.status = plr0.status;
    plr.anims = plr0.anims;
  }
  const plr = {
    reset: () => reset(plr),
    upd: (dt: number) => {
      if(game.status == 'over' || game.status == 'restart'){
        plr.status = 'dead';
      }
      else{
        if(game.status=='playing' && game.keyPressed.get('ArrowDown')){
          plr.status = 'ducking';
          plr.velocity.y = 700;
          plr.size.y = plr.pivot.y = plr0.size.y/2;
        }
        else if(plr.grounded && (game.keyPressed.get('ArrowUp') || game.keyPressed.get(' ') || game.touchStart)){
          plr.status = 'jumping';
          plr.grounded = false;
          plr.velocity.y = -700;
          plr.size.y = plr.pivot.y = plr0.size.y;
        }
        else{
          if(plr.grounded) plr.status = 'running';
          else plr.status = 'jumping';
          plr.size.y = plr.pivot.y = plr0.size.y;
        }
        if(game.status=='playing' && game.showingWidth < screenWidth){
          game.setShowingWidth(game.showingWidth + screenWidth*2*dt);
        }
        plr.pos = {
          x: plr.pos.x + plr.velocity.x * dt,
          y: plr.pos.y + plr.velocity.y * dt,
        };
        plr.velocity = {
          x: plr.velocity.x + plr.acceleration.x * dt,
          y: plr.velocity.y + plr.acceleration.y * dt,
        };
        if(plr.pos.y >= pos0.y){
          if(!plr.grounded && game.status=='start'){
            game.setStatus('playing');
          }
          plr.grounded = true;
          plr.pos.y = pos0.y;
          plr.velocity.y = 0;
        }
      }
      plr.anims.get(plr.status)?.upd(dt);
    },
    draw: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const img = plr.anims.get(plr.status)?.getImg();
      if(img){
        ctx.drawImage(
          img,
          0,0,
          50,93,
          plr.pos.x - plr.pivot.x,
          plr.pos.y - plr.pivot.y,
          plr.size.x,
          plr.size.y,
        )
      }
    },
  } as Player;
  useEffect(()=>{
    reset(plr);
  },[]);
  return plr;
};