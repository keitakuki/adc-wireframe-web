import * as THREE from 'https://unpkg.com/three@0.160.0?module';

// 立方体ワイヤーフレーム作成
export function makeBoxEdges(size = 1) {
  const h = size / 2;
  const V = [
    new THREE.Vector3(-h, -h, -h), new THREE.Vector3( h, -h, -h),
    new THREE.Vector3(-h,  h, -h), new THREE.Vector3( h,  h, -h),
    new THREE.Vector3(-h, -h,  h), new THREE.Vector3( h, -h,  h),
    new THREE.Vector3(-h,  h,  h), new THREE.Vector3( h,  h,  h),
  ];
  const E = [[0,1],[1,3],[3,2],[2,0],[4,5],[5,7],[7,6],[6,4],[0,4],[1,5],[2,6],[3,7]];
  const g = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color: 0x000000 });
  
  for (const [a, b] of E) {
    const geom = new THREE.BufferGeometry().setFromPoints([V[a].clone(), V[b].clone()]);
    g.add(new THREE.Line(geom, mat));
  }
  return g;
}

// ワイヤーフレームグループ作成
export function createWireframeGroup() {
  const group = new THREE.Group();
  const gridSize = 100; // 100x100のグリッド
  
  // 全体の中心を計算（グリッドの中心が原点になるように）
  const centerOffset = (gridSize - 1) / 2;
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const box = makeBoxEdges(1);
      
      // 中心を原点に移動させるためのオフセット
      const offsetX = x - centerOffset;
      const offsetY = y - centerOffset;
      
      // z方向にx+yのオフセットを適用（斜めの階段状）
      const offsetZ = offsetX + offsetY;
      
      box.position.set(offsetX, offsetY, offsetZ);
      group.add(box);
    }
  }
  
  return group;
} 