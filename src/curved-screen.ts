// src/curved-screen.ts
import { engine, Entity, Transform, MeshRenderer, MeshCollider, Material, TextureUnion } from "@dcl/sdk/ecs";
import { Vector3, Quaternion, Color3 } from "@dcl/sdk/math";

/**
 * Options for creating a curved screen.
 */
export interface CurvedScreenOptions {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    videoTexture: TextureUnion;
}

/**
 * Sets the UV mapping for a curved screen segment.
 * @param segmentIndex - The index of the screen segment.
 * @returns An array of UV coordinates.
 */
export function setUVsCurved(segmentIndex: number): number[] {
    const totalScreens = 23;
    const uOffset = segmentIndex / totalScreens;

    return [
        // This can be further optimized based on the specific geometry of your screen segments.
        // For now, we'll keep the original values.
        // Right of Front Box
        uOffset + (1.05 / totalScreens), 1,
        uOffset, 1,
        uOffset, 0,
        uOffset + (1.05 / totalScreens), 0,
        
        // Fill the rest with zeros for unused faces
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
}

/**
 * Creates a curved screen composed of multiple segments.
 * @param options - The configuration for the curved screen.
 * @returns The parent entity of the curved screen.
 */
export function createCurvedScreen(options: CurvedScreenOptions): Entity {
    const screenParent = engine.addEntity();
    Transform.create(screenParent, {
        position: options.position,
        rotation: options.rotation,
        scale: options.scale
    });

    const screenSegmentCount = 22;
    const screenSegmentScale = Vector3.create(1.145, 13.5, 0);
    const curveCenter = Vector3.create(8, 6.8275, 8);
    const curveRadius = 8;
    const anglePerScreen = 360 / (screenSegmentCount * 2); // Distribute segments along a semicircle

    for (let i = 0; i < screenSegmentCount; i++) {
        const angle = i * anglePerScreen;
        const radian = angle * (Math.PI / 180);

        const x = curveCenter.x + curveRadius * Math.cos(radian);
        const z = curveCenter.z + curveRadius * Math.sin(radian);
        const y = curveCenter.y;

        const position = Vector3.create(x, y, z);
        const rotation = Quaternion.fromEulerDegrees(0, -angle, 0);

        createScreenSegment(i, position, rotation, screenParent, options.videoTexture, screenSegmentScale);
    }

    return screenParent;
}

/**
 * Creates a single segment of the curved screen.
 * @param index - The index of the segment.
 * @param position - The position of the segment.
 * @param rotation - The rotation of the segment.
 * @param parent - The parent entity for the segment.
 * @param videoTexture - The video texture to apply.
 * @param scale - The scale of the segment.
 */
function createScreenSegment(index: number, position: Vector3, rotation: Quaternion, parent: Entity, videoTexture: TextureUnion, scale: Vector3): void {
    const segment = engine.addEntity();
    Transform.create(segment, { parent, position, rotation, scale });
    MeshRenderer.setBox(segment, setUVsCurved(index));
    MeshCollider.setBox(segment);
    Material.setPbrMaterial(segment, {
        texture: videoTexture,
        roughness: 1,
        specularIntensity: 0,
        metallic: 0,
        emissiveTexture: videoTexture,
        emissiveIntensity: 1,
        emissiveColor: Color3.White(),
    });
}