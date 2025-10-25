import { Point } from "../types"
import { Animator } from "./animator";

export type BaseEntity = {
  pos: Point;
  size: Point;
  pivot: Point;
  velocity: Point;
  acceleration: Point;
  anims: Map<string,Animator>;
};

export type Entity<T> = T & BaseEntity;