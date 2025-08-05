import { updateCameraAspect } from './scene.js';
import { saveSVG } from './svgGenerator.js';

// カメラ座標パラメータの要素
let cameraXInput, cameraYInput, cameraZInput;
let cameraXSlider, cameraYSlider, cameraZSlider;
let cameraXValue, cameraYValue, cameraZValue;
let frustumSizeInput, frustumSizeSlider, frustumSizeValue;
let camera, controls;
let isInputting = false; // 入力中フラグ

// UI初期化
export function initializeUI(generateSVGFunc) {
  // カメラ座標パラメータの要素を取得
  cameraXInput = document.getElementById('cameraX');
  cameraYInput = document.getElementById('cameraY');
  cameraZInput = document.getElementById('cameraZ');
  cameraXSlider = document.getElementById('cameraXSlider');
  cameraYSlider = document.getElementById('cameraYSlider');
  cameraZSlider = document.getElementById('cameraZSlider');
  cameraXValue = document.getElementById('cameraXValue');
  cameraYValue = document.getElementById('cameraYValue');
  cameraZValue = document.getElementById('cameraZValue');
  frustumSizeInput = document.getElementById('frustumSize');
  frustumSizeSlider = document.getElementById('frustumSizeSlider');
  frustumSizeValue = document.getElementById('frustumSizeValue');

  // DOM要素の存在チェック
  if (!cameraXInput || !cameraYInput || !cameraZInput || 
      !cameraXSlider || !cameraYSlider || !cameraZSlider ||
      !cameraXValue || !cameraYValue || !cameraZValue ||
      !frustumSizeInput || !frustumSizeSlider || !frustumSizeValue) {
    console.error('カメラ座標パラメータのDOM要素が見つかりません');
    return;
  }

  // Saveボタンのイベントハンドラー設定
  document.getElementById('saveBtn').onclick = () => {
    try {
      console.log('SVG生成開始...');
      const svgContent = generateSVGFunc();
      console.log('SVG生成完了、サイズ:', svgContent.length);
      saveSVG(svgContent);
      console.log('SVG保存完了');
    } catch (error) {
      console.error('SVG保存エラー:', error);
      alert('SVG保存中にエラーが発生しました: ' + error.message);
    }
  };

  // カメラ座標パラメータのイベントハンドラー設定
  setupCameraParameterHandlers();
}

// カメラ座標パラメータのハンドラー設定
function setupCameraParameterHandlers() {
  // 数値入力のイベント
  cameraXInput.addEventListener('focus', () => { isInputting = true; });
  cameraYInput.addEventListener('focus', () => { isInputting = true; });
  cameraZInput.addEventListener('focus', () => { isInputting = true; });
  frustumSizeInput.addEventListener('focus', () => { isInputting = true; });
  
  // inputイベントで即座に反映（上下ボタン用）
  cameraXInput.addEventListener('input', () => {
    console.log('X input:', cameraXInput.value);
    if (isInputting) {
      updateCameraPosition();
    }
  });
  cameraYInput.addEventListener('input', () => {
    console.log('Y input:', cameraYInput.value);
    if (isInputting) {
      updateCameraPosition();
    }
  });
  cameraZInput.addEventListener('input', () => {
    console.log('Z input:', cameraZInput.value);
    if (isInputting) {
      updateCameraPosition();
    }
  });
  frustumSizeInput.addEventListener('input', () => {
    console.log('Frustum input:', frustumSizeInput.value);
    if (isInputting) {
      updateFrustumSize();
    }
  });
  
  cameraXInput.addEventListener('blur', () => { 
    isInputting = false; 
    updateCameraPosition();
  });
  cameraYInput.addEventListener('blur', () => { 
    isInputting = false; 
    updateCameraPosition();
  });
  cameraZInput.addEventListener('blur', () => { 
    isInputting = false; 
    updateCameraPosition();
  });
  frustumSizeInput.addEventListener('blur', () => { 
    isInputting = false; 
    updateFrustumSize();
  });
  
  // Enterキーで確定
  cameraXInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      cameraXInput.blur();
    }
  });
  cameraYInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      cameraYInput.blur();
    }
  });
  cameraZInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      cameraZInput.blur();
    }
  });
  frustumSizeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      frustumSizeInput.blur();
    }
  });
  
  // スライダーのイベント
  cameraXSlider.addEventListener('input', updateCameraPositionFromSlider);
  cameraYSlider.addEventListener('input', updateCameraPositionFromSlider);
  cameraZSlider.addEventListener('input', updateCameraPositionFromSlider);
  frustumSizeSlider.addEventListener('input', updateFrustumSizeFromSlider);
}

// 数値入力からカメラ位置を更新
function updateCameraPosition() {
  if (!camera) return;
  
  const x = parseFloat(cameraXInput.value) || 0;
  const y = parseFloat(cameraYInput.value) || 0;
  const z = parseFloat(cameraZInput.value) || 0;
  
  console.log('updateCameraPosition:', { x, y, z });
  
  // スライダーと値表示を更新
  updateSliderAndValue('X', x);
  updateSliderAndValue('Y', y);
  updateSliderAndValue('Z', z);
  updateValueDisplay('X', x);
  updateValueDisplay('Y', y);
  updateValueDisplay('Z', z);
  
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0);
  
  // コントロールを更新
  if (controls) {
    controls.update();
  }
}

// スライダーからカメラ位置を更新
function updateCameraPositionFromSlider(event) {
  if (!camera) return;
  
  const axis = event.target.id.replace('camera', '').replace('Slider', '');
  const value = parseFloat(event.target.value);
  
  console.log('Slider update:', axis, value);
  
  // 数値入力と値表示を更新
  updateInputAndValue(axis, value);
  
  // カメラ位置を更新
  const x = parseFloat(cameraXInput.value) || 0;
  const y = parseFloat(cameraYInput.value) || 0;
  const z = parseFloat(cameraZInput.value) || 0;
  
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0);
  
  // コントロールを更新
  if (controls) {
    controls.update();
  }
}

// フラスタムサイズを更新
function updateFrustumSize() {
  if (!camera) return;
  
  const frustumSize = parseFloat(frustumSizeInput.value) || 12;
  
  console.log('updateFrustumSize:', frustumSize);
  
  // スライダーと値表示を更新
  updateSliderAndValue('FrustumSize', frustumSize);
  updateValueDisplay('FrustumSize', frustumSize);
  
  // カメラのフラスタムサイズを更新
  updateCameraFrustum(frustumSize);
}

// スライダーからフラスタムサイズを更新
function updateFrustumSizeFromSlider(event) {
  if (!camera) return;
  
  const value = parseFloat(event.target.value);
  
  console.log('Frustum slider update:', value);
  
  // 数値入力と値表示を更新
  updateInputAndValue('FrustumSize', value);
  
  // カメラのフラスタムサイズを更新
  updateCameraFrustum(value);
}

// カメラのフラスタムを更新
function updateCameraFrustum(frustumSize) {
  // 現在のアスペクト比を取得
  const panelElement = document.querySelector('.panel');
  const panelWidth = panelElement.clientWidth - 20;
  const panelHeight = 420;
  const aspect = panelWidth / panelHeight;
  
  console.log('updateCameraFrustum:', { frustumSize, aspect });
  
  // フラスタムサイズを直接設定
  camera.left = (-frustumSize * aspect) / 2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
}

// スライダーと値表示を更新
function updateSliderAndValue(axis, value) {
  const slider = document.getElementById(`camera${axis}Slider`);
  const valueDisplay = document.getElementById(`camera${axis}Value`);
  
  if (slider && valueDisplay) {
    slider.value = value;
    valueDisplay.textContent = value.toFixed(2);
    console.log(`updateSliderAndValue ${axis}:`, value);
  }
}

// 数値入力と値表示を更新
function updateInputAndValue(axis, value) {
  const input = document.getElementById(`camera${axis}`);
  const valueDisplay = document.getElementById(`camera${axis}Value`);
  
  if (input && valueDisplay) {
    input.value = value;
    valueDisplay.textContent = value.toFixed(2);
    console.log(`updateInputAndValue ${axis}:`, value);
  }
}

// 値表示のみを更新
function updateValueDisplay(axis, value) {
  const valueDisplay = document.getElementById(`camera${axis}Value`);
  
  if (valueDisplay) {
    valueDisplay.textContent = value.toFixed(2);
    console.log(`updateValueDisplay ${axis}:`, value);
  }
}

// カメラ座標をパラメータに反映
export function updateCameraParameters(cameraInstance, controlsInstance) {
  camera = cameraInstance;
  controls = controlsInstance;
  
  // DOM要素の存在チェック
  if (!cameraXInput || !cameraYInput || !cameraZInput) {
    console.warn('カメラ座標パラメータのDOM要素がまだ初期化されていません');
    return;
  }
  
  // 初期値を設定（小数点2桁まで）
  const x = camera.position.x;
  const y = camera.position.y;
  const z = camera.position.z;
  const frustumSize = camera.top * 2; // フラスタムサイズを計算
  
  console.log('updateCameraParameters:', { x, y, z, frustumSize });
  
  cameraXInput.value = x;
  cameraYInput.value = y;
  cameraZInput.value = z;
  frustumSizeInput.value = frustumSize;
  
  updateSliderAndValue('X', x);
  updateSliderAndValue('Y', y);
  updateSliderAndValue('Z', z);
  updateSliderAndValue('FrustumSize', frustumSize);
  updateValueDisplay('X', x);
  updateValueDisplay('Y', y);
  updateValueDisplay('Z', z);
  updateValueDisplay('FrustumSize', frustumSize);
}

// カメラ座標をパラメータに同期（OrbitControls使用時）
export function syncCameraParameters() {
  if (!camera || !cameraXInput || !cameraYInput || !cameraZInput || isInputting) return;
  
  const x = camera.position.x;
  const y = camera.position.y;
  const z = camera.position.z;
  const frustumSize = camera.top * 2;
  
  cameraXInput.value = x;
  cameraYInput.value = y;
  cameraZInput.value = z;
  frustumSizeInput.value = frustumSize;
  
  updateSliderAndValue('X', x);
  updateSliderAndValue('Y', y);
  updateSliderAndValue('Z', z);
  updateSliderAndValue('FrustumSize', frustumSize);
  updateValueDisplay('X', x);
  updateValueDisplay('Y', y);
  updateValueDisplay('Z', z);
  updateValueDisplay('FrustumSize', frustumSize);
}

// リサイズハンドラー設定
export function setupResizeHandler(camera, renderer) {
  function resize() {
    // 単一パネルのサイズを取得
    const panelElement = document.querySelector('.panel');
    const panelWidth = panelElement.clientWidth - 20; // padding分を引く
    const panelHeight = 420;
    
    // WebGLレンダラーのサイズ設定
    renderer.setSize(panelWidth, panelHeight);
    
    // カメラのアスペクト比を設定
    updateCameraAspect(camera, panelWidth, panelHeight);
  }
  
  // 初期化時に一度だけリサイズ
  resize();
  
  // ウィンドウリサイズ時のみ監視
  window.addEventListener('resize', resize);
} 