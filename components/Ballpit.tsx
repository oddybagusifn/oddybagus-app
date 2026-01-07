"use client";

import React, { useRef, useEffect } from "react";
import {
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  WebGLRendererParameters,
  SRGBColorSpace,
  MathUtils,
  Vector2,
  Vector3,
  Color,
  Object3D,
  AmbientLight,
  PointLight,
  ACESFilmicToneMapping,
  Raycaster,
  Plane,
  Box3,
  PlaneGeometry,
  Mesh,
  ShadowMaterial,
  PCFSoftShadowMap,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  Types & Helpers                                                           */
/* -------------------------------------------------------------------------- */

interface XOptions {
  canvas?: HTMLCanvasElement;
  id?: string;
  rendererOptions?: Partial<WebGLRendererParameters>;
  size?: "parent" | { width: number; height: number };
}

interface SizeData {
  width: number;
  height: number;
  wWidth: number;
  wHeight: number;
  ratio: number;
  pixelRatio: number;
}

const isMobile =
  typeof window !== "undefined" &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/** Wrapper renderer + camera + resize/visibility */
class X {
  #config: XOptions;
  #postprocessing: any;
  #resizeObserver?: ResizeObserver;
  #intersectionObserver?: IntersectionObserver;
  #resizeTimer?: number;
  #animationFrameId: number = 0;
  #clock: Clock = new Clock();
  #animationState = { elapsed: 0, delta: 0 };
  #isAnimating: boolean = false;
  #isVisible: boolean = false;

  canvas!: HTMLCanvasElement;
  camera!: PerspectiveCamera;
  cameraMinAspect?: number;
  cameraMaxAspect?: number;
  cameraFov!: number;
  maxPixelRatio?: number;
  minPixelRatio?: number;
  scene!: Scene;
  renderer!: WebGLRenderer;
  size: SizeData = {
    width: 0,
    height: 0,
    wWidth: 0,
    wHeight: 0,
    ratio: 0,
    pixelRatio: 0,
  };

  render: () => void = this.#render.bind(this);
  onBeforeRender: (state: { elapsed: number; delta: number }) => void =
    () => { };
  onAfterRender: (state: { elapsed: number; delta: number }) => void = () => { };
  onAfterResize: (size: SizeData) => void = () => { };
  isDisposed: boolean = false;

  constructor(config: XOptions) {
    this.#config = { ...config };
    this.#initCamera();
    this.#initScene();
    this.#initRenderer();
    this.resize();
    this.#initObservers();
  }

  #initCamera() {
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
  }

  #initScene() {
    this.scene = new Scene();
  }

  #initRenderer() {
    if (this.#config.canvas) {
      this.canvas = this.#config.canvas;
    } else if (this.#config.id) {
      const elem = document.getElementById(this.#config.id);
      if (elem instanceof HTMLCanvasElement) {
        this.canvas = elem;
      } else {
        console.error("Three: Missing canvas or id parameter");
      }
    } else {
      console.error("Three: Missing canvas or id parameter");
    }

    this.canvas.style.display = "block";

    const rendererOptions: WebGLRendererParameters = {
      canvas: this.canvas,
      powerPreference: "high-performance",
      ...(this.#config.rendererOptions ?? {}),
    };

    this.renderer = new WebGLRenderer(rendererOptions);
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap; // soft shadow
  }

  #initObservers() {
    if (!(this.#config.size instanceof Object)) {
      window.addEventListener("resize", this.#onResize);
      if (this.#config.size === "parent" && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#onResize);
        this.#resizeObserver.observe(this.canvas.parentNode as Element);
      }
    }

    this.#intersectionObserver = new IntersectionObserver(
      this.#onIntersection,
      {
        root: null,
        rootMargin: "0px",
        threshold: 0,
      }
    );
    this.#intersectionObserver.observe(this.canvas);
    document.addEventListener("visibilitychange", this.#onVisibilityChange);
  }

  #onResize = () => {
    if (this.#resizeTimer) clearTimeout(this.#resizeTimer);
    this.#resizeTimer = window.setTimeout(() => this.resize(), 100);
  };

  resize() {
    let w: number, h: number;

    if (this.#config.size instanceof Object) {
      w = this.#config.size.width;
      h = this.#config.size.height;
    } else if (this.#config.size === "parent" && this.canvas.parentNode) {
      w = (this.canvas.parentNode as HTMLElement).offsetWidth;
      h = (this.canvas.parentNode as HTMLElement).offsetHeight;
    } else {
      w = window.innerWidth;
      h = window.innerHeight;
    }

    this.size.width = w;
    this.size.height = h;
    this.size.ratio = w / h;

    this.#updateCamera();
    this.#updateRenderer();
    this.onAfterResize(this.size);
  }

  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#adjustFov(this.cameraMinAspect);
      } else if (
        this.cameraMaxAspect &&
        this.camera.aspect > this.cameraMaxAspect
      ) {
        this.#adjustFov(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }

  #adjustFov(aspect: number) {
    const tanFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2));
    const newTan = tanFov / (this.camera.aspect / aspect);
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(newTan));
  }

  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fovRad = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight =
        2 * Math.tan(fovRad / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    } else if ((this.camera as any).isOrthographicCamera) {
      const cam = this.camera as any;
      this.size.wHeight = cam.top - cam.bottom;
      this.size.wWidth = cam.right - cam.left;
    }
  }

  #updateRenderer() {
    let pr = window.devicePixelRatio;

    if (isMobile) {
      pr = Math.min(pr, 1.0);
    } else {
      if (this.maxPixelRatio && pr > this.maxPixelRatio) pr = this.maxPixelRatio;
      if (this.minPixelRatio && pr < this.minPixelRatio) pr = this.minPixelRatio;
    }

    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(this.size.width, this.size.height);
    this.#postprocessing?.setSize(this.size.width, this.size.height);

    this.size.pixelRatio = pr;
  }


  get postprocessing() {
    return this.#postprocessing;
  }
  set postprocessing(value: any) {
    this.#postprocessing = value;
    this.render = value.render.bind(value);
  }

  #onIntersection = (entries: IntersectionObserverEntry[]) => {
    this.#isAnimating = entries[0].isIntersecting;
    this.#isAnimating ? this.#startAnimation() : this.#stopAnimation();
  };

  #onVisibilityChange = () => {
    if (this.#isAnimating) {
      document.hidden ? this.#stopAnimation() : this.#startAnimation();
    }
  };

  #startAnimation() {
    if (this.#isVisible) return;

    const animateFrame = () => {
      this.#animationFrameId = requestAnimationFrame(animateFrame);
      this.#animationState.delta = this.#clock.getDelta();
      this.#animationState.elapsed += this.#animationState.delta;
      this.onBeforeRender(this.#animationState);
      this.render();
      this.onAfterRender(this.#animationState);
    };

    this.#isVisible = true;
    this.#clock.start();
    animateFrame();
  }

  #stopAnimation() {
    if (this.#isVisible) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#isVisible = false;
      this.#clock.stop();
    }
  }

  #render() {
    this.renderer.render(this.scene, this.camera);
  }

  clear() {
    this.scene.traverse((obj) => {
      const anyObj = obj as any;
      if (anyObj.isMesh && anyObj.geometry) {
        anyObj.geometry.dispose?.();
      }
      if (anyObj.material) {
        if (Array.isArray(anyObj.material)) {
          anyObj.material.forEach((m: any) => m.dispose?.());
        } else {
          anyObj.material.dispose?.();
        }
      }
    });
    this.scene.clear();
  }

  dispose() {
    this.#onResizeCleanup();
    this.#stopAnimation();
    this.clear();
    this.#postprocessing?.dispose?.();
    this.renderer.dispose();
    this.isDisposed = true;
  }

  #onResizeCleanup() {
    window.removeEventListener("resize", this.#onResize);
    this.#resizeObserver?.disconnect();
    this.#intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", this.#onVisibilityChange);
  }
}

/* ------------------------------ Physics ------------------------------------ */

export interface WConfig {
  count: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  maxSize: number;
  minSize: number;
  size0: number;
  gravity: number;
  friction: number;
  wallBounce: number;
  maxVelocity: number;
  colliderScale?: number;
  controlSphere0?: boolean;
}

class W {
  config: WConfig;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  center: Vector3 = new Vector3();
  collisionImpulseData: Float32Array;

  constructor(config: WConfig) {
    this.config = {
      ...config,
      colliderScale: config.colliderScale ?? 0.65,
    };
    this.positionData = new Float32Array(3 * this.config.count).fill(0);
    this.velocityData = new Float32Array(3 * this.config.count).fill(0);
    this.sizeData = new Float32Array(this.config.count).fill(1);
    this.collisionImpulseData = new Float32Array(3 * this.config.count).fill(0);
    this.center = new Vector3();
    this.#initializePositions();
    this.setSizes();
  }

  // ✨ spawn baymax sebagai "hujan" dari atas layar
  #initializePositions() {
    const { config, positionData } = this;

    const spawnMinY = config.maxY * 1.2; // sedikit di atas area ballpit
    const spawnMaxY = config.maxY * 2.4; // jauh di atas → efek hujan

    for (let i = 0; i < config.count; i++) {
      const idx = 3 * i;

      // X: random sepanjang arena
      positionData[idx] = MathUtils.randFloatSpread(config.maxX * 2);

      // Y: jauh di atas lantai
      positionData[idx + 1] = MathUtils.randFloat(spawnMinY, spawnMaxY);

      // Z: kedalaman acak
      positionData[idx + 2] = MathUtils.randFloatSpread(config.maxZ * 2);
    }
  }

  setSizes() {
    const { config, sizeData } = this;
    for (let i = 0; i < config.count; i++) {
      sizeData[i] = MathUtils.randFloat(config.minSize, config.maxSize);
    }
  }

  update(deltaInfo: { delta: number }) {
    const { config, center, positionData, sizeData, velocityData } = this;
    const colliderScale = config.colliderScale ?? 0.65;

    this.collisionImpulseData.fill(0);

    // Integrasi posisi
    for (let idx = 0; idx < config.count; idx++) {
      const base = 3 * idx;
      const pos = new Vector3().fromArray(positionData, base);
      const vel = new Vector3().fromArray(velocityData, base);

      vel.y -= deltaInfo.delta * config.gravity * sizeData[idx];
      vel.multiplyScalar(config.friction);
      vel.clampLength(0, config.maxVelocity);
      pos.add(vel);

      pos.toArray(positionData, base);
      vel.toArray(velocityData, base);
    }

    // Collision antar Baymax
    for (let idx = 0; idx < config.count; idx++) {
      const base = 3 * idx;
      const pos = new Vector3().fromArray(positionData, base);
      const vel = new Vector3().fromArray(velocityData, base);
      const radius = sizeData[idx] * colliderScale;
      const maxCheck = isMobile ? Math.min(config.count, idx + 8) : config.count;

      for (let jdx = idx + 1; jdx < maxCheck; jdx++) {
        const otherBase = 3 * jdx;
        const otherPos = new Vector3().fromArray(positionData, otherBase);
        const otherVel = new Vector3().fromArray(velocityData, otherBase);
        const diff = new Vector3().copy(otherPos).sub(pos);
        const dist = diff.length();
        const sumRadius = radius + sizeData[jdx] * colliderScale;

        if (dist < sumRadius && dist > 0.0001) {
          const overlap = sumRadius - dist;
          const normal = diff.clone().normalize();
          const correction = normal.clone().multiplyScalar(0.5 * overlap);

          pos.sub(correction);
          otherPos.add(correction);

          const bounce = config.wallBounce;
          const impulse = correction
            .clone()
            .multiplyScalar(4 * bounce * deltaInfo.delta);

          vel.sub(impulse);
          otherVel.add(impulse);

          vel.multiplyScalar(0.8);
          otherVel.multiplyScalar(0.8);

          pos.toArray(positionData, base);
          vel.toArray(velocityData, base);

          otherPos.toArray(positionData, otherBase);
          otherVel.toArray(velocityData, otherBase);

          const ciA = 3 * idx;
          const ciB = 3 * jdx;
          this.collisionImpulseData[ciA] += impulse.x;
          this.collisionImpulseData[ciA + 1] += impulse.y;
          this.collisionImpulseData[ciA + 2] += impulse.z;

          this.collisionImpulseData[ciB] -= impulse.x;
          this.collisionImpulseData[ciB + 1] -= impulse.y;
          this.collisionImpulseData[ciB + 2] -= impulse.z;
        }
      }

      // Pointer field (repulsion)
      if (config.controlSphere0) {
        const dir = new Vector3().copy(pos).sub(center);
        const dist = dir.length();
        const pointerRadius = sizeData[idx] * colliderScale * 3.2;

        if (dist < pointerRadius && dist > 0.0001) {
          const strength = (pointerRadius - dist) / pointerRadius;
          const push = dir.normalize().multiplyScalar(strength * 6);
          const velPush = dir
            .clone()
            .normalize()
            .multiplyScalar(strength * 10 * deltaInfo.delta);

          pos.add(push);
          vel.add(velPush);

          pos.toArray(positionData, base);
          vel.toArray(velocityData, base);

          const ci = 3 * idx;
          this.collisionImpulseData[ci] += velPush.x;
          this.collisionImpulseData[ci + 1] += velPush.y;
          this.collisionImpulseData[ci + 2] += velPush.z;
        }
      }

      const effectiveRadius = radius;

      // X walls
      if (Math.abs(pos.x) + effectiveRadius > config.maxX) {
        const normal = new Vector3(Math.sign(pos.x), 0, 0);
        pos.x = Math.sign(pos.x) * (config.maxX - effectiveRadius);
        const vDotN = vel.dot(normal);
        const vNormal = normal.clone().multiplyScalar(vDotN);
        const vTangent = vel.clone().sub(vNormal);

        vel.x = -vNormal.x * config.wallBounce + vTangent.x;
        vel.y = vTangent.y;
        vel.z = vTangent.z;
        vel.multiplyScalar(0.7);

        pos.toArray(positionData, base);
        vel.toArray(velocityData, base);

        const ci = 3 * idx;
        const impulseRot = vTangent.clone().multiplyScalar(3 * deltaInfo.delta);
        this.collisionImpulseData[ci] += impulseRot.x;
        this.collisionImpulseData[ci + 1] += impulseRot.y;
        this.collisionImpulseData[ci + 2] += impulseRot.z;
      }

      // Y floor (pakai gravity)
      if (pos.y - effectiveRadius < -config.maxY) {
        const normal = new Vector3(0, 1, 0);
        pos.y = -config.maxY + effectiveRadius;
        const vDotN = vel.dot(normal);
        const vNormal = normal.clone().multiplyScalar(vDotN);
        const vTangent = vel.clone().sub(vNormal);

        vel.x = vTangent.x;
        vel.y = -vNormal.y * config.wallBounce + vTangent.y;
        vel.z = vTangent.z;
        vel.multiplyScalar(0.7);

        pos.toArray(positionData, base);
        vel.toArray(velocityData, base);

        const ci = 3 * idx;
        const impulseRot = vTangent.clone().multiplyScalar(3 * deltaInfo.delta);
        this.collisionImpulseData[ci] += impulseRot.x;
        this.collisionImpulseData[ci + 1] += impulseRot.y;
        this.collisionImpulseData[ci + 2] += impulseRot.z;
      }

      // Z front/back
      const maxBoundary = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(pos.z) + effectiveRadius > maxBoundary) {
        const normal = new Vector3(0, 0, Math.sign(pos.z));
        pos.z = Math.sign(pos.z) * (config.maxZ - effectiveRadius);
        const vDotN = vel.dot(normal);
        const vNormal = normal.clone().multiplyScalar(vDotN);
        const vTangent = vel.clone().sub(vNormal);

        vel.x = vTangent.x;
        vel.y = vTangent.y;
        vel.z = -vNormal.z * config.wallBounce + vTangent.z;
        vel.multiplyScalar(0.7);

        pos.toArray(positionData, base);
        vel.toArray(velocityData, base);

        const ci = 3 * idx;
        const impulseRot = vTangent.clone().multiplyScalar(3 * deltaInfo.delta);
        this.collisionImpulseData[ci] += impulseRot.x;
        this.collisionImpulseData[ci + 1] += impulseRot.y;
        this.collisionImpulseData[ci + 2] += impulseRot.z;
      }

      pos.toArray(positionData, base);
      vel.toArray(velocityData, base);
    }
  }
}

/* --------------------- Default config untuk Baymax ------------------------- */

const DEFAULT_CONFIG: WConfig = {
  count: isMobile ? 18 : 120,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  maxSize: 1.2,
  minSize: 0.6,
  size0: 1,
  gravity: 0.5,
  friction: 0.995,
  wallBounce: 0.45,
  maxVelocity: 0.14,
  colliderScale: 0.65,
  controlSphere0: false,
};

/* ---------------------- Pointer (mouse/touch → center) --------------------- */

const pointerPosition = new Vector2();
let globalPointerActive = false;

interface PointerData {
  position: Vector2;
  nPosition: Vector2;
  hover: boolean;
  touching: boolean;
  onEnter: (data: PointerData) => void;
  onMove: (data: PointerData) => void;
  onClick: (data: PointerData) => void;
  onLeave: (data: PointerData) => void;
  dispose?: () => void;
}

const pointerMap = new Map<HTMLElement, PointerData>();

function createPointerData(
  options: Partial<PointerData> & { domElement: HTMLElement }
): PointerData {
  const defaultData: PointerData = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter: () => { },
    onMove: () => { },
    onClick: () => { },
    onLeave: () => { },
    ...options,
  };

  if (!pointerMap.has(options.domElement)) {
    pointerMap.set(options.domElement, defaultData);

    if (!globalPointerActive) {
      document.body.addEventListener("pointermove", onPointerMove as any);
      document.body.addEventListener("pointerleave", onPointerLeave as any);
      document.body.addEventListener("click", onPointerClick as any);

      document.body.addEventListener("touchstart", onTouchStart as any, {
        passive: false,
      });
      document.body.addEventListener("touchmove", onTouchMove as any, {
        passive: false,
      });
      document.body.addEventListener("touchend", onTouchEnd as any, {
        passive: false,
      });
      document.body.addEventListener("touchcancel", onTouchEnd as any, {
        passive: false,
      });

      globalPointerActive = true;
    }
  }

  defaultData.dispose = () => {
    pointerMap.delete(options.domElement);
    if (pointerMap.size === 0) {
      document.body.removeEventListener("pointermove", onPointerMove as any);
      document.body.removeEventListener("pointerleave", onPointerLeave as any);
      document.body.removeEventListener("click", onPointerClick as any);

      document.body.removeEventListener("touchstart", onTouchStart as any);
      document.body.removeEventListener("touchmove", onTouchMove as any);
      document.body.removeEventListener("touchend", onTouchEnd as any);
      document.body.removeEventListener("touchcancel", onTouchEnd as any);
      globalPointerActive = false;
    }
  };

  return defaultData;
}

function onPointerMove(e: PointerEvent) {
  pointerPosition.set(e.clientX, e.clientY);
  processPointerInteraction();
}

function processPointerInteraction() {
  for (const [elem, data] of pointerMap) {
    const rect = elem.getBoundingClientRect();
    if (isInside(rect)) {
      updatePointerData(data, rect);
      if (!data.hover) {
        data.hover = true;
        data.onEnter(data);
      }
      data.onMove(data);
    } else if (data.hover && !data.touching) {
      data.hover = false;
      data.onLeave(data);
    }
  }
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault();
    pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
    for (const [elem, data] of pointerMap) {
      const rect = elem.getBoundingClientRect();
      if (isInside(rect)) {
        data.touching = true;
        updatePointerData(data, rect);
        if (!data.hover) {
          data.hover = true;
          data.onEnter(data);
        }
        data.onMove(data);
      }
    }
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault();
    pointerPosition.set(e.touches[0].clientX, e.touches[0].clientY);
    for (const [elem, data] of pointerMap) {
      const rect = elem.getBoundingClientRect();
      updatePointerData(data, rect);
      if (isInside(rect)) {
        if (!data.hover) {
          data.hover = true;
          data.touching = true;
          data.onEnter(data);
        }
        data.onMove(data);
      } else if (data.hover && data.touching) {
        data.onMove(data);
      }
    }
  }
}

function onTouchEnd() {
  for (const [, data] of pointerMap) {
    if (data.touching) {
      data.touching = false;
      if (data.hover) {
        data.hover = false;
        data.onLeave(data);
      }
    }
  }
}

function onPointerClick(e: PointerEvent) {
  pointerPosition.set(e.clientX, e.clientY);
  for (const [elem, data] of pointerMap) {
    const rect = elem.getBoundingClientRect();
    updatePointerData(data, rect);
    if (isInside(rect)) data.onClick(data);
  }
}

function onPointerLeave() {
  for (const data of pointerMap.values()) {
    if (data.hover) {
      data.hover = false;
      data.onLeave(data);
    }
  }
}

function updatePointerData(data: PointerData, rect: DOMRect) {
  data.position.set(
    pointerPosition.x - rect.left,
    pointerPosition.y - rect.top
  );
  data.nPosition.set(
    (data.position.x / rect.width) * 2 - 1,
    (-data.position.y / rect.height) * 2 + 1
  );
}

function isInside(rect: DOMRect) {
  return (
    pointerPosition.x >= rect.left &&
    pointerPosition.x <= rect.left + rect.width &&
    pointerPosition.y >= rect.top &&
    pointerPosition.y <= rect.top + rect.height
  );
}

/* ------------------------ createBallpit (Baymax clones) -------------------- */

interface CreateBallpitReturn {
  three: X;
  baymaxes: Object3D[];
  togglePause: () => void;
  dispose: () => void;
}

const COLOR_PALETTE = [
  0xff6bcb, 0xfeca57, 0x54a0ff, 0x5f27cd, 0x1dd1a1, 0xff9ff3, 0xffc3a0,
  0xa3ff9e,
];

async function createBallpit(
  canvas: HTMLCanvasElement,
  config: Partial<WConfig> & { followCursor?: boolean } = {}
): Promise<CreateBallpitReturn> {
  const threeInstance = new X({
    canvas,
    size: "parent",
    rendererOptions: { antialias: true, alpha: true },
  });

  threeInstance.renderer.shadowMap.enabled = true;
  threeInstance.renderer.shadowMap.type = isMobile
    ? THREE.BasicShadowMap   // 🔥 paling ringan
    : THREE.PCFSoftShadowMap;


  threeInstance.renderer.toneMapping = ACESFilmicToneMapping;
  threeInstance.renderer.toneMappingExposure = 1.5;
  threeInstance.camera.position.set(0, 0, 20);
  threeInstance.camera.lookAt(0, 0, 0);
  threeInstance.cameraMaxAspect = 1.5;
  threeInstance.resize();

  // lights
  const ambient = new AmbientLight(
    0xffffff,
    isMobile ? 1.6 : 0.9 // 🔥 lebih terang di mobile
  );


  const keyLight = new PointLight(0xffffff, 10, 80, 1);
  const mainLight = new PointLight(0xffffff, 1.2);

  mainLight.position.set(0, 10, 10);
  mainLight.castShadow = true;

  const sculptLight = new PointLight(0xffffff, isMobile ? 1.2 : 2.5, 40, 2);
  sculptLight.position.set(-2.5, 6, -3.5); // 🔥 dari belakang samping
  sculptLight.castShadow = !isMobile; // 🔥 mobile NO self-shadow

  sculptLight.shadow.mapSize.set(isMobile ? 256 : 512, isMobile ? 256 : 512);
  sculptLight.shadow.bias = -0.005;
  sculptLight.shadow.normalBias = 0.04;

  threeInstance.scene.add(sculptLight);



  if (isMobile) {
    mainLight.intensity = 3.4;               // 🔥 terang & kontras
    mainLight.position.set(2.5, 6.5, 6);
    mainLight.distance = 25;                 // 🔥 fokus area kecil
    mainLight.decay = 2;                     // falloff realistis

    mainLight.shadow.mapSize.set(128, 128);
    mainLight.shadow.bias = -0.002;
    mainLight.shadow.normalBias = 0.06;         // shadow nempel
  }
  else {
    mainLight.intensity = 1.2;
    mainLight.shadow.mapSize.set(512, 512);
    mainLight.shadow.bias = -0.0005;
    mainLight.shadow.normalBias = 0.02;
    mainLight.shadow.radius = 5;
  }

  const fillLight = new PointLight(
    0xffffff,
    isMobile ? 6 : 18,
    120,
    1
  );

  fillLight.position.set(-24, 10, 10);
  fillLight.castShadow = false;

  keyLight.position.set(12, 25, 14);
  keyLight.castShadow = false;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.bias = -0.0005;

  let cursorLight: PointLight | null = null;
  if (!isMobile) {
    cursorLight = new PointLight(0xffffff, 12, 100, 0.3);
    cursorLight.position.set(0, 0, 8);
    cursorLight.castShadow = true;
    cursorLight.shadow.mapSize.set(1024, 1024);
    cursorLight.shadow.radius = 2.0;
    threeInstance.scene.add(cursorLight);
  }

  threeInstance.scene.add(ambient, mainLight, fillLight);

  // ground plane untuk shadow
  const groundMat = new ShadowMaterial({
    opacity: isMobile ? 0.05 : 0.4, // 
  });

  const groundGeo = new PlaneGeometry(20, 20);
  const ground = new Mesh(groundGeo, groundMat);
  ground.receiveShadow = true;
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  threeInstance.scene.add(ground);

  // load GLB baymax
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync("/models/baymax.glb");
  const baseModel = gltf.scene;

  baseModel.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });


  // normalisasi base model ke sekitar (0,0,0)
  const box = new Box3().setFromObject(baseModel);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const baseScale = 1.8 / maxDim;

  baseModel.position.sub(center);
  baseModel.scale.setScalar(baseScale);

  baseModel.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // physics
  const physics = new W({
    ...DEFAULT_CONFIG,
    ...config,
    count: config.count ?? DEFAULT_CONFIG.count,
  });

  const baymaxes: Object3D[] = [];
  const angularVelocity: Vector3[] = [];

  let worldYOffset = 0;

  // recolor clone
  function applyColorToClone(clone: Object3D, colorHex: number) {
    const bodyColor = new Color(colorHex);
    clone.traverse((child) => {
      const mesh: any = child;
      if (!mesh.isMesh || !mesh.material) return;

      const applyMat = (mat: any) => {
        if (!mat || !mat.color) return;
        const col = mat.color as Color;
        const luminance = (col.r + col.g + col.b) / 3;
        const newMat = mat.clone();

        if (luminance < 0.15) {
          newMat.color = new Color(0x000000);
          newMat.metalness = 0.0;
          newMat.roughness = 0.35;
          newMat.clearcoat = 0.2;
          newMat.clearcoatRoughness = 0.2;
        } else {
          newMat.color = bodyColor.clone();
          newMat.metalness = 0.2;
          newMat.roughness = 0.12;
          newMat.clearcoat = 1.0;
          newMat.clearcoatRoughness = 0.03;
        }

        newMat.needsUpdate = true;
        return newMat;
      };

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m: any) => applyMat(m) ?? m);
      } else {
        mesh.material = applyMat(mesh.material) ?? mesh.material;
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }

  // spawn clones
  for (let i = 0; i < physics.config.count; i++) {
    const clone = cloneSkeleton(baseModel) as Object3D;

    const base = 3 * i;
    const pos = new Vector3(
      physics.positionData[base],
      physics.positionData[base + 1],
      physics.positionData[base + 2]
    );
    const s = physics.sizeData[i];

    clone.position.copy(pos);
    clone.scale.multiplyScalar(s);

    clone.rotation.set(
      MathUtils.degToRad(MathUtils.randFloat(-15, 15)),
      MathUtils.degToRad(MathUtils.randFloat(0, 360)),
      MathUtils.degToRad(MathUtils.randFloat(-15, 15))
    );

    const colorIdx = Math.floor(Math.random() * COLOR_PALETTE.length);
    applyColorToClone(clone, COLOR_PALETTE[colorIdx]);

    threeInstance.scene.add(clone);
    baymaxes.push(clone);
    angularVelocity[i] = new Vector3();
  }

  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);

  const intersectionPoint = new Vector3();
  let isPaused = false;

  canvas.style.touchAction = "none";
  canvas.style.userSelect = "none";
  (canvas.style as any).webkitUserSelect = "none";

  let pointerData: PointerData | null = null;

  if (!isMobile && config.followCursor !== false) {
    pointerData = createPointerData({
      domElement: canvas,
      onMove() {
        raycaster.setFromCamera(pointerData!.nPosition, threeInstance.camera);
        raycaster.ray.intersectPlane(plane, intersectionPoint);

        physics.center.copy(intersectionPoint);
        physics.config.controlSphere0 = true;

        if (cursorLight) {
          cursorLight.position.copy(intersectionPoint).setZ(8);
        }
      },
      onLeave() {
        physics.config.controlSphere0 = false;
      },
      onClick() { },
      onEnter() { },
    });
  }


  const tmpVel = new Vector3();
  const tmpAxis = new Vector3();
  const tmpImpulse = new Vector3();
  const up = new Vector3(0, 1, 0);

  let accumulator = 0;
  const PHYSICS_STEP = isMobile ? 1 / 30 : 1 / 60;
  const MAX_STEPS = isMobile ? 1 : 3;

  threeInstance.onBeforeRender = ({ delta }) => {
    if (isPaused) return;

    accumulator += delta;

    let steps = 0;

    while (accumulator >= PHYSICS_STEP && steps < MAX_STEPS) {
      if (isMobile) {
        physics.config.controlSphere0 = false;
      }

      physics.update({ delta: PHYSICS_STEP });

      for (let i = 0; i < baymaxes.length; i++) {
        const obj = baymaxes[i];
        const base = 3 * i;

        const px = physics.positionData[base];
        const py = physics.positionData[base + 1];
        const pz = physics.positionData[base + 2];

        obj.position.set(px, py + worldYOffset, pz);

        const s = physics.sizeData[i];
        obj.scale.setScalar(baseScale * s);

        const angVel = angularVelocity[i];

        // --- rotational impulse ---
        tmpImpulse.set(
          physics.collisionImpulseData[base],
          physics.collisionImpulseData[base + 1],
          physics.collisionImpulseData[base + 2]
        );

        const impulseLen = tmpImpulse.length();
        if (impulseLen > 0.0001) {
          const axis = tmpImpulse.clone().cross(up);
          if (axis.lengthSq() > 0.000001) {
            axis.normalize();
            angVel.add(axis.multiplyScalar(impulseLen * 4));
          }
        }

        // --- rolling rotation ---
        {
          tmpVel.set(
            physics.velocityData[base],
            physics.velocityData[base + 1],
            physics.velocityData[base + 2]
          );

          const speed = tmpVel.length();

          // ⚙️ parameter berbeda desktop vs mobile
          const ROT_LERP = isMobile ? 0.08 : 0.18;
          const ROT_DAMP = isMobile ? 0.92 : 0.9;
          const MIN_SPEED = isMobile ? 0.04 : 0.01;

          if (speed > MIN_SPEED) {
            tmpAxis.crossVectors(tmpVel, up).normalize();

            const radius = s * (physics.config.colliderScale ?? 0.65);
            const angularSpeed = speed / Math.max(radius, 0.001);

            angVel.lerp(
              tmpAxis.multiplyScalar(angularSpeed),
              ROT_LERP
            );
          } else {
            angVel.multiplyScalar(ROT_DAMP);
          }

          // apply rotation
          const angle = angVel.length() * PHYSICS_STEP;
          if (angle > 0.0001) {
            obj.rotateOnAxis(
              angVel.clone().normalize(),
              angle
            );
          }
        }

      }

      accumulator -= PHYSICS_STEP;
      steps++;
    }
  };

  threeInstance.onAfterResize = (sizeInfo) => {
    // ✨ jaga-jaga kalau world size sempat 0 saat resize
    const safeMaxXFromWorld =
      sizeInfo.wWidth > 0 ? sizeInfo.wWidth / 2 : DEFAULT_CONFIG.maxX;
    const safeMaxYFromWorld =
      sizeInfo.wHeight > 0 ? sizeInfo.wHeight / 2.28 : DEFAULT_CONFIG.maxY;

    // jangan pernah lebih kecil dari default
    physics.config.maxX = Math.max(DEFAULT_CONFIG.maxX, safeMaxXFromWorld);
    physics.config.maxY = Math.max(DEFAULT_CONFIG.maxY, safeMaxYFromWorld);

    worldYOffset = sizeInfo.wHeight / 2 - physics.config.maxY;

    const groundWidth = physics.config.maxX * 2;
    ground.scale.set(groundWidth, groundWidth, 1);
    ground.position.set(0, -physics.config.maxY + worldYOffset, 0);

  };

  return {
    three: threeInstance,
    baymaxes,
    togglePause() {
      isPaused = !isPaused;
    },
    dispose() {
      if (pointerData) {
        pointerData.dispose?.();
      }
      baymaxes.forEach((o) => threeInstance.scene.remove(o));
      threeInstance.scene.remove(ground);
      ground.geometry.dispose();
      (ground.material as any).dispose?.();
      threeInstance.dispose();
    },
  };
}

/* ----------------------------- React Wrapper ------------------------------- */

interface BallpitProps extends Partial<WConfig> {
  className?: string;
  followCursor?: boolean;
}

const Ballpit: React.FC<BallpitProps> = (props) => {
  const { className = "", ...config } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const instanceRef = useRef<CreateBallpitReturn | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    (async () => {
      const inst = await createBallpit(canvas, config);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          inst.three.resize();
        });
      });

      if (cancelled) {
        inst.dispose();
        return;
      }
      instanceRef.current = inst;
    })();

    return () => {
      cancelled = true;
      instanceRef.current?.dispose();
    };
  }, [JSON.stringify(config)]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default Ballpit;


