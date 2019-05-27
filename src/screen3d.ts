import * as BABYLON from 'babylonjs';

export const drawScreen3d = () => {
  // Create a canvas DOM element
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  // Load the 3D engine
  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
  // call the createScene function
  const scene = createScene(canvas, engine);
  // run the render loop
  engine.runRenderLoop(() => {
    scene.render();
  });
  // the canvas/window resize event handler
  window.addEventListener('resize', () => {
    engine.resize();
  });
};

// CreateScene function that creates and returns the scene
const createScene = (canvas: any, engine: any): any => {
  // Create a basic BJS Scene object
  const scene = new BABYLON.Scene(engine);
  // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
  const camera = new BABYLON.FreeCamera(
    'camera1',
    new BABYLON.Vector3(0, 5, -10),
    scene
  );
  // Target the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero());
  // Attach the camera to the canvas
  camera.attachControl(canvas, false);
  // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
  const light = new BABYLON.HemisphericLight(
    'light1',
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
  const sphere = BABYLON.Mesh.CreateSphere(
    'sphere1',
    16,
    0.5,
    scene,
    false,
    BABYLON.Mesh.FRONTSIDE
  );
  // Move the sphere upward 1/2 of its height
  sphere.position.y = 1;
  // Create a built-in "ground" shape; its constructor takes 6 params: name, width, height, subdivision, scene, updatable
  const ground = BABYLON.Mesh.CreateGround('ground1', 8, 8, 2, scene, false);
  // Return the created scene
  return scene;
};
