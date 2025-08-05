import * as THREE from 'https://unpkg.com/three@0.160.0?module';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js?module';

// シーン作成
export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  return scene;
}

// カメラ作成（正投影）
export function createCamera() {
  const frustumSize = 12;
  const aspect = 1; // 初期値（リサイズ時に更新）
  const camera = new THREE.OrthographicCamera(
    (-frustumSize * aspect) / 2,
    ( frustumSize * aspect) / 2,
     frustumSize / 2,
    -frustumSize / 2,
    -100, 1000
  );
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);
  return camera;
}

// レンダラー作成
export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  return renderer;
}

// コントロール作成
export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  
  // 慣性を無効化
  controls.enableDamping = false;
  controls.dampingFactor = 0;
  
  // その他の設定
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableRotate = true;
  
  return controls;
}

// カメラのアスペクト比を更新
export function updateCameraAspect(camera, width, height) {
  const frustumSize = 12;
  const aspect = width / height;
  
  camera.left = (-frustumSize * aspect) / 2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
} 