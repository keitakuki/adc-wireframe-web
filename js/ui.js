import { updateCameraAspect } from './scene.js';
import { saveSVG } from './svgGenerator.js';

// UI初期化
export function initializeUI(generateSVGFunc) {
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