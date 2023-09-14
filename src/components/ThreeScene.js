import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { GUI } from "dat.gui";

const ThreeScene = () => {
  const sceneRef = useRef();
  const cubeRef = useRef();
  const gltfModels = useRef([]);

  const [controls, setControls] = useState({
    cubeRotationX: 0.01,
    cubeRotationY: 0.01,
    cubeScale: 1,
    matrixOutput: "No Matrix",
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
  });

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Check if the renderer's canvas element is appended to the DOM
    if (sceneRef.current) {
      sceneRef.current.appendChild(renderer.domElement);
    }

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: "black" });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cubeRef.current = cube;

    // Adjust the camera's position and orientation
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // Create a dat.gui instance
    const gui = new GUI();

    const cubeRotationFolder = gui.addFolder("Cube Rotation");
    cubeRotationFolder
      .add(controls, "cubeRotationX", 0, Math.PI * 2, 0.01)
      .name("Rotation X");
    cubeRotationFolder
      .add(controls, "cubeRotationY", 0, Math.PI * 2, 0.01)
      .name("Rotation Y");
    cubeRotationFolder.open();

    const cubeScaleFolder = gui.addFolder("Cube Scale");
    cubeScaleFolder.add(controls, "cubeScale", 0.1, 2, 0.1).name("Scale");
    cubeScaleFolder.open();

    // Display the transformation matrix
    const matrixController = cubeRotationFolder
      .add(controls, "matrixOutput")
      .name("Transformation Matrix");
    matrixController.domElement.style.pointerEvents = "none";

    // Load and display GLTF models
    const loader = new GLTFLoader();

    // Load the first GLTF model
    loader.load(
      "/gandhi/scene.gltf",
      (gltf) => {
        const model = gltf.scene;
        if (model) {
          console.log("First GLTF model loaded successfully:", model);
          scene.add(model);
          gltfModels.current.push(model);
        } else {
          console.error("Error loading first GLTF model");
        }
      },
      undefined,
      (error) => {
        console.error(
          "An error occurred while loading the first GLTF model:",
          error
        );
      }
    );

    // Load the second GLTF model
    loader.load(
        "/gandhi/scene.gltf",
      (gltf) => {
        const model = gltf.scene;
        if (model) {
          console.log("Second GLTF model loaded successfully:", model);
          scene.add(model);
          gltfModels.current.push(model);
        } else {
          console.error("Error loading second GLTF model");
        }
      },
      undefined,
      (error) => {
        console.error(
          "An error occurred while loading the second GLTF model:",
          error
        );
      }
    );

    // Add WASD Controls
    const cameraSpeed = 0.1;

    const handleKeyDown = (event) => {
      const keyCode = event.keyCode;
      switch (keyCode) {
        case 87: // W key
          setControls({
            ...controls,
            positionZ: controls.positionZ - cameraSpeed,
          });
          break;
        case 83: // S key
          setControls({
            ...controls,
            positionZ: controls.positionZ + cameraSpeed,
          });
          break;
        case 65: // A key
          setControls({
            ...controls,
            positionX: controls.positionX - cameraSpeed,
          });
          break;
        case 68: // D key
          setControls({
            ...controls,
            positionX: controls.positionX + cameraSpeed,
          });
          break;
        // You can add more keys for other directions if needed
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Add scene lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Ambient light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Directional light
    directionalLight.position.set(1, 1, 1); // Set the position of the directional light
    scene.add(ambientLight, directionalLight);

    const animate = () => {
      requestAnimationFrame(animate);

      if (cubeRef.current) {
        cubeRef.current.rotation.x += controls.cubeRotationX;
        cubeRef.current.rotation.y += controls.cubeRotationY;
        cubeRef.current.scale.set(
          controls.cubeScale,
          controls.cubeScale,
          controls.cubeScale
        );
      }

      // Apply transformations to GLTF models
      gltfModels.current.forEach((model) => {
        model.rotation.x += controls.cubeRotationX;
        model.rotation.y += controls.cubeRotationY;
        model.scale.set(
          controls.cubeScale,
          controls.cubeScale,
          controls.cubeScale
        );
      });

      // Compute the transformation matrix
      const matrix = new THREE.Matrix4();
      matrix.compose(
        new THREE.Vector3(
          controls.positionX,
          controls.positionY,
          controls.positionZ
        ), // Position
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            controls.rotationX,
            controls.rotationY,
            controls.rotationZ
          )
        ), // Rotation
        new THREE.Vector3(controls.scaleX, controls.scaleY, controls.scaleZ) // Scale
      );

      // Display the matrix as a string (for demonstration purposes)
      controls.matrixOutput = matrix.toArray().join("\n");

      renderer.render(scene, camera);
    };

    animate();
  }, [controls]);

  return (
    <div>
      <div ref={sceneRef}></div>
      {/* Add UI for Position, Rotation, and Scale */}
      <div className="ui-container">
        <div>
          <label>Position X:</label>
          <input
            type="number"
            value={controls.positionX}
            onChange={(e) => {
              const newX = parseFloat(e.target.value);
              setControls({ ...controls, positionX: newX });
            }}
          />
        </div>
        <div>
          <label>Position Y:</label>
          <input
            type="number"
            value={controls.positionY}
            onChange={(e) => {
              const newY = parseFloat(e.target.value);
              setControls({ ...controls, positionY: newY });
            }}
          />
        </div>
        <div>
          <label>Position Z:</label>
          <input
            type="number"
            value={controls.positionZ}
            onChange={(e) => {
              const newZ = parseFloat(e.target.value);
              setControls({ ...controls, positionZ: newZ });
            }}
          />
        </div>
        <div>
          <label>Rotation X:</label>
          <input
            type="number"
            value={controls.rotationX}
            onChange={(e) => {
              const newX = parseFloat(e.target.value);
              setControls({ ...controls, rotationX: newX });
            }}
          />
        </div>
        <div>
          <label>Rotation Y:</label>
          <input
            type="number"
            value={controls.rotationY}
            onChange={(e) => {
              const newY = parseFloat(e.target.value);
              setControls({ ...controls, rotationY: newY });
            }}
          />
        </div>
        <div>
          <label>Rotation Z:</label>
          <input
            type="number"
            value={controls.rotationZ}
            onChange={(e) => {
              const newZ = parseFloat(e.target.value);
              setControls({ ...controls, rotationZ: newZ });
            }}
          />
        </div>
        <div>
          <label>Scale X:</label>
          <input
            type="number"
            value={controls.scaleX}
            onChange={(e) => {
              const newX = parseFloat(e.target.value);
              setControls({ ...controls, scaleX: newX });
            }}
          />
        </div>
        <div>
          <label>Scale Y:</label>
          <input
            type="number"
            value={controls.scaleY}
            onChange={(e) => {
              const newY = parseFloat(e.target.value);
              setControls({ ...controls, scaleY: newY });
            }}
          />
        </div>
        <div>
          <label>Scale Z:</label>
          <input
            type="number"
            value={controls.scaleZ}
            onChange={(e) => {
              const newZ = parseFloat(e.target.value);
              setControls({ ...controls, scaleZ: newZ });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ThreeScene;
