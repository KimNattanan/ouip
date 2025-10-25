import { BaseEntity } from "@/components/game/entity/entity";
import { Point } from "@/components/game/types";

export const loadImageBitmap = async (url: string, setImgBitmap: (img: ImageBitmap)=>void) => {
  const img = new Image();
  img.src = url;
  img.onload = async () => {
    try {
      const imgBitmap = await createImageBitmap(img);
      setImgBitmap(imgBitmap);
    } catch (error) {
      console.error('Error creating ImageBitmap:', error);
    }
  };
  img.onerror = (error) => {
    console.error('Error loading image:', error);
  };
};

export const checkPointInRect = (l: number, r: number, t: number, b: number, x: number, y: number)=>{
  return l <= x && x <= r && t <= y && y <= b;
};
export const checkCollision = (u: BaseEntity, v: BaseEntity) => {
  const ul = u.pos.x - u.pivot.x;
  const ur = ul + u.size.x;
  const ut = u.pos.y - u.pivot.y ;
  const ub = ut + u.size.y;
  const vl = v.pos.x - v.pivot.x;
  const vr = vl + v.size.x;
  const vt = v.pos.y - v.pivot.y;
  const vb = vt + v.size.y;
  return checkPointInRect(ul,ur,ut,ub,vl,vt) ||
         checkPointInRect(ul,ur,ut,ub,vl,vb) ||
         checkPointInRect(ul,ur,ut,ub,vr,vt) ||
         checkPointInRect(ul,ur,ut,ub,vr,vb) ||
         checkPointInRect(vl,vr,vt,vb,ul,ut) ||
         checkPointInRect(vl,vr,vt,vb,ul,ub) ||
         checkPointInRect(vl,vr,vt,vb,ur,ut) ||
         checkPointInRect(vl,vr,vt,vb,ur,ub);
};