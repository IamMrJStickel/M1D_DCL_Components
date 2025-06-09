M1D Decentraland Components
A collection of reusable, high-quality components for Decentraland SDK 7 scenes, created by M1D.

Installation
To use these components in your Decentraland project, install the package from npm:

npm install @m1d/dcl-components

Available Components
Curved Screen
This component creates a large, curved video screen composed of multiple segments. It is designed to display a single video texture seamlessly across its surface.

Usage Example
Here is how you can import and use the createCurvedScreen component in your scene.

TypeScript

import { engine, VideoPlayer, Material, Transform } from "@dcl/sdk/ecs"
import { Vector3, Quaternion } from "@dcl/sdk/math"
import { createCurvedScreen } from "@m1d/dcl-components"

export function main() {
  // Create a video source for the screen
  const videoEntity = engine.addEntity()
  Transform.create(videoEntity)
  VideoPlayer.create(videoEntity, {
    src: "videos/my-cool-video.mp4",
    playing: true,
    loop: true,
  })
  const myVideoTexture = Material.videoTexture(videoEntity)

  // Create the curved screen using the component
  createCurvedScreen({
    position: Vector3.create(16, 2, 8),
    rotation: Quaternion.fromEulerDegrees(0, 90, 0),
    scale: Vector3.create(1, 1, 1),
    videoTexture: myVideoTexture
  })
}
createCurvedScreen Options
The createCurvedScreen function accepts an options object with the following properties:

Property	Type	Description
position	Vector3	The position of the screen's parent entity.
rotation	Quaternion	The rotation of the screen's parent entity.
scale	Vector3	The scale of the screen's parent entity.
videoTexture	TextureUnion	The video texture to be displayed on the screen.

Export to Sheets
Development
If you wish to contribute to this component library, follow these steps:

Clone the repository.
In the repository's root directory, run npm install.
To test your changes in a local scene, use npm link.
In this project's folder, run: npm link
In your scene's folder, run: npm link @m1d/dcl-components
After making code changes, run npm run build in the component library folder to compile them. The changes will automatically appear in your linked scene.
License
This project is licensed under the MIT License.
