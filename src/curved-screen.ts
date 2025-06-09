// src/curved-screen.ts
import { engine, Transform, MeshRenderer, MeshCollider, Material, TextureUnion } from "@dcl/sdk/ecs";
import { Vector3, Quaternion, Color3 } from "@dcl/sdk/math";


export interface CurvedScreenOptions {
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
    videoTexture: TextureUnion;
}

export function setUVsCurved(segmentIndex: number) {
    const totalScreens = 23;
    // Shift the right half (segments 12-22) one section to the left in UV mapping
    // The center segment is at index 11
    let uStart: number, uEnd: number;

    if (segmentIndex < 11) {
        // Left half (0-10): normal mapping
        uStart = segmentIndex / (totalScreens - 1);
        uEnd = (segmentIndex + 1) / (totalScreens - 1);
    } else if (segmentIndex === 11) {
        // Center segment: its own mapping
        uStart = segmentIndex / (totalScreens - 1);
        uEnd = (segmentIndex + 1) / (totalScreens - 1);
    } else {
        // Right half (12-22): shift mapping one segment to the left
        uStart = (segmentIndex - 1) / (totalScreens - 1);
        uEnd = (segmentIndex) / (totalScreens - 1);
    }

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
        uEnd, 1,
        uStart, 1,
        uStart, 0,
        uEnd, 0,

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
    // const screenSegmentCount = 22; // 22 segments + 1 for the center screen
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
    // Create the 23 screen segments
    for (let i = 0; i < 23; i++) {
        const { position, rotation } = calculateScreenPositionAndRotation(i);
        createScreenSegment(i, position, rotation);
    }
    
    return screenParent;
}
