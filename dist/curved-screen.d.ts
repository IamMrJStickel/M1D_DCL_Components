import { Entity, TextureUnion } from "@dcl/sdk/ecs";
import { Vector3, Quaternion } from "@dcl/sdk/math";
export interface CurvedScreenOptions {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    videoTexture: TextureUnion;
}
export declare function setUVsCurved(segmentIndex: number): number[];
export declare function createCurvedScreen(options: CurvedScreenOptions): Entity;
