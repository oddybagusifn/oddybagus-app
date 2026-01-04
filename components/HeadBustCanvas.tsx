"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Center, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/vierre-head.glb";

function HeadModel() {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null!);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const lastX = useRef(0);

  // Smooth rotation system
  const rotateSpeed = useRef(0.7);
  const targetSpeed = useRef(0.7);

  // Material Setup (badan ungu, kacamata hitam glossy)
  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const name = (mesh.name || "").toLowerCase();

        // coba deteksi mesh kacamata dari namanya
        const isGlasses =
          name.includes("glass") ||
          name.includes("sunglass") ||
          name.includes("lens") ||
          name.includes("shade") ||
          name.includes("spec");

        if (isGlasses) {
          // 🕶️ material kacamata: hitam glossy / mirror
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: "#000000",
            roughness: 0.1,
            metalness: 1,
            clearcoat: 1,
            clearcoatRoughness: 0.05,
            reflectivity: 1,
            transmission: 0,
          });
        } else {
          // 🎨 material default badan: ungu soft metalic
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: "#ff9ff3",
            roughness: 0.12,
            metalness: 0.8,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            reflectivity: 1.0,
          });
        }
      }
    });
  }, [scene]);

  // Rotation Update
  useFrame((_, delta) => {
    if (!isDragging) {
      targetSpeed.current = isHovered ? 0 : 0.7;

      rotateSpeed.current = THREE.MathUtils.lerp(
        rotateSpeed.current,
        targetSpeed.current,
        0.05
      );

      group.current.rotation.y += delta * rotateSpeed.current;
    }
  });

  // Pointer Handlers
  const onPointerOver = () => setIsHovered(true);
  const onPointerOut = () => {
    setIsHovered(false);
    setIsDragging(false);
  };

  const onPointerDown = (e: any) => {
    setIsDragging(true);
    lastX.current = e.clientX;
  };

  const onPointerMove = (e: any) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastX.current;
    group.current.rotation.y += deltaX * 0.01;
    lastX.current = e.clientX;
  };

  const onPointerUp = () => setIsDragging(false);

  return (
    <group
      ref={group}
      scale={4.2}
      position={[0.30, 0, 0]} // 👈 geser halus ke kanan
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

export default function HeadBustCanvas() {
  const cursorLight = useRef<THREE.PointLight | null>(null);
  const [cursorActive, setCursorActive] = useState(false);

  return (
    <div className="w-full flex justify-center items-center">
      <div className="
  w-full
  max-w-[320px]
  sm:max-w-[420px]
  md:max-w-[520px]
  aspect-square
  flex justify-center items-center
">
        <Canvas
          shadows
          camera={{ position: [0, 0.3, 3.1], fov: 32 }}
          gl={{ alpha: true, antialias: true }}
          className="w-full h-full bg-transparent"
          onPointerEnter={() => setCursorActive(true)}
          onPointerLeave={() => setCursorActive(false)}
        >
          <Suspense fallback={null}>
            {/* Base lighting */}
            <ambientLight intensity={0.7} />

            <directionalLight
              position={[-100, 4, 0]}
              intensity={8}
              color="#ffffff"
            />

            <directionalLight
              position={[4, -1, -2]}
              intensity={2}
              color="#ffffff"
            />

            {/* Cursor Light (start intensity 0) */}
            <pointLight
              ref={cursorLight}
              intensity={0}
              distance={6}
              color="#ffffff"
            />

            {/* Cursor Light Logic */}
            <CursorLightFollow
              cursorLight={cursorLight}
              active={cursorActive}
            />

            <HeadModel />

            {/* Shadow */}
            <ContactShadows
              position={[0, -1.4, 0]}
              opacity={0.7}
              width={5}
              height={5}
              blur={2.5}
              far={4}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

/* Cursor Light Follow Component */
function CursorLightFollow({
  cursorLight,
  active,
}: {
  cursorLight: React.MutableRefObject<THREE.PointLight | null>;
  active: boolean;
}) {
  const { camera, pointer } = useThree();

  useFrame(() => {
    if (!cursorLight.current) return;

    if (!active) {
      cursorLight.current.intensity = 0;
      return;
    }

    cursorLight.current.intensity = 4;

    const dir = new THREE.Vector3(pointer.x, pointer.y, 0.5)
      .unproject(camera)
      .sub(camera.position)
      .normalize();

    const distanceFromCamera = 2.5;
    const pos = camera.position
      .clone()
      .add(dir.multiplyScalar(distanceFromCamera));

    cursorLight.current.position.copy(pos);
  });

  return null;
}
