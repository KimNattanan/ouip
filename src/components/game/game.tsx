"use client";

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { usePlayer } from './entity/player';
import { useEnemy } from './entity/enemy';
import { checkCollision, checkPointInRect } from '@/utils/game';
import { useAnimator } from './entity/animator';
import { Point } from './types';

type GameType = {
  keyPressed: Map<string,boolean>;
  mouse0Down: Point|null;
  setMouse0Down: (p: Point|null) => void;
  status: string;
  setStatus: (s: string) => void;
  showingWidth: number;
  setShowingWidth: (w: number) => void;
  score: number;
  setScore: (x: number) => void;
  hiScore: number;
  setHiScore: (x: number) => void;
};
type GameContextValue = {
  game: GameType;
};
const GameContext = createContext<GameContextValue>({} as GameContextValue);
export const useGameContext = () => {
  const gameContext = useContext(GameContext);
  if(!gameContext){
    throw new Error('useGameContext should be used within GameContextProvider');
  }
  return gameContext;
};
export function GameContextProvider({children}:{children: ReactNode}) {
  const keyPressed = new Map<string,boolean>();
  const game: GameType = {
    keyPressed,
    mouse0Down: null,
    setMouse0Down: (p: Point|null)=>{ game.mouse0Down = p; },
    status: 'start',
    setStatus: (s: string)=>{ game.status = s; },
    showingWidth: 0,
    setShowingWidth: (w: number)=>{ game.showingWidth = w; },
    score: 0,
    setScore: (x: number)=>{
      game.score = x;
      if(x > game.hiScore){
        game.setHiScore(x);
      }
    },
    hiScore: 0,
    setHiScore: (x: number)=>{
      game.hiScore = x;
      localStorage.setItem('hi-score', x.toFixed(0));
    }
  };
  return (
    <GameContext.Provider value={{ game }}>
      {children}
    </GameContext.Provider>
  )
}

const screenWidth = 600;
const screenHeight = 300;
const floorY = screenHeight * 0.9;

export function GameCanvas() {
  const { game } = useGameContext();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const gameOverText = useAnimator([{ url: '/ui/game-over.png', sec: 999 }]);  
  const restartBtn = {
    x: (screenWidth - 44) * 0.5,
    y: (screenHeight*0.7 - 35*0.5),
    w: 44,
    h: 35,
    anim: useAnimator([{ url: '/ui/restart-btn.png', sec: 999 }]),
  };
  const plr = usePlayer(
    { x: 50/1.5/2, y: floorY },
    { x: 50/1.5, y: 93/1.5 },
    3000,
  );
  const enemy1 = useEnemy(
    { x: screenWidth + 794/18/2, y: floorY },
    { x: 794/18, y: 848/18 },
    screenWidth,
    3,3,
  );
  const enemy2 = useEnemy(
    { x: screenWidth + 794/18/2, y: floorY },
    { x: 794/18, y: 848/18 },
    screenWidth,
    3,5,
  );
  const enemy3 = useEnemy(
    { x: screenWidth + 794/30/2, y: floorY },
    { x: 794/30, y: 848/30 },
    screenWidth,
    3,10,
  );

  const updateGame = (canvas: HTMLCanvasElement, dt: number) => {
    plr.upd(dt)
    if(game.status == 'playing'){
      game.setScore(game.score + dt*10);
      enemy1.upd(dt);
      enemy2.upd(dt);
      enemy3.upd(dt);
      if(
        checkCollision(plr, enemy1) ||
        checkCollision(plr, enemy2) ||
        checkCollision(plr, enemy3)
      ){
        game.setStatus('over');
        setTimeout(()=>{
          game.setStatus('restart');
        },1000);
      }
    }
    else if(game.status == 'restart'){
      if(
        game.keyPressed.get(' ') || game.keyPressed.get('ArrowUp') ||
        game.mouse0Down && checkPointInRect(restartBtn.x, restartBtn.x+restartBtn.w, restartBtn.y, restartBtn.y+restartBtn.h, game.mouse0Down.x-canvas.getBoundingClientRect().x, game.mouse0Down.y-canvas.getBoundingClientRect().y)
      ){
        game.setStatus('playing');
        enemy1.reset();
        enemy2.reset();
        enemy3.reset();
        plr.reset();
        game.setScore(0);
      }
    }
  };
  const drawGame = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    plr.draw(canvas, ctx);
    enemy1.draw(canvas, ctx);
    enemy2.draw(canvas, ctx);
    enemy3.draw(canvas, ctx);

    // score
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.font = "20px Monospace";
    ctx.fillStyle = '#acacac';
    ctx.fillText(`HI ${game.hiScore.toFixed(0)} ${game.score.toFixed(0)}`, screenWidth - 20, 100);

    // floor line
    ctx.beginPath();
    ctx.strokeStyle = '#acacac';
    ctx.lineWidth = 1;
    ctx.moveTo(0, floorY);
    ctx.lineTo(canvas.width, floorY);
    ctx.stroke();

    // game over ui
    if(game.status == 'over' || game.status == 'restart'){
      const gameOverTextImg = gameOverText.getImg();
      if(gameOverTextImg){
        ctx.drawImage(
          gameOverTextImg,
          (screenWidth - 118*2) * 0.5,
          (screenHeight - 10*2) * 0.5,
          118*2,
          10*2
        );
      }
      if(game.status == 'restart'){
        const restartBtnImg = restartBtn.anim.getImg();
        if(restartBtnImg){
          ctx.drawImage(
            restartBtnImg,
            restartBtn.x,
            restartBtn.y,
            restartBtn.w,
            restartBtn.h,
          );
        }
      }
    }

    ctx.clearRect(Math.min(game.showingWidth, canvas.width), 0, canvas.width, canvas.height);
  };

  useEffect(()=>{
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        game.keyPressed.set(event.key, true);
      }
    }
    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        game.keyPressed.set(event.key, false);
      }
    }
    function handleMouseDown(event: MouseEvent) {
      if(event.button == 0){
        game.setMouse0Down({
          x: event.clientX,
          y: event.clientY,
        });
      }
    }
    function handleMouseUp(event: MouseEvent) {
      if(event.button == 0){
        game.setMouse0Down(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    game.setShowingWidth(plr.size.x+20);
    game.setHiScore(+(localStorage.getItem('hi-score')||'0'));

    let time0 = -1;
    
    const gameLoop = (time1: number) => {
      if(time0 == -1) time0 = time1;
      const dt = (time1 - time0) * 0.001;
      time0 = time1;

      updateGame(canvas, dt);
      drawGame(canvas, ctx);

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      width={screenWidth}
      height={screenHeight}
    />
  );
}