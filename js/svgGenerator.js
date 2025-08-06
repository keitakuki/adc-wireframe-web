import * as THREE from 'https://unpkg.com/three@0.160.0?module';

// SVG生成関数
export function generateSVG(scene, camera, group) {
  try {
    console.log('generateSVG呼び出し:', { scene, camera, group });
    
    // 単一パネルのサイズ計算を使用
    const panelElement = document.querySelector('.panel');
    if (!panelElement) {
      throw new Error('パネル要素が見つかりません');
    }
    
    const panelWidth = panelElement.clientWidth - 20; // padding分を引く
    const panelHeight = 420;
    
    console.log('パネルサイズ:', { panelWidth, panelHeight });
    
    // シーンからSVGを生成
    let svgContent = `<svg width="${panelWidth}" height="${panelHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svgContent += `<rect width="100%" height="100%" fill="white"/>`;
    
    // 各ボックスのエッジをSVGパスとして描画
    let lineCount = 0;
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