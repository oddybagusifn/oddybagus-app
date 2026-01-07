"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Center, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/vierre-head.glb";

function HeadModel({ isMobile }: { isMobile: boolean }) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null!);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const lastX = useRef(0);

  const rotateSpeed = useRef(0.7);
  const targetSpeed = useRef(0.7);

  const onPointerDown = (e: any) => {
    setIsDragging(true);
    lastX.current = e.clientX;
  };

  const onPointerUp = () => {
    setIsDragging(false);
  };

  const onPointerLeave = () => {
    setIsDragging(false);
  };

  const onPointerMove = (e: any) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastX.current;
    group.current.rotation.y += deltaX * 0.006;
    lastX.current = e.clientX;
  };


  // material setup tetap
  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const name = (mesh.name || "").toLowerCase();
        const isGlasses =
          name.includes("glass") ||
          name.includes("sunglass") ||
          name.includes("lens") ||
          name.includes("shade") ||
          name.includes("spec");

        mesh.material = isGlasses
          ? new THREE.MeshPhysicalMaterial({
            color: "#000",
            roughness: 0.1,
            metalness: 1,
            clearcoat: 1,
          })
          : new THREE.MeshPhysicalMaterial({
            color: "#ff9ff3",
            roughness: 0.12,
            metalness: 0.8,
            clearcoat: 1,
          });
      }
    });
  }, [scene]);

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

  return (
    <group
      ref={group}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
    >
      <Center
        scale={isMobile ? 13 : 11}
        position={[0, -0.2, 0]}
      >
        <primitive object={scene} />
      </Center>
    </group>

  );
}

export default function HeadBustCanvas() {
  const cursorLight = useRef<THREE.PointLight | null>(null);
  const [cursorActive, setCursorActive] = useState(false);

  /* ===== FIX ERROR: isMobile DEFINITION ===== */
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  /* ===== END FIX ===== */

  return (
    <div className="w-full flex justify-center">
      <div
        className="
      mx-auto
      w-full
      max-w-[320px]
      sm:max-w-[420px]
      md:max-w-[520px]
      aspect-square
      flex justify-center items-center
    "
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, 6], fov: 40 }}
          gl={{ alpha: true, antialias: true }}
          className="w-full h-full bg-transparent"
          onPointerEnter={() => setCursorActive(true)}
          onPointerLeave={() => setCursorActive(false)}
        >
          <Suspense fallback={null}>
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

            <pointLight
              ref={cursorLight}
              intensity={0}
              distance={6}
              color="#ffffff"
            />

            <CursorLightFollow
              cursorLight={cursorLight}
              active={cursorActive}
            />

            <HeadModel isMobile={isMobile} />

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

    const pos = camera.position.clone().add(dir.multiplyScalar(2.5));
    cursorLight.current.position.copy(pos);
  });

  return null;
}
