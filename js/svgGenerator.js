import * as THREE from 'https://unpkg.com/three@0.160.0?module';

// 現在のパラメータを取得する関数
function getCurrentParameters() {
  const elements = {
    cameraX: document.getElementById('cameraX'),
    cameraY: document.getElementById('cameraY'),
    cameraZ: document.getElementById('cameraZ'),
    frustumSize: document.getElementById('frustumSize'),
    boxSize: document.getElementById('boxSize'),
    rotationX: document.getElementById('rotationX'),
    rotationY: document.getElementById('rotationY'),
    rotationZ: document.getElementById('rotationZ'),
    noiseSizeEnabled: document.getElementById('noiseSizeEnabled'),
    noiseSizeFreq: document.getElementById('noiseSizeFreq'),
    noiseSizeAmp: document.getElementById('noiseSizeAmp'),
    noiseSizeOffset: document.getElementById('noiseSizeOffset'),
    noiseRotationEnabled: document.getElementById('noiseRotationEnabled'),
    noiseRotationFreq: document.getElementById('noiseRotationFreq'),
    noiseRotationAmp: document.getElementById('noiseRotationAmp'),
    noiseRotationOffset: document.getElementById('noiseRotationOffset')
  };
  
  return {
    camera: {
      x: parseFloat(elements.cameraX?.value) || 10,
      y: parseFloat(elements.cameraY?.value) || 10,
      z: parseFloat(elements.cameraZ?.value) || -10,
      frustumSize: parseFloat(elements.frustumSize?.value) || 12
    },
    geometry: {
      boxSize: parseFloat(elements.boxSize?.value) || 1,
      rotationX: parseFloat(elements.rotationX?.value) || 0,
      rotationY: parseFloat(elements.rotationY?.value) || 0,
      rotationZ: parseFloat(elements.rotationZ?.value) || 0
    },
    noise: {
      size: {
        enabled: elements.noiseSizeEnabled?.checked || false,
        freq: parseFloat(elements.noiseSizeFreq?.value) || 1,
        amp: parseFloat(elements.noiseSizeAmp?.value) || 0.1,
        offset: parseFloat(elements.noiseSizeOffset?.value) || 0
      },
      rotation: {
        enabled: elements.noiseRotationEnabled?.checked || false,
        freq: parseFloat(elements.noiseRotationFreq?.value) || 1,
        amp: parseFloat(elements.noiseRotationAmp?.value) || 0.1,
        offset: parseFloat(elements.noiseRotationOffset?.value) || 0
      }
    },
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
}

// SVG生成関数
export function generateSVG(scene, camera, group) {
  try {
    console.log('generateSVG呼び出し:', { scene, camera, group });
    
    // ビューアーのサイズ計算を使用
    const glElement = document.getElementById('gl');
    if (!glElement) {
      throw new Error('GL要素が見つかりません');
    }
    
    const panelWidth = glElement.clientWidth;
    const panelHeight = glElement.clientHeight;
    
    console.log('パネルサイズ:', { panelWidth, panelHeight });
    
    // パラメータを取得
    const params = getCurrentParameters();
    
    // シーンからSVGを生成
    let svgContent = `<svg width="${panelWidth}" height="${panelHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svgContent += `<rect width="100%" height="100%" fill="white"/>`;
    
    // 各ボックスのエッジをSVGパスとして描画
    let lineCount = 0;
    let visibleBoxCount = 0;
    group.children.forEach((box, boxIndex) => {
      // ボックスの境界ボックスを計算
      const boxBoundingBox = new THREE.Box3();
      box.updateMatrixWorld(true);
      boxBoundingBox.setFromObject(box);
      
      // カメラの視錐台内にあるかチェック
      const frustum = new THREE.Frustum();
      const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(matrix);
      
      if (frustum.intersectsBox(boxBoundingBox)) {
        visibleBoxCount++;
        
        // ボックスの各エッジを処理
        box.children.forEach((line, lineIndex) => {
          const geometry = line.geometry;
          const positions = geometry.attributes.position;
          
          if (positions && positions.count >= 2) {
            const start = new THREE.Vector3();
            const end = new THREE.Vector3();
            
            start.fromBufferAttribute(positions, 0);
            end.fromBufferAttribute(positions, 1);
            
            // ワールド座標に変換
            start.applyMatrix4(box.matrixWorld);
            end.applyMatrix4(box.matrixWorld);
            
            // プロジェクション座標に変換
            const startProj = start.clone().project(camera);
            const endProj = end.clone().project(camera);
            
            // ビューポート内にあるかチェック（-1 から 1 の範囲）
            if (startProj.x >= -1 && startProj.x <= 1 && startProj.y >= -1 && startProj.y <= 1 &&
                endProj.x >= -1 && endProj.x <= 1 && endProj.y >= -1 && endProj.y <= 1) {
              
              // SVG座標に変換
              const x1 = (startProj.x + 1) * panelWidth / 2;
              const y1 = (1 - startProj.y) * panelHeight / 2;
              const x2 = (endProj.x + 1) * panelWidth / 2;
              const y2 = (1 - endProj.y) * panelHeight / 2;
              
              svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="1"/>`;
              lineCount++;
            }
          }
        });
      }
    });
    
    // パラメータを文字オブジェクトとして追加
    const textX = 10;
    const textY = panelHeight - 10;
    const fontSize = 12;
    const lineHeight = 16;
    
    // 背景の白い四角形
    svgContent += `<rect x="${textX - 5}" y="${textY - 120}" width="300" height="110" fill="white" stroke="black" stroke-width="0.5" opacity="0.9"/>`;
    
    // パラメータテキスト
    const paramTexts = [
      `Camera: X=${params.camera.x}, Y=${params.camera.y}, Z=${params.camera.z}`,
      `View: ${params.camera.frustumSize} | Box: ${params.geometry.boxSize}`,
      `Rotation: X=${params.geometry.rotationX}°, Y=${params.geometry.rotationY}°, Z=${params.geometry.rotationZ}°`,
      `Size Noise: ${params.noise.size.enabled ? 'ON' : 'OFF'} (F:${params.noise.size.freq}, A:${params.noise.size.amp})`,
      `Rotation Noise: ${params.noise.rotation.enabled ? 'ON' : 'OFF'} (F:${params.noise.rotation.freq}, A:${params.noise.rotation.amp})`,
      `Generated: ${new Date(params.timestamp).toLocaleString()}`
    ];
    
    paramTexts.forEach((text, index) => {
      const y = textY - 100 + (index * lineHeight);
      svgContent += `<text x="${textX}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="black">${text}</text>`;
    });
    
    svgContent += '</svg>';
    
    console.log('SVG生成完了、ライン数:', lineCount);
    return svgContent;
  } catch (error) {
    console.error('SVG生成エラー:', error);
    throw error;
  }
}

// SVGファイル保存関数
export function saveSVG(svgContent, filename = 'wireframe.svg') {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
} 