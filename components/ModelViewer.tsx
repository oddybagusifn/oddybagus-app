// "use client";

// import { Canvas } from "@react-three/fiber";
// import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
// import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
// import { Suspense } from "react";

// function Model() {
//   const { scene } = useGLTF("/models/bouche_a_levres.glb");

//   return (
//     <primitive
//       object={scene}
//       position={[0, -0.2, 0]}
//       scale={1.1}
//       rotation={[0, Math.PI, 0]}
//     />
//   );
// }

// export default function ModelViewer() {
//   return (
//     <div className="relative w-full h-[520px]">
//       <Canvas
//         camera={{ position: [0, 0, 7], fov: 40 }}
//         dpr={[1, 2]}
//       >
//         {/* LIGHTING */}
//         <ambientLight intensity={0.6} />
//         <directionalLight position={[5, 5, 5]} intensity={1.2} />
//         <directionalLight position={[-5, -3, 2]} intensity={0.5} />

//         {/* MODEL */}
//         <Suspense fallback={null}>
//           <Model />
//         </Suspense>

//         {/* CAMERA CONTROL */}
//         <OrbitControls
//           enableZoom={false}
//           enablePan={false}
//           rotateSpeed={0.6}
//           minPolarAngle={Math.PI / 2.5}
//           maxPolarAngle={Math.PI / 2.1}
//         />

//         {/* POST PROCESSING */}
//         <EffectComposer>
//           <DepthOfField
//             focusDistance={0.02}
//             focalLength={0.025}
//             bokehScale={1.2}
//           />
//         </EffectComposer>
//       </Canvas>
//     </div>
//   );
// }
