import * as THREE from 'https://unpkg.com/three@0.160.0?module';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js?module';
import { createScene, createCamera, createRenderer, createControls } from './scene.js';
import { createWireframeGroup } from './geometry.js';
import { generateSVG } from './svgGenerator.js';
import { initializeUI, setupResizeHandler, updateCameraParameters, syncCameraParameters } from './ui.js';

// グローバル変数
let scene, camera, renderer, controls, group;
let glWrap;
let lastCameraPosition = new THREE.Vector3();
let lastFrustumSize = 0;

// 初期化関数
function init() {
  // DOM要素の取得
  glWrap = document.getElementById('gl');

  // シーン、カメラ、レンダラーの作成
  scene = createScene();
  camera = createCamera();
  renderer = createRenderer();
  controls = createControls(camera, renderer.domElement);

  // DOMにレンダラーを追加
  glWrap.appendChild(renderer.domElement);

  // ワイヤーフレームグループの作成
  group = createWireframeGroup();
  scene.add(group);

  // リサイズハンドラーの設定
  setupResizeHandler(camera, renderer);

  // カメラ座標パラメータの初期化
  updateCameraParameters(camera, controls);

  // アニメーションループ開始
  tick();
}

// アニメーションループ
function tick() {
  controls.update();
  renderer.render(scene, camera);
  
  // カメラ座標が変更された時のみパラメータを更新
  const currentPosition = camera.position.clone();
  const currentFrustumSize = camera.top * 2;
  
  if (!lastCameraPosition.equals(currentPosition) || Math.abs(lastFrustumSize - currentFrustumSize) > 0.01) {
    syncCameraParameters();
    lastCameraPosition.copy(currentPosition);
    lastFrustumSize = currentFrustumSize;
  }
  
  // SVGプレビューは削除（パフォーマンス向上のため）
  
  requestAnimationFrame(tick);
}

// アプリケーション開始
init();

// UI初期化（グローバル変数が設定された後に実行）
setTimeout(() => {
  initializeUI(() => generateSVG(scene, camera, group));
  // カメラ座標パラメータの初期化（UI初期化後に実行）
  updateCameraParameters(camera, controls);
}, 100); 