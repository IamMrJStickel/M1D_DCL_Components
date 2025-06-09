// src/curved-screen.ts
import { engine, Entity, Transform, MeshRenderer, MeshCollider, Material, TextureUnion } from "@dcl/sdk/ecs";
import { Vector3, Quaternion, Color3 } from "@dcl/sdk/math";


export interface CurvedScreenOptions {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    videoTexture: TextureUnion;
}

export function setUVsCurved(segmentIndex: number) {
    const totalScreens = 23;
    const curveRadius = 8;
    const screenGap = 0;

    // Calculate total curve length and effective length (accounting for gaps)
    const totalCurveLength = 2 * Math.PI * curveRadius / 2;
    const effectiveCurveLength = totalCurveLength - (totalScreens - 1) * screenGap;

    // Calculate arc length per screen
    const arcLengthPerScreen = effectiveCurveLength / (totalScreens - 1);

    // Adjust segmentIndex for right-side screens to account for the middle screen
    const adjustedSegmentIndex = segmentIndex > 11 ? segmentIndex - 1 : segmentIndex;

    // Calculate cumulative arc length up to this screen
    const cumulativeArcLength = adjustedSegmentIndex * (arcLengthPerScreen + screenGap);

    // Calculate U offset based on the proportion of the curve covered
    const uOffset = cumulativeArcLength / effectiveCurveLength;

    return [
        //--------Top Box 
        0, 0,
        0, 0,
        0, 0,
        0, 0,

        //--------Bottom of Box
        0, 0,
        0, 0,
        0, 0,
        0, 0,

        // Back of Box 
        0, 0,
        0, 0,
        0, 0,
        0, 0,

        // Front of Box 
        0, 0,
        0, 0,
        0, 0,
        0, 0,

        // Right of Front Box
        uOffset + (1.05 / totalScreens), 1,
        uOffset, 1,
        uOffset, 0,
        uOffset + (1.05 / totalScreens), 0,

        // Left of Front Box (Rotated)
        0, 0,
        0, 0,
        0, 0,
        0, 0,
    ];
}

export function createCurvedScreen(options: CurvedScreenOptions) {
    const screenParent = engine.addEntity();
    Transform.create(screenParent, {
        position: options.position,
        rotation: options.rotation,
        scale: options.scale
    });

    const screenHeight = 13.5; // Adjusted to match the original logic
    const screenBaseY = 6.8275; // Adjusted to match the original logic
    const screenSegmentCount = 22; // 22 segments + 1 for the center screen
    const screenSegmentScale = Vector3.create(1.145, screenHeight, 0);
    const curveCenter = Vector3.create(8, screenBaseY, 8);
    const curveRadius = 8;
    const screenGap = 0;

    function createScreenSegment(segmentIndex: number, position: Vector3, rotation: Quaternion) {
        const segment = engine.addEntity();
        Transform.create(segment, { parent: screenParent, position, rotation, scale: screenSegmentScale });
        MeshRenderer.setBox(segment, setUVsCurved(segmentIndex));
        MeshCollider.setBox(segment);
        Material.setPbrMaterial(segment, {
            texture: options.videoTexture,
            roughness: 1,
            specularIntensity: 0,
            metallic: 0,
            emissiveTexture: options.videoTexture,
            emissiveIntensity: 1,
            emissiveColor: Color3.White(),
        });
    }

    function calculateScreenPositionAndRotation(screenIndex: number) {
        const totalScreens = 23; // 22 segments + 1 for the center screen
        const totalCurveLength = 2 * Math.PI * curveRadius / 2; // Half circumference of the circle
        const effectiveCurveLength = totalCurveLength - (totalScreens - 1) * screenGap;
        const arcLengthPerScreen = effectiveCurveLength / (totalScreens - 1);
        const anglePerScreen = (arcLengthPerScreen / curveRadius) * (180 / Math.PI);
        
        let screenAngle;
        if (screenIndex < 11) {
            screenAngle = (10 - screenIndex) * anglePerScreen;
        } else if (screenIndex > 11) {
            screenAngle = -90 + (22 - screenIndex) * anglePerScreen;
        } else {
            screenAngle = 0;
        }
        
        const x = curveCenter.x + curveRadius * Math.cos(screenAngle * (Math.PI / 180));
        const z = curveCenter.z + curveRadius * Math.sin(screenAngle * (Math.PI / 180));
        let rotationY = 270 - screenAngle;
        
        return {
            position: Vector3.create(x, screenBaseY, z),
            rotation: Quaternion.fromEulerDegrees(0, rotationY, 0)
        };
    }

    // Create the 23 screen segments
    for (let i = 0; i < 22; i++) {
        const { position, rotation } = calculateScreenPositionAndRotation(i);
        createScreenSegment(i, position, rotation);
    }
    
    return screenParent;
}
