import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import backgroundMap from '../asset/kirjasto_2krs.png';

const MAP_WIDTH = 2083;
const MAP_HEIGHT = 1562;

class Screen3D {
  labelTexture: GUI.AdvancedDynamicTexture;
  scene: BABYLON.Scene;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = this.drawScreen3d(canvas);
    this.labelTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
  }

  createSphere(): BABYLON.Mesh {
    // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
    const sphere = BABYLON.Mesh.CreateSphere(
      'sphere1',
      16,
      0.7,
      this.scene,
      false,
      BABYLON.Mesh.FRONTSIDE
    );

    // Move the sphere upward 1/2 of its height
    sphere.position.y = 0.35;

    return sphere;
  }

  addBeacon(name: string): BABYLON.Mesh {
    // Create a built-in "sphere" shape - it represents a beacon
    const beacon = this.createSphere();

    // Add a label above the sphere
    this.createLabel(beacon, name);

    return beacon;
  }

  setPosition(beacon: BABYLON.Mesh, x: number, y: number): void {
    // We are in a XZ-coordinate system
    // The origin is at the center
    // The X-axis points to the right
    // The Z-axis points up
    beacon.position.x = (x - MAP_WIDTH / 4) / 100;
    beacon.position.z = (y - MAP_HEIGHT / 4) / 100;
  }

  drawScreen3d(canvas: HTMLCanvasElement): BABYLON.Scene {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    // Load the 3D engine
    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    // call the createScene function
    const scene = this.createScene(canvas, engine);

    // run the render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', () => {
      engine.resize();
    });

    return scene;
  }

  createScene(
    canvas: HTMLCanvasElement,
    engine: BABYLON.Engine
  ): BABYLON.Scene {
    // Create a basic BJS Scene object
    const scene = new BABYLON.Scene(engine);

    // Create an ArcRotateCamera
    const camera = new BABYLON.ArcRotateCamera(
      'Camera',
      -Math.PI / 2,
      Math.PI / 4,
      20,
      new BABYLON.Vector3(0, 0, 0),
      scene
    );

    // Change to ortographic projection
    // camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

    // Attach the camera to the canvas
    camera.attachControl(canvas, false);

    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    const light = new BABYLON.HemisphericLight(
      'light1',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );

    // Create a built-in "ground" shape - it represents the background map
    this.createBackgroundMap();

    // Create a GUI texture for rendering labels
    this.labelTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

    // Return the created scene
    return scene;
  }

  createBackgroundMap(): BABYLON.Mesh {
    // Create a built-in "ground" shape; its constructor takes 6 params: name, width, height, subdivision, scene, updatable
    const ground = BABYLON.Mesh.CreateGround(
      'ground1',
      MAP_WIDTH / 100,
      MAP_HEIGHT / 100,
      2,
      this.scene,
      false
    );

    // Add a map texture on the "ground" shape
    const mapMaterial = new BABYLON.StandardMaterial('mapMaterial', this.scene);
    mapMaterial.diffuseTexture = new BABYLON.Texture(backgroundMap, this.scene);
    ground.material = mapMaterial;

    return ground;
  }

  createLabel(sphere: BABYLON.Mesh, text: string): void {
    // Create a text block which shows the name of the beacon
    const label = new GUI.TextBlock();
    label.text = text;
    this.labelTexture.addControl(label);

    // Move the label so that it tracks the position of the sphere mesh
    label.linkWithMesh(sphere);
    label.linkOffsetY = -25;
  }
}

export default Screen3D;
