console.log("main.jsが読み込まれました");

// ====================
// import
// ====================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// VRM読み込み用プラグイン
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

// ====================
// ファイルパス定義
// ====================
const modelName = 'model.vrm';

// ====================
// シーン設定
// ====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// ====================
// カメラ設定
// ====================
const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.1,
  20
);
camera.position.set(0, 1.4, 2.5);

// ====================
// レンダラー設定
// ====================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;  // 色空間の設定
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0; 
document.body.appendChild(renderer.domElement);

// ====================
// マウス操作（ドラッグで視点変更）
// ====================
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.3, 0);
controls.update();

// ====================
// ライト設定
// ====================
scene.add(new THREE.AmbientLight(0xffffff, 2.0)); // 環境光（全体を明るく）
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0); // 平行光源
dirLight.position.set(1, 2, 1).normalize();
scene.add(dirLight);

// ====================
// VRM 読み込み
// ====================
const loader = new GLTFLoader();
const clock = new THREE.Clock();

// VRMローダープラグインを登録
loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});

// VRMモデルを読み込む
loader.load(
  `./vrm/${modelName}`,
  (gltf) => {
    const vrm = gltf.userData.vrm;

    if (!vrm) {
      console.error('VRMの読み込みに失敗しました');
      return;
    }

    // 最適化：不要なジョイントを削除
    VRMUtils.removeUnnecessaryJoints(gltf.scene);
    
    // シーンに追加
    scene.add(vrm.scene);
    
    // コンソールからアクセスできるようにグローバル変数に保存
    window.currentVrm = vrm;
    
    console.log('VRM Loaded! Tポーズで表示中');
    console.log('ヒント: コンソールで window.currentVrm を使って操作できます');
  },
  (progress) => {
    console.log(`Loading Model... ${Math.round(100.0 * (progress.loaded / progress.total))}%`);
  },
  (error) => {
    console.error('読み込みエラー:', error);
  }
);

// ====================
// アニメーションループ
// ====================
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  // VRMの更新（揺れもの・SpringBone の計算）
  if (window.currentVrm) {
    window.currentVrm.update(deltaTime);
  }

  renderer.render(scene, camera);
}

animate();

// ====================
// リサイズ対応
// ====================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});