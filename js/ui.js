import { updateCameraAspect } from './scene.js';
import { saveSVG } from './svgGenerator.js';

// グローバル変数
let camera, controls;
let elements = {};
let updateGeometryFunc;

// UI初期化
export function initializeUI(generateSVGFunc, updateGeometryCallback) {
  updateGeometryFunc = updateGeometryCallback;
  
  // DOM要素を取得
  elements = {
    cameraX: document.getElementById('cameraX'),
    cameraY: document.getElementById('cameraY'),
    cameraZ: document.getElementById('cameraZ'),
    cameraXSlider: document.getElementById('cameraXSlider'),
    cameraYSlider: document.getElementById('cameraYSlider'),
    cameraZSlider: document.getElementById('cameraZSlider'),
    cameraXValue: document.getElementById('cameraXValue'),
    cameraYValue: document.getElementById('cameraYValue'),
    cameraZValue: document.getElementById('cameraZValue'),
    frustumSize: document.getElementById('frustumSize'),
    frustumSizeSlider: document.getElementById('frustumSizeSlider'),
    frustumSizeValue: document.getElementById('frustumSizeValue'),
    // ジオメトリパラメータ
    boxSize: document.getElementById('boxSize'),
    boxSizeSlider: document.getElementById('boxSizeSlider'),
    boxSizeValue: document.getElementById('boxSizeValue'),
    rotationX: document.getElementById('rotationX'),
    rotationXSlider: document.getElementById('rotationXSlider'),
    rotationXValue: document.getElementById('rotationXValue'),
    rotationY: document.getElementById('rotationY'),
    rotationYSlider: document.getElementById('rotationYSlider'),
    rotationYValue: document.getElementById('rotationYValue'),
    rotationZ: document.getElementById('rotationZ'),
    rotationZSlider: document.getElementById('rotationZSlider'),
    rotationZValue: document.getElementById('rotationZValue')
  };

  // DOM要素の存在チェック
  if (Object.values(elements).some(el => !el)) {
    console.error('カメラ座標パラメータのDOM要素が見つかりません');
    return;
  }

  // Saveボタンのイベントハンドラー設定
  document.getElementById('saveBtn').onclick = () => {
    try {
      console.log('SVG生成開始...');
      const svgContent = generateSVGFunc();
      console.log('SVG生成完了、サイズ:', svgContent.length);
      
      // ファイル名を生成
      const x = parseFloat(elements.cameraX.value) || 0;
      const y = parseFloat(elements.cameraY.value) || 0;
      const z = parseFloat(elements.cameraZ.value) || 0;
      const w = parseFloat(elements.frustumSize.value) || 12;
      
      const filename = `svg_x${x.toFixed(1)}y${y.toFixed(1)}z${z.toFixed(1)}w${w.toFixed(1)}.svg`;
      
      saveSVG(svgContent, filename);
      console.log('SVG保存完了');
    } catch (error) {
      console.error('SVG保存エラー:', error);
      alert('SVG保存中にエラーが発生しました: ' + error.message);
    }
  };

  // イベントハンドラー設定
  setupEventHandlers();
  setupGeometryEventHandlers();
}

// イベントハンドラー設定
function setupEventHandlers() {
  // 数値入力のイベント
  const inputs = ['cameraX', 'cameraY', 'cameraZ', 'frustumSize'];
  inputs.forEach(inputId => {
    const input = elements[inputId];
    const slider = elements[inputId + 'Slider'];
    const valueDisplay = elements[inputId + 'Value'];
    
    // 数値入力のイベント
    input.addEventListener('input', () => {
      const value = parseFloat(input.value) || 0;
      updateSliderAndDisplay(inputId, value);
      updateCamera();
    });
    
    // スライダーのイベント
    slider.addEventListener('input', () => {
      const value = parseFloat(slider.value) || 0;
      updateInputAndDisplay(inputId, value);
      updateCamera();
    });
    
    // Enterキーで確定
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      }
    });
  });
}

// ジオメトリイベントハンドラー設定
function setupGeometryEventHandlers() {
  // ジオメトリパラメータのイベント
  const geometryInputs = ['boxSize', 'rotationX', 'rotationY', 'rotationZ'];
  geometryInputs.forEach(inputId => {
    const input = elements[inputId];
    const slider = elements[inputId + 'Slider'];
    const valueDisplay = elements[inputId + 'Value'];
    
    // 数値入力のイベント
    input.addEventListener('input', () => {
      const value = parseFloat(input.value) || 0;
      updateSliderAndDisplay(inputId, value);
      updateGeometry();
    });
    
    // スライダーのイベント
    slider.addEventListener('input', () => {
      const value = parseFloat(slider.value) || 0;
      updateInputAndDisplay(inputId, value);
      updateGeometry();
    });
    
    // Enterキーで確定
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      }
    });
  });
  

}

// スライダーと値表示を更新
function updateSliderAndDisplay(inputId, value) {
  const slider = elements[inputId + 'Slider'];
  const valueDisplay = elements[inputId + 'Value'];
  
  if (slider && valueDisplay) {
    slider.value = value;
    valueDisplay.textContent = value.toFixed(2);
  }
}

// 数値入力と値表示を更新
function updateInputAndDisplay(inputId, value) {
  const input = elements[inputId];
  const valueDisplay = elements[inputId + 'Value'];
  
  if (input && valueDisplay) {
    input.value = value;
    valueDisplay.textContent = value.toFixed(2);
  }
}

// カメラ位置を更新
function updateCamera() {
  if (!camera) return;
  
  const x = parseFloat(elements.cameraX.value) || 0;
  const y = parseFloat(elements.cameraY.value) || 0;
  const z = parseFloat(elements.cameraZ.value) || 0;
  const frustumSize = parseFloat(elements.frustumSize.value) || 12;
  
  // カメラ位置を更新
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0);
  
  // フラスタムサイズを更新
  updateCameraFrustum(frustumSize);
  
  // コントロールを更新
  if (controls) {
    controls.update();
  }
}

// ジオメトリを更新
function updateGeometry() {
  if (!updateGeometryFunc) return;
  
  // パラメータを取得
  const params = {
    boxSize: parseFloat(elements.boxSize.value) || 1,
    rotationX: parseFloat(elements.rotationX.value) || 0,
    rotationY: parseFloat(elements.rotationY.value) || 0,
    rotationZ: parseFloat(elements.rotationZ.value) || 0
  };
  
  // グローバルパラメータを更新
  if (window.geometryParams) {
    Object.assign(window.geometryParams, params);
  }
  
  // ジオメトリ更新関数を呼び出し
  updateGeometryFunc();
}

// カメラのフラスタムを更新
function updateCameraFrustum(frustumSize) {
  // 現在のアスペクト比を取得
  const panelElement = document.querySelector('.panel');
  const panelWidth = panelElement.clientWidth - 20;
  const panelHeight = 420;
  const aspect = panelWidth / panelHeight;
  
  // フラスタムサイズを直接設定
  camera.left = (-frustumSize * aspect) / 2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
}

// カメラ座標をパラメータに反映
export function updateCameraParameters(cameraInstance, controlsInstance) {
  camera = cameraInstance;
  controls = controlsInstance;
  
  // DOM要素の存在チェック
  if (!elements.cameraX) {
    console.warn('カメラ座標パラメータのDOM要素がまだ初期化されていません');
    return;
  }
  
  // 初期値を設定（小数第二位で丸める）
  const x = Math.round(camera.position.x * 100) / 100;
  const y = Math.round(camera.position.y * 100) / 100;
  const z = Math.round(camera.position.z * 100) / 100;
  const frustumSize = Math.round(camera.top * 2 * 100) / 100;
  
  // すべての要素を更新
  updateAllElements(x, y, z, frustumSize);
}

// カメラ座標をパラメータに同期（OrbitControls使用時）
export function syncCameraParameters() {
  if (!camera || !elements.cameraX) return;
  
  const x = Math.round(camera.position.x * 100) / 100;
  const y = Math.round(camera.position.y * 100) / 100;
  const z = Math.round(camera.position.z * 100) / 100;
  const frustumSize = Math.round(camera.top * 2 * 100) / 100;
  
  // すべての要素を更新
  updateAllElements(x, y, z, frustumSize);
}

// すべての要素を更新
function updateAllElements(x, y, z, frustumSize) {
  // 数値入力を更新
  elements.cameraX.value = x;
  elements.cameraY.value = y;
  elements.cameraZ.value = z;
  elements.frustumSize.value = frustumSize;
  
  // スライダーを更新
  elements.cameraXSlider.value = x;
  elements.cameraYSlider.value = y;
  elements.cameraZSlider.value = z;
  elements.frustumSizeSlider.value = frustumSize;
  
  // 値表示を更新
  elements.cameraXValue.textContent = x.toFixed(2);
  elements.cameraYValue.textContent = y.toFixed(2);
  elements.cameraZValue.textContent = z.toFixed(2);
  elements.frustumSizeValue.textContent = frustumSize.toFixed(2);
}

// リサイズハンドラー設定
export function setupResizeHandler(camera, renderer) {
  function resize() {
    // 単一パネルのサイズを取得
    const panelElement = document.querySelector('.panel');
    const panelWidth = panelElement.clientWidth - 20;
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