import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { FBXLoader } from './vendor/loaders/FBXLoader.js';

const canvas = document.getElementById('studioTour');
const stage = document.querySelector('[data-tour-stage]');
const tourPanel = document.querySelector('.tour-panel');
const loading = document.querySelector('[data-tour-loading]');
const bar = document.querySelector('[data-load-bar]');
const viewButtons = [...document.querySelectorAll('[data-view]')];
const autoButton = document.querySelector('[data-auto]');
const ledVideoToggle = document.querySelector('[data-led-video-toggle]');
const ledVideoReset = document.querySelector('[data-led-video-reset]');
const ledVideoInputs = {
  scale: document.querySelector('[data-led-video-scale]'),
  x: document.querySelector('[data-led-video-x]'),
  y: document.querySelector('[data-led-video-y]')
};
const ledVideoValues = {
  scale: document.querySelector('[data-led-video-value="scale"]'),
  x: document.querySelector('[data-led-video-value="x"]'),
  y: document.querySelector('[data-led-video-value="y"]')
};
const referenceButtons = [...document.querySelectorAll('[data-reference-target]')];
const referenceInputs = {
  x: document.querySelector('[data-reference-x]'),
  z: document.querySelector('[data-reference-z]'),
  rotation: document.querySelector('[data-reference-rotation]')
};
const referenceValues = {
  x: document.querySelector('[data-reference-value="x"]'),
  z: document.querySelector('[data-reference-value="z"]'),
  rotation: document.querySelector('[data-reference-value="rotation"]')
};

function showTourFallback(message) {
  stage?.classList.add('is-webgl-unavailable');
  if (!loading) return;
  loading.classList.add('is-error');
  const title = loading.querySelector('strong');
  const copy = loading.querySelector('span');
  if (title) title.textContent = '3D 미리보기를 사용할 수 없습니다.';
  if (copy) copy.textContent = message;
}

function createRenderer() {
  try {
    const context = canvas.getContext('webgl2', { antialias: true, powerPreference: 'high-performance' })
      || canvas.getContext('webgl', { antialias: true, powerPreference: 'high-performance' });
    if (!context) return null;
    return new THREE.WebGLRenderer({
      canvas,
      context,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (_error) {
    return null;
  }
}

const renderer = createRenderer();
if (!renderer) {
  if (bar) bar.style.setProperty('--load-progress', '100%');
  showTourFallback('현재 브라우저 또는 원격 캡처 환경에서 WebGL을 사용할 수 없습니다. 실제 브라우저에서 다시 확인하세요.');
} else {
const MAX_DPR = 1.6;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.88;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181b1c);
scene.fog = new THREE.Fog(0x181b1c, 72, 170);
scene.environment = makeReflectionEnvironment();

const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 420);
camera.position.set(42, 26, 52);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.target.set(0, 4, 0);
controls.minDistance = 2.6;
controls.maxDistance = 112;
controls.minPolarAngle = Math.PI * 0.06;
controls.maxPolarAngle = Math.PI * 0.68;
controls.rotateSpeed = 0.46;
controls.zoomSpeed = 0.82;
controls.panSpeed = 0.72;
controls.zoomToCursor = true;
controls.screenSpacePanning = true;

const pointerState = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  active: false
};

canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const nx = (event.clientX - rect.left) / rect.width;
  const ny = (event.clientY - rect.top) / rect.height;
  pointerState.targetX = (nx - 0.5) * 2;
  pointerState.targetY = (ny - 0.5) * 2;
  pointerState.active = true;
  if (stage) {
    stage.style.setProperty('--tour-glow-x', `${Math.round(nx * 100)}%`);
    stage.style.setProperty('--tour-glow-y', `${Math.round(ny * 100)}%`);
  }
}, { passive: true });

canvas.addEventListener('pointerleave', () => {
  pointerState.targetX = 0;
  pointerState.targetY = 0;
  pointerState.active = false;
}, { passive: true });

canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
}, { passive: false });

if (tourPanel) {
  tourPanel.addEventListener('wheel', (event) => {
    event.stopPropagation();
  }, { passive: true });
  tourPanel.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
  });
  tourPanel.addEventListener('touchmove', (event) => {
    event.stopPropagation();
  }, { passive: true });
}

const setProgress = (value) => {
  if (bar) bar.style.setProperty('--load-progress', `${Math.round(value * 100)}%`);
};
setProgress(0.18);

const STUDIO = { w: 34.5, l: 63.9, h: 16 };
const LED = {
  h: 8,
  flat: 20,
  curved: 36.5,
  side: 3.5
};
LED.total = LED.flat + LED.curved + LED.side;
LED.radius = LED.curved / Math.PI;
LED.arcCenterX = 0;
LED.arcCenterZ = -(STUDIO.l / 2 - LED.radius);

const CEILING = {
  w: 21,
  d: 15,
  y: 8.6,
  tile: 0.5,
  x: LED.arcCenterX,
  z: LED.arcCenterZ
};
const VEHICLE_DIMENSIONS = {
  model: 'Mercedes-Benz GLE SUV',
  length: 4.94,
  width: 1.95,
  height: 1.8,
  source: 'MBUSA 2026 GLE 450 4MATIC SUV'
};

const studioGroup = new THREE.Group();
const ledGroup = new THREE.Group();
scene.add(studioGroup, ledGroup);
let mainLedPath = [];
let ledVideoUniforms = null;
const referenceObjects = {
  vehicle: null,
  person: null
};
const REFERENCE_DEFAULTS = {
  vehicle: { x: -3.2, z: LED.arcCenterZ + 6.7, rotation: -8 },
  person: { x: 4.1, z: LED.arcCenterZ + 10.8, rotation: 12 }
};
const REFERENCE_LIMITS = {
  x: { min: -15, max: 15 },
  z: { min: -28, max: 22 },
  rotation: { min: -180, max: 180 }
};
const referenceState = {
  vehicle: { ...REFERENCE_DEFAULTS.vehicle },
  person: { ...REFERENCE_DEFAULTS.person }
};
let selectedReference = 'vehicle';
const ledVideoTransform = {
  baseRepeat: new THREE.Vector2(1, 1),
  baseOffset: new THREE.Vector2(0, 0),
  offset: new THREE.Vector2(0, 0),
  scale: 1,
  shouldPlay: true,
  video: null
};

function syncLedVideoUniforms() {
  if (!ledVideoUniforms) return;
  ledVideoUniforms.uLedBaseRepeat.value.copy(ledVideoTransform.baseRepeat);
  ledVideoUniforms.uLedBaseOffset.value.copy(ledVideoTransform.baseOffset);
  ledVideoUniforms.uLedVideoOffset.value.copy(ledVideoTransform.offset);
  ledVideoUniforms.uLedVideoScale.value = ledVideoTransform.scale;
}

function applyLedVideoControls() {
  const scale = Number.parseFloat(ledVideoInputs.scale?.value ?? '1');
  const x = Number.parseFloat(ledVideoInputs.x?.value ?? '0');
  const y = Number.parseFloat(ledVideoInputs.y?.value ?? '0');
  ledVideoTransform.scale = THREE.MathUtils.clamp(Number.isFinite(scale) ? scale : 1, 0.55, 1.8);
  ledVideoTransform.offset.set(
    THREE.MathUtils.clamp(Number.isFinite(x) ? x : 0, -0.35, 0.35),
    THREE.MathUtils.clamp(Number.isFinite(y) ? y : 0, -0.28, 0.28)
  );
  syncLedVideoUniforms();
  if (ledVideoValues.scale) ledVideoValues.scale.textContent = `${Math.round(ledVideoTransform.scale * 100)}%`;
  if (ledVideoValues.x) ledVideoValues.x.textContent = `${ledVideoTransform.offset.x >= 0 ? '+' : ''}${Math.round(ledVideoTransform.offset.x * 100)}`;
  if (ledVideoValues.y) ledVideoValues.y.textContent = `${ledVideoTransform.offset.y >= 0 ? '+' : ''}${Math.round(ledVideoTransform.offset.y * 100)}`;
  window.__studioVLedWallTransform = {
    scale: ledVideoTransform.scale,
    offsetX: ledVideoTransform.offset.x,
    offsetY: ledVideoTransform.offset.y,
    baseRepeatX: ledVideoTransform.baseRepeat.x,
    baseRepeatY: ledVideoTransform.baseRepeat.y
  };
}

function setLedVideoPlaying(shouldPlay) {
  ledVideoTransform.shouldPlay = shouldPlay;
  const video = ledVideoTransform.video;
  if (video) {
    if (shouldPlay) video.play().catch(() => {});
    else video.pause();
  }
  if (ledVideoToggle) {
    ledVideoToggle.textContent = shouldPlay ? 'Stop' : 'Play';
    ledVideoToggle.classList.toggle('is-on', shouldPlay);
    ledVideoToggle.setAttribute('aria-pressed', shouldPlay ? 'true' : 'false');
  }
}

function formatMeters(value) {
  return `${value.toFixed(1)}m`;
}

function applyReferenceTransform(key = selectedReference) {
  const object = referenceObjects[key];
  const state = referenceState[key];
  if (!object || !state) return;
  object.position.x = state.x;
  object.position.z = state.z;
  object.rotation.y = THREE.MathUtils.degToRad(state.rotation);
  window.__studioVReferenceTransform = {
    selected: key,
    vehicle: { ...referenceState.vehicle },
    person: { ...referenceState.person }
  };
}

function syncReferenceControls() {
  const state = referenceState[selectedReference];
  if (!state) return;
  if (referenceInputs.x) referenceInputs.x.value = String(state.x);
  if (referenceInputs.z) referenceInputs.z.value = String(state.z);
  if (referenceInputs.rotation) referenceInputs.rotation.value = String(Math.round(state.rotation));
  if (referenceValues.x) referenceValues.x.textContent = formatMeters(state.x);
  if (referenceValues.z) referenceValues.z.textContent = formatMeters(state.z);
  if (referenceValues.rotation) referenceValues.rotation.textContent = `${Math.round(state.rotation)}°`;
  referenceButtons.forEach((button) => {
    const isSelected = button.dataset.referenceTarget === selectedReference;
    button.classList.toggle('is-active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
  applyReferenceTransform(selectedReference);
}

function readReferenceControls() {
  const state = referenceState[selectedReference];
  if (!state) return;
  const x = Number.parseFloat(referenceInputs.x?.value ?? String(state.x));
  const z = Number.parseFloat(referenceInputs.z?.value ?? String(state.z));
  const rotation = Number.parseFloat(referenceInputs.rotation?.value ?? String(state.rotation));
  state.x = THREE.MathUtils.clamp(Number.isFinite(x) ? x : state.x, REFERENCE_LIMITS.x.min, REFERENCE_LIMITS.x.max);
  state.z = THREE.MathUtils.clamp(Number.isFinite(z) ? z : state.z, REFERENCE_LIMITS.z.min, REFERENCE_LIMITS.z.max);
  state.rotation = THREE.MathUtils.clamp(Number.isFinite(rotation) ? rotation : state.rotation, REFERENCE_LIMITS.rotation.min, REFERENCE_LIMITS.rotation.max);
  syncReferenceControls();
}

function setReferenceTarget(key) {
  if (!referenceState[key]) return;
  selectedReference = key;
  syncReferenceControls();
}

function makeGridTexture(size, cells, lineColor, baseColor, alpha) {
  const gridCanvas = document.createElement('canvas');
  gridCanvas.width = size;
  gridCanvas.height = size;
  const ctx = gridCanvas.getContext('2d');
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = lineColor.replace('ALPHA', alpha);
  ctx.lineWidth = 1;
  const step = size / cells;
  for (let i = 0; i <= cells; i += 1) {
    const p = Math.round(i * step) + 0.5;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(gridCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeFloorTexture(size) {
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = size;
  floorCanvas.height = size;
  const ctx = floorCanvas.getContext('2d');
  ctx.fillStyle = '#383c39';
  ctx.fillRect(0, 0, size, size);

  const softWash = ctx.createLinearGradient(0, 0, size, size);
  softWash.addColorStop(0, 'rgba(255,255,255,0.045)');
  softWash.addColorStop(0.55, 'rgba(255,255,255,0.015)');
  softWash.addColorStop(1, 'rgba(0,0,0,0.055)');
  ctx.fillStyle = softWash;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(floorCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeReflectionEnvironment() {
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 512;
  envCanvas.height = 256;
  const ctx = envCanvas.getContext('2d');
  const base = ctx.createLinearGradient(0, 0, 0, envCanvas.height);
  base.addColorStop(0, '#273236');
  base.addColorStop(0.32, '#111719');
  base.addColorStop(0.52, '#f0f3ef');
  base.addColorStop(0.68, '#131918');
  base.addColorStop(1, '#303532');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, envCanvas.width, envCanvas.height);

  const ledBand = ctx.createLinearGradient(0, 0, envCanvas.width, 0);
  ledBand.addColorStop(0, 'rgba(115,160,170,0.15)');
  ledBand.addColorStop(0.42, 'rgba(235,244,244,0.58)');
  ledBand.addColorStop(0.62, 'rgba(152,205,214,0.42)');
  ledBand.addColorStop(1, 'rgba(18,24,26,0.18)');
  ctx.fillStyle = ledBand;
  ctx.fillRect(0, 114, envCanvas.width, 18);

  const texture = new THREE.CanvasTexture(envCanvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeLEDMaterial(texture, intensity) {
  if (texture.isVideoTexture) {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      color: 0xffffff,
      side: THREE.DoubleSide,
      toneMapped: true
    });
    const grade = {
      brightness: 0.92,
      contrast: 1.72,
      gamma: 1.18,
      saturation: 1.62,
      seamCenter: 0.5,
      seamWidth: 0.007,
      seamSample: 0.014,
      seamWideSample: 0.026,
      seamBlend: 0.42
    };
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uLedBrightness = { value: grade.brightness };
      shader.uniforms.uLedContrast = { value: grade.contrast };
      shader.uniforms.uLedGamma = { value: grade.gamma };
      shader.uniforms.uLedSaturation = { value: grade.saturation };
      shader.uniforms.uLedSeamCenter = { value: grade.seamCenter };
      shader.uniforms.uLedSeamWidth = { value: grade.seamWidth };
      shader.uniforms.uLedSeamSample = { value: grade.seamSample };
      shader.uniforms.uLedSeamWideSample = { value: grade.seamWideSample };
      shader.uniforms.uLedSeamBlend = { value: grade.seamBlend };
      shader.uniforms.uLedBaseRepeat = { value: ledVideoTransform.baseRepeat.clone() };
      shader.uniforms.uLedBaseOffset = { value: ledVideoTransform.baseOffset.clone() };
      shader.uniforms.uLedVideoOffset = { value: ledVideoTransform.offset.clone() };
      shader.uniforms.uLedVideoScale = { value: ledVideoTransform.scale };
      shader.vertexShader = shader.vertexShader.replace(
        'void main() {',
        `
        varying vec2 vLedRawUv;

        void main() {
        `
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <uv_vertex>',
        `
        #include <uv_vertex>
        vLedRawUv = uv;
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        'void main() {',
        `
        varying vec2 vLedRawUv;
        uniform float uLedBrightness;
        uniform float uLedContrast;
        uniform float uLedGamma;
        uniform float uLedSaturation;
        uniform float uLedSeamCenter;
        uniform float uLedSeamWidth;
        uniform float uLedSeamSample;
        uniform float uLedSeamWideSample;
        uniform float uLedSeamBlend;
        uniform vec2 uLedBaseRepeat;
        uniform vec2 uLedBaseOffset;
        uniform vec2 uLedVideoOffset;
        uniform float uLedVideoScale;

        void main() {
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #ifdef USE_MAP
          vec2 scaledWallUv = (vLedRawUv - vec2(0.5) - uLedVideoOffset) / max(uLedVideoScale, 0.01) + vec2(0.5);
          vec2 videoUv = scaledWallUv * uLedBaseRepeat + uLedBaseOffset;
          float inside = step(0.0, scaledWallUv.x) * step(0.0, scaledWallUv.y) * step(scaledWallUv.x, 1.0) * step(scaledWallUv.y, 1.0);
          vec4 sampledDiffuseColor = texture2D( map, clamp(videoUv, vec2(0.0), vec2(1.0)) );
          float seamDistance = abs(videoUv.x - uLedSeamCenter);
          float seamMask = (1.0 - smoothstep(uLedSeamWidth, uLedSeamWidth * 3.8, seamDistance)) * inside;
          vec2 seamOffset = vec2(uLedSeamSample, 0.0);
          vec2 seamWideOffset = vec2(uLedSeamWideSample, 0.0);
          vec3 seamAverage = (
            texture2D( map, clamp(videoUv - seamOffset, vec2(0.0), vec2(1.0)) ).rgb +
            texture2D( map, clamp(videoUv + seamOffset, vec2(0.0), vec2(1.0)) ).rgb +
            texture2D( map, clamp(videoUv - seamWideOffset, vec2(0.0), vec2(1.0)) ).rgb +
            texture2D( map, clamp(videoUv + seamWideOffset, vec2(0.0), vec2(1.0)) ).rgb
          ) * 0.25;
          sampledDiffuseColor.rgb = mix(sampledDiffuseColor.rgb, seamAverage, seamMask * uLedSeamBlend);
          sampledDiffuseColor.rgb = pow( max( sampledDiffuseColor.rgb, vec3( 0.0 ) ), vec3( uLedGamma ) );
          sampledDiffuseColor.rgb = ( sampledDiffuseColor.rgb - vec3( 0.5 ) ) * uLedContrast + vec3( 0.5 );
          float ledLuma = dot( sampledDiffuseColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
          sampledDiffuseColor.rgb = mix( vec3( ledLuma ), sampledDiffuseColor.rgb, uLedSaturation );
          sampledDiffuseColor.rgb *= uLedBrightness;
          sampledDiffuseColor.rgb *= inside;
          sampledDiffuseColor.rgb = clamp( sampledDiffuseColor.rgb, 0.0, 1.0 );
          diffuseColor *= sampledDiffuseColor;
        #endif
        `
      );
      ledVideoUniforms = shader.uniforms;
      syncLedVideoUniforms();
    };
    window.__studioVLedWallGrade = grade;
    return material;
  }

  return new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    color: texture.isVideoTexture ? 0xffffff : 0x071116,
    emissive: new THREE.Color(texture.isVideoTexture ? 0xffffff : 0x65aebe),
    emissiveIntensity: intensity,
    metalness: 0.05,
    roughness: 0.7,
    side: THREE.DoubleSide
  });
}

function makeLedVideoTexture() {
  const source = './assets/video/260121-test01-videostitchstudio-web.mp4';
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.crossOrigin = 'anonymous';
  window.__studioVLedWallVideo = video;
  ledVideoTransform.video = video;

  const playVideo = () => {
    if (!ledVideoTransform.shouldPlay) return;
    video.play().catch(() => {});
  };
  const loadSource = () => {
    video.src = source;
    window.__studioVLedWallVideoFile = source;
    video.load();
  };

  video.addEventListener('canplay', playVideo);
  video.addEventListener('play', () => setLedVideoPlaying(true));
  video.addEventListener('pause', () => {
    if (!document.hidden && !ledVideoTransform.shouldPlay) setLedVideoPlaying(false);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (ledVideoTransform.shouldPlay) playVideo();
  });
  canvas.addEventListener('pointerdown', playVideo, { once: true });

  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  texture.offset.set(0, 0);
  fitLedVideoTexture(texture, { width: 3000, height: 1000 });
  video.addEventListener('loadedmetadata', () => {
    fitLedVideoTexture(texture, { width: video.videoWidth || 3000, height: video.videoHeight || 1000 });
  });

  loadSource();
  return texture;
}

function fitLedVideoTexture(texture, size) {
  const wallAspect = LED.total / LED.h;
  const videoAspect = size.width / Math.max(size.height, 1);
  const fillScale = 1.05;
  let repeatX = 1;
  let repeatY = videoAspect / wallAspect;

  if (repeatY > 1) {
    repeatY = 1;
    repeatX = wallAspect / videoAspect;
  }

  repeatX = THREE.MathUtils.clamp(repeatX / fillScale, 0.18, 1);
  repeatY = THREE.MathUtils.clamp(repeatY / fillScale, 0.18, 1);
  ledVideoTransform.baseRepeat.set(repeatX, repeatY);
  ledVideoTransform.baseOffset.set((1 - repeatX) * 0.5, (1 - repeatY) * 0.5);
  texture.repeat.set(1, 1);
  texture.offset.set(0, 0);
  syncLedVideoUniforms();
  window.__studioVLedWallFit = {
    wallAspect,
    videoAspect,
    repeatX,
    repeatY,
    offsetX: ledVideoTransform.baseOffset.x,
    offsetY: ledVideoTransform.baseOffset.y,
    mode: 'aspect-preserving scale'
  };
}

function initLedVideoControls() {
  if (!ledVideoInputs.scale || !ledVideoInputs.x || !ledVideoInputs.y) return;
  [ledVideoInputs.scale, ledVideoInputs.x, ledVideoInputs.y].forEach((input) => {
    input.addEventListener('input', applyLedVideoControls);
  });
  ledVideoToggle?.addEventListener('click', () => {
    setLedVideoPlaying(!ledVideoTransform.shouldPlay);
  });
  ledVideoReset?.addEventListener('click', () => {
    ledVideoInputs.scale.value = '1';
    ledVideoInputs.x.value = '0';
    ledVideoInputs.y.value = '0';
    applyLedVideoControls();
  });
  applyLedVideoControls();
  setLedVideoPlaying(true);
}

function initReferenceControls() {
  if (!referenceInputs.x || !referenceInputs.z || !referenceInputs.rotation) return;
  referenceInputs.x.min = String(REFERENCE_LIMITS.x.min);
  referenceInputs.x.max = String(REFERENCE_LIMITS.x.max);
  referenceInputs.z.min = String(REFERENCE_LIMITS.z.min);
  referenceInputs.z.max = String(REFERENCE_LIMITS.z.max);
  referenceInputs.rotation.min = String(REFERENCE_LIMITS.rotation.min);
  referenceInputs.rotation.max = String(REFERENCE_LIMITS.rotation.max);
  [referenceInputs.x, referenceInputs.z, referenceInputs.rotation].forEach((input) => {
    input.addEventListener('input', readReferenceControls);
  });
  referenceButtons.forEach((button) => {
    button.addEventListener('click', () => setReferenceTarget(button.dataset.referenceTarget));
  });
  syncReferenceControls();
}

const ledTex = makeGridTexture(512, 32, 'rgba(130,195,210,ALPHA)', '#05090c', 0.16);
ledTex.repeat.set(18, 3.5);
const ledVideoTex = makeLedVideoTexture();
initLedVideoControls();
initReferenceControls();
const ceilingTex = makeGridTexture(512, 24, 'rgba(145,205,215,ALPHA)', '#060a0c', 0.14);
ceilingTex.repeat.set(8, 5);
const floorTex = makeFloorTexture(512);
floorTex.repeat.set(1, 1);

const materials = {
  floor: new THREE.MeshStandardMaterial({
    map: floorTex,
    color: 0xffffff,
    roughness: 0.82,
    metalness: 0.04
  }),
  wall: new THREE.MeshStandardMaterial({
    color: 0x101719,
    emissive: new THREE.Color(0x182328),
    emissiveIntensity: 0.18,
    roughness: 0.95,
    transparent: true,
    opacity: 0.34,
    side: THREE.DoubleSide
  }),
  led: makeLEDMaterial(ledVideoTex, 1.18),
  ceilingTile: makeLEDMaterial(ceilingTex, 0.64),
  ledDark: new THREE.MeshStandardMaterial({ color: 0x0f181b, emissive: 0x17282d, emissiveIntensity: 0.85, roughness: 0.36 }),
  rail: new THREE.LineBasicMaterial({ color: 0xd8d0c2, transparent: true, opacity: 0.68 }),
  person: new THREE.MeshStandardMaterial({ color: 0xd6d1c4, roughness: 0.7 }),
  personSkin: new THREE.MeshStandardMaterial({ color: 0xc7a585, roughness: 0.64, metalness: 0.02 }),
  personHair: new THREE.MeshStandardMaterial({ color: 0x171311, roughness: 0.72, metalness: 0.02 }),
  personJacket: new THREE.MeshStandardMaterial({ color: 0xd8d2c6, roughness: 0.66, metalness: 0.03 }),
  personShirt: new THREE.MeshStandardMaterial({ color: 0x24292a, roughness: 0.7, metalness: 0.02 }),
  personPants: new THREE.MeshStandardMaterial({ color: 0x17191b, roughness: 0.78, metalness: 0.02 }),
  personShoes: new THREE.MeshStandardMaterial({ color: 0x090a0b, roughness: 0.74, metalness: 0.08 }),
  vehicle: new THREE.MeshStandardMaterial({ color: 0xced7d8, roughness: 0.58, metalness: 0.16 }),
  vehicleBody: new THREE.MeshPhysicalMaterial({
    color: 0xb8bdb9,
    emissive: 0x0b0c0c,
    emissiveIntensity: 0.02,
    roughness: 0.16,
    metalness: 0.56,
    clearcoat: 1.0,
    clearcoatRoughness: 0.10,
    envMapIntensity: 2.05,
    side: THREE.DoubleSide
  }),
  vehicleGlass: new THREE.MeshPhysicalMaterial({
    color: 0x12181a,
    emissive: 0x05090a,
    emissiveIntensity: 0.10,
    roughness: 0.06,
    metalness: 0.04,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
    transmission: 0.04,
    transparent: true,
    opacity: 0.62,
    envMapIntensity: 1.85,
    side: THREE.DoubleSide
  }),
  vehicleTrim: new THREE.MeshStandardMaterial({ color: 0xaeb6b8, roughness: 0.18, metalness: 0.72, envMapIntensity: 1.55, side: THREE.DoubleSide }),
  vehicleLamp: new THREE.MeshStandardMaterial({ color: 0xf6f0df, emissive: 0xf6efe2, emissiveIntensity: 0.34, roughness: 0.18, side: THREE.DoubleSide }),
  tire: new THREE.MeshStandardMaterial({ color: 0x090a0a, roughness: 0.88, metalness: 0.02, side: THREE.DoubleSide }),
  camera: new THREE.MeshStandardMaterial({ color: 0x1b1d1f, roughness: 0.5, metalness: 0.2 }),
  ceiling: new THREE.MeshStandardMaterial({ color: 0x28383c, emissive: 0x192a2f, emissiveIntensity: 0.85, roughness: 0.44 }),
  matteBlack: new THREE.MeshStandardMaterial({ color: 0x111315, roughness: 0.88, metalness: 0.08 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x8d9594, roughness: 0.46, metalness: 0.36 }),
  monitor: new THREE.MeshStandardMaterial({ color: 0x0a0c0e, emissive: 0x8fb5bd, emissiveIntensity: 0.9, roughness: 0.3 }),
  warmPanel: new THREE.MeshStandardMaterial({ color: 0xfff3da, emissive: 0xffd99a, emissiveIntensity: 1.35, roughness: 0.42 }),
  lensGlass: new THREE.MeshStandardMaterial({ color: 0x050607, emissive: 0x0d2930, emissiveIntensity: 0.35, roughness: 0.18, metalness: 0.22 })
};
materials.ceilingTile.color.setHex(0x0a2027);
materials.ceilingTile.transparent = true;
materials.ceilingTile.opacity = 0.88;

let interactiveWash = null;

function addLights() {
  scene.add(new THREE.HemisphereLight(0xf8f2e7, 0x33383a, 2.75));

  const key = new THREE.DirectionalLight(0xffffff, 2.45);
  key.position.set(30, 48, 24);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xc4d6dc, 1.55);
  fill.position.set(-36, 20, 28);
  scene.add(fill);

  const ledGlow = new THREE.PointLight(0x9fbdc2, 2.4, 90, 1.8);
  ledGlow.position.set(0, 6, -12);
  scene.add(ledGlow);

  const floorWash = new THREE.PointLight(0xf4eadc, 1.55, 78, 1.7);
  floorWash.position.set(0, 7.5, LED.arcCenterZ + 14);
  scene.add(floorWash);

  const ledKickTarget = new THREE.Object3D();
  ledKickTarget.position.set(3.8, 1.2, LED.arcCenterZ + 5.4);
  scene.add(ledKickTarget);

  const ledKick = new THREE.SpotLight(0xc9e6e9, 3.4, 56, Math.PI * 0.22, 0.62, 1.25);
  ledKick.position.set(LED.arcCenterX, 4.2, LED.arcCenterZ - 1.6);
  ledKick.target = ledKickTarget;
  scene.add(ledKick);

  interactiveWash = new THREE.PointLight(0xd7e9eb, 0.0, 30, 2.0);
  interactiveWash.position.set(0, 3.2, LED.arcCenterZ + 11);
  scene.add(interactiveWash);
}

function addRoom() {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(STUDIO.w, STUDIO.l), materials.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  studioGroup.add(floor);

  function addWall(width, height, x, z, rotY = 0) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), materials.wall.clone());
    wall.position.set(x, height / 2, z);
    wall.rotation.y = rotY;
    studioGroup.add(wall);
  }

  addWall(STUDIO.w, STUDIO.h, 0, -STUDIO.l / 2, 0);
  addWall(STUDIO.w, STUDIO.h, 0, STUDIO.l / 2, Math.PI);
  addWall(STUDIO.l, STUDIO.h, -STUDIO.w / 2, 0, Math.PI / 2);
  addWall(STUDIO.l, STUDIO.h, STUDIO.w / 2, 0, -Math.PI / 2);

}

function buildDrawingMainPath() {
  const pts = [];
  const cx = LED.arcCenterX;
  const cz = LED.arcCenterZ;
  const r = LED.radius;

  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40;
    pts.push(new THREE.Vector3(cx - r, 0, cz + LED.flat * (1 - t)));
  }

  for (let i = 1; i <= 72; i += 1) {
    const angle = Math.PI + Math.PI * (i / 72);
    pts.push(new THREE.Vector3(
      cx + Math.cos(angle) * r,
      0,
      cz + Math.sin(angle) * r
    ));
  }

  for (let i = 1; i <= 8; i += 1) {
    const t = i / 8;
    pts.push(new THREE.Vector3(cx + r, 0, cz + LED.side * t));
  }

  return pts;
}

function buildRibbonGeometry(path, height) {
  const positions = [];
  const uvs = [];
  const indices = [];
  const cumulative = [0];
  for (let i = 1; i < path.length; i += 1) {
    cumulative[i] = cumulative[i - 1] + path[i].distanceTo(path[i - 1]);
  }
  const total = cumulative[cumulative.length - 1];
  for (let i = 0; i < path.length; i += 1) {
    const point = path[i];
    const u = cumulative[i] / total;
    positions.push(point.x, 0, point.z, point.x, height, point.z);
    uvs.push(u, 0, u, 1);
  }
  for (let i = 0; i < path.length - 1; i += 1) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b, b, c, d);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.userData.pathLength = total;
  return geometry;
}

function ceilingCutAt(localZ) {
  const depth = CEILING.d / 2 - localZ;
  const profile = [
    [0, 0], [7.5, 0], [9.5, 1.0], [11.0, 2.0], [12.0, 3.0],
    [12.5, 3.5], [14.0, 4.0], [14.5, 4.5], [15.0, 5.0]
  ];
  for (let i = 1; i < profile.length; i += 1) {
    const [z0, c0] = profile[i - 1];
    const [z1, c1] = profile[i];
    if (depth <= z1) {
      const t = (depth - z0) / (z1 - z0);
      return THREE.MathUtils.lerp(c0, c1, THREE.MathUtils.clamp(t, 0, 1));
    }
  }
  return 5;
}

function buildCeilingTiles() {
  const tile = CEILING.tile;
  const cols = Math.round(CEILING.w / tile);
  const rows = Math.round(CEILING.d / tile);
  const tileGeometry = new THREE.BoxGeometry(tile * 0.88, 0.1, tile * 0.88);
  const mesh = new THREE.InstancedMesh(tileGeometry, materials.ceilingTile, cols * rows);
  const dummy = new THREE.Object3D();
  let count = 0;

  for (let row = 0; row < rows; row += 1) {
    const localZ = -CEILING.d / 2 + tile * (row + 0.5);
    const cut = ceilingCutAt(localZ);
    for (let col = 0; col < cols; col += 1) {
      const localX = -CEILING.w / 2 + tile * (col + 0.5);
      const xFromLeft = localX + CEILING.w / 2;
      const inPartGap = (xFromLeft > 5 && xFromLeft < 5.5) || (xFromLeft > 15.5 && xFromLeft < 16);
      if (inPartGap || xFromLeft < cut || xFromLeft > CEILING.w - cut) continue;
      dummy.position.set(CEILING.x + localX, CEILING.y, CEILING.z + localZ);
      dummy.updateMatrix();
      mesh.setMatrixAt(count, dummy.matrix);
      count += 1;
    }
  }
  mesh.count = count;
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function buildCeilingOutline() {
  const points = [];
  const steps = Math.round(CEILING.d / CEILING.tile);
  for (let i = 0; i <= steps; i += 1) {
    const z = -CEILING.d / 2 + (CEILING.d * i) / steps;
    points.push(new THREE.Vector3(CEILING.x - CEILING.w / 2 + ceilingCutAt(z), CEILING.y + 0.08, CEILING.z + z));
  }
  for (let i = steps; i >= 0; i -= 1) {
    const z = -CEILING.d / 2 + (CEILING.d * i) / steps;
    points.push(new THREE.Vector3(CEILING.x + CEILING.w / 2 - ceilingCutAt(z), CEILING.y + 0.08, CEILING.z + z));
  }
  points.push(points[0].clone());
  return points;
}

function addLedSystem() {
  const jPath = buildDrawingMainPath();
  mainLedPath = jPath;
  const jWallGeometry = buildRibbonGeometry(jPath, LED.h);
  const jWall = new THREE.Mesh(jWallGeometry, materials.led);
  ledGroup.add(jWall);

  ledGroup.add(buildCeilingTiles());
  ledGroup.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(buildCeilingOutline()),
    new THREE.LineBasicMaterial({ color: 0xd9e6ea, transparent: true, opacity: 0.28 })
  ));

}

function makeLabel(text, width = 3.2, height = 0.46) {
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 512;
  labelCanvas.height = 112;
  const ctx = labelCanvas.getContext('2d');
  ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.fillStyle = 'rgba(248, 244, 235, 0.92)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.88)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 3;
  let fontSize = 30;
  do {
    ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
    fontSize -= 2;
  } while (ctx.measureText(text).width > 388 && fontSize > 16);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 56);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(208, 154, 90, 0.72)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(196, 82);
  ctx.lineTo(316, 82);
  ctx.stroke();
  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width, height, 1);
  return sprite;
}

function addMeasurements() {
  const ledLabel = makeLabel('Main LED Wall 60m x 8m', 3.4, 0.42);
  ledLabel.position.set(LED.arcCenterX, LED.h + 0.9, LED.arcCenterZ + 2.4);
  scene.add(ledLabel);
  const ceilingLabel = makeLabel('Ceiling LED 21m x 15m', 3.4, 0.42);
  ceilingLabel.position.set(CEILING.x, CEILING.y + 1.1, CEILING.z - 1.2);
  scene.add(ceilingLabel);
}

function makePerson({ x, z, rotation = 0, scale = 1, color = 0xd6d1c4 }) {
  const group = new THREE.Group();
  group.name = 'person-scale-reference';
  const jacket = materials.personJacket.clone();
  jacket.color.setHex(color);
  const skin = materials.personSkin;
  const hair = materials.personHair;
  const shirt = materials.personShirt;
  const pants = materials.personPants;
  const shoes = materials.personShoes;

  const hips = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.16, 6, 16), pants);
  hips.position.y = 0.83;
  hips.scale.set(1.05, 0.72, 0.76);
  group.add(hips);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.48, 7, 18), jacket);
  torso.position.y = 1.18;
  torso.scale.set(0.94, 1.0, 0.68);
  group.add(torso);

  const shirtPanel = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.46, 0.018), shirt);
  shirtPanel.position.set(0, 1.2, 0.14);
  group.add(shirtPanel);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.12, 14), skin);
  neck.position.y = 1.52;
  group.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 18), skin);
  head.position.y = 1.66;
  head.scale.set(0.9, 1.08, 0.96);
  group.add(head);

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.145, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hair);
  hairCap.position.y = 1.735;
  hairCap.scale.set(0.94, 0.74, 0.98);
  group.add(hairCap);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.055, 10), skin);
  nose.position.set(0, 1.66, 0.13);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);

  [-0.045, 0.045].forEach((side) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), hair);
    eye.position.set(side, 1.685, 0.128);
    group.add(eye);
  });

  const legGeo = new THREE.CapsuleGeometry(0.055, 0.64, 6, 12);
  const armGeo = new THREE.CapsuleGeometry(0.045, 0.52, 6, 12);
  [-0.08, 0.08].forEach((side) => {
    const leg = new THREE.Mesh(legGeo, pants);
    leg.position.set(side, 0.42, 0);
    leg.rotation.z = side * 0.18;
    group.add(leg);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.28), shoes);
    shoe.position.set(side * 1.05, 0.075, 0.045);
    group.add(shoe);

    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 8), jacket);
    shoulder.position.set(side * 2.72, 1.38, 0);
    shoulder.scale.set(1.0, 0.76, 0.82);
    group.add(shoulder);

    const arm = new THREE.Mesh(armGeo, jacket);
    arm.position.set(side * 3.25, 1.12, 0.01);
    arm.rotation.z = -side * 0.24;
    group.add(arm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 8), skin);
    hand.position.set(side * 3.62, 0.81, 0.02);
    group.add(hand);
  });

  const label = makeLabel('Person 1.75m H', 2.5, 0.36);
  label.position.set(0, 2.04, 0);
  group.add(label);

  group.position.set(x, 0.02, z);
  group.rotation.y = rotation;
  group.scale.setScalar(scale);
  return group;
}

function makeFallbackVehicle() {
  const group = new THREE.Group();
  group.name = 'vehicle-scale-reference';

  const body = new THREE.Mesh(new THREE.BoxGeometry(VEHICLE_DIMENSIONS.length, 0.72, VEHICLE_DIMENSIONS.width), materials.vehicleBody);
  body.position.y = 0.72;
  group.add(body);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.72, VEHICLE_DIMENSIONS.width * 0.86), materials.vehicleGlass);
  cabin.position.set(-0.32, 1.23, 0);
  group.add(cabin);

  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.36, VEHICLE_DIMENSIONS.width * 0.94), materials.vehicleTrim);
  hood.position.set(1.68, 1.03, 0);
  group.add(hood);

  const lampGeo = new THREE.BoxGeometry(0.08, 0.18, 0.42);
  [-0.48, 0.48].forEach((side) => {
    const lamp = new THREE.Mesh(lampGeo, materials.vehicleLamp);
    lamp.position.set(VEHICLE_DIMENSIONS.length / 2 + 0.02, 0.82, side * VEHICLE_DIMENSIONS.width * 0.78);
    group.add(lamp);
  });

  const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.32, 24);
  [-1.56, 1.56].forEach((x) => {
    [-0.98, 0.98].forEach((z) => {
      const wheel = new THREE.Mesh(wheelGeo, materials.tire);
      wheel.position.set(x, 0.36, z);
      wheel.rotation.x = Math.PI / 2;
      group.add(wheel);
    });
  });

  const label = makeLabel('GLE 4.94m L / 1.95m W', 3.9, 0.38);
  label.position.set(0, VEHICLE_DIMENSIONS.height + 0.35, 0);
  group.add(label);

  group.position.set(REFERENCE_DEFAULTS.vehicle.x, 0.02, REFERENCE_DEFAULTS.vehicle.z);
  group.rotation.y = THREE.MathUtils.degToRad(REFERENCE_DEFAULTS.vehicle.rotation);
  group.userData.dimensions = { ...VEHICLE_DIMENSIONS, sourceAsset: 'fallback' };
  window.__studioVVehicleDimensions = group.userData.dimensions;
  return group;
}

function normalizeVehicleModel(object) {
  const wrapper = new THREE.Group();
  wrapper.name = 'vehicle-scale-reference';
  const modelBody = new THREE.Group();
  modelBody.name = 'vehicle-body-scaled-to-gle-spec';
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const lengthAxis = size.x >= size.z ? 'x' : 'z';
  const scale = new THREE.Vector3(
    lengthAxis === 'x' ? VEHICLE_DIMENSIONS.length / Math.max(size.x, 0.001) : VEHICLE_DIMENSIONS.width / Math.max(size.x, 0.001),
    VEHICLE_DIMENSIONS.height / Math.max(size.y, 0.001),
    lengthAxis === 'z' ? VEHICLE_DIMENSIONS.length / Math.max(size.z, 0.001) : VEHICLE_DIMENSIONS.width / Math.max(size.z, 0.001)
  );
  object.position.set(-center.x, -box.min.y, -center.z);
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = false;
    child.receiveShadow = true;
    if (child.material) {
      const materialsToTune = Array.isArray(child.material) ? child.material : [child.material];
      materialsToTune.forEach((material) => {
        material.envMapIntensity = material.envMapIntensity ?? 1.4;
        material.side = THREE.DoubleSide;
      });
    }
  });
  modelBody.add(object);
  modelBody.scale.copy(scale);
  wrapper.add(modelBody);
  const label = makeLabel('GLE 4.94m L / 1.95m W', 3.9, 0.38);
  label.position.set(0, VEHICLE_DIMENSIONS.height + 0.35, 0);
  wrapper.add(label);
  wrapper.position.set(REFERENCE_DEFAULTS.vehicle.x, 0.02, REFERENCE_DEFAULTS.vehicle.z);
  wrapper.rotation.y = THREE.MathUtils.degToRad(REFERENCE_DEFAULTS.vehicle.rotation);
  wrapper.userData.dimensions = {
    ...VEHICLE_DIMENSIONS,
    lengthAxis,
    sourceAsset: './assets/models/mercedes-gls-580.fbx',
    originalModelBoxMeters: { x: size.x, y: size.y, z: size.z },
    appliedScale: { x: scale.x, y: scale.y, z: scale.z }
  };
  window.__studioVVehicleDimensions = wrapper.userData.dimensions;
  return wrapper;
}

function addVehicleReference() {
  const fallback = makeFallbackVehicle();
  referenceObjects.vehicle = fallback;
  applyReferenceTransform('vehicle');
  scene.add(fallback);

  const loader = new FBXLoader();
  loader.load(
    './assets/models/mercedes-gls-580.fbx',
    (object) => {
      const model = normalizeVehicleModel(object);
      scene.remove(fallback);
      referenceObjects.vehicle = model;
      applyReferenceTransform('vehicle');
      scene.add(model);
    },
    undefined,
    () => {
      fallback.visible = true;
    }
  );
}

function addScaleReferences() {
  addVehicleReference();
  const person = makePerson({
    x: REFERENCE_DEFAULTS.person.x,
    z: REFERENCE_DEFAULTS.person.z,
    rotation: THREE.MathUtils.degToRad(REFERENCE_DEFAULTS.person.rotation),
    scale: 1,
    color: 0xd8d0c2
  });
  referenceObjects.person = person;
  applyReferenceTransform('person');
  scene.add(person);
}

function buildScene() {
  addLights();
  setProgress(0.32);
  addRoom();
  setProgress(0.48);
  addLedSystem();
  setProgress(0.62);
  addMeasurements();
  addScaleReferences();
  setProgress(0.82);
}

const views = {
  overview: {
    camera: new THREE.Vector3(LED.arcCenterX, 18, LED.arcCenterZ + 38),
    target: new THREE.Vector3(LED.arcCenterX, 5, LED.arcCenterZ)
  },
  wall: {
    camera: new THREE.Vector3(LED.arcCenterX, 6.4, LED.arcCenterZ + 9.6),
    target: new THREE.Vector3(LED.arcCenterX, 4.2, LED.arcCenterZ - 6.4)
  },
  scale: {
    camera: new THREE.Vector3(12.5, 6.8, LED.arcCenterZ + 12.8),
    target: new THREE.Vector3(1.5, 2.1, LED.arcCenterZ + 3.8)
  },
  top: {
    camera: new THREE.Vector3(0, 86, 0.01),
    target: new THREE.Vector3(0, 0, 0)
  }
};

const targetCamera = views.overview.camera.clone();
const targetLook = views.overview.target.clone();
let transitionFrames = 0;

function setView(name) {
  const view = views[name];
  if (!view) return;
  targetCamera.copy(view.camera);
  targetLook.copy(view.target);
  transitionFrames = 90;
  viewButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.view === name));
}

viewButtons.forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

controls.addEventListener('start', () => {
  transitionFrames = 0;
  if (controls.autoRotate) {
    controls.autoRotate = false;
    autoButton?.classList.remove('is-on');
  }
});

if (autoButton) {
  autoButton.addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate;
    controls.autoRotateSpeed = 0.45;
    autoButton.classList.toggle('is-on', controls.autoRotate);
  });
}

function resize() {
  const width = stage.clientWidth || window.innerWidth;
  const height = stage.clientHeight || window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize, { passive: true });
if ('ResizeObserver' in window) {
  new ResizeObserver(resize).observe(stage);
}

let firstFrame = true;
function animate() {
  requestAnimationFrame(animate);
  pointerState.x += (pointerState.targetX - pointerState.x) * 0.08;
  pointerState.y += (pointerState.targetY - pointerState.y) * 0.08;
  if (interactiveWash) {
    interactiveWash.intensity += ((pointerState.active ? 0.88 : 0.18) - interactiveWash.intensity) * 0.06;
    interactiveWash.position.x = pointerState.x * 8;
    interactiveWash.position.y = 3.8 - pointerState.y * 1.4;
    interactiveWash.position.z = LED.arcCenterZ + 11 + pointerState.y * 4;
  }
  ceilingTex.offset.y += (pointerState.y * 0.001 - ceilingTex.offset.y) * 0.035;
  renderer.toneMappingExposure += ((pointerState.active ? 0.9 : 0.86) - renderer.toneMappingExposure) * 0.035;
  if (transitionFrames > 0) {
    camera.position.lerp(targetCamera, 0.065);
    controls.target.lerp(targetLook, 0.065);
    transitionFrames -= 1;
  }
  controls.update();
  renderer.render(scene, camera);
  if (firstFrame) {
    firstFrame = false;
    window.__studioVTourReady = true;
    setProgress(1);
    window.setTimeout(() => loading?.classList.add('is-done'), 250);
  }
}

buildScene();
resize();
setView('overview');
animate();
}
