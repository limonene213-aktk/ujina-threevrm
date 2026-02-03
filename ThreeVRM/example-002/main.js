console.log("main.jsが読み込まれました");

// ====================
// import
// ====================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// GUIライブラリのインポート (Three.jsのaddonsに含まれている場合)
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// VRM関連
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

// ★アニメーション関連の import は削除しました

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
// ガイドに基づき、r152以降はoutputColorSpace等の明示的な指定は必須ではありませんが、
// 既存の設定を維持しても問題ありません。
renderer.outputColorSpace = THREE.SRGBColorSpace; 
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0; 
document.body.appendChild(renderer.domElement);

// ====================
// マウス操作
// ====================
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.3, 0);
controls.update();

// ====================
// ライト設定
// ====================
scene.add(new THREE.AmbientLight(0xffffff, 2.0));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(1, 2, 1).normalize();
scene.add(dirLight);

// ====================
// VRM 読み込み
// ====================
const loader = new GLTFLoader();
const clock = new THREE.Clock();

loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});

loader.load(
  `./vrm/${modelName}`,
  (gltf) => {
    const vrm = gltf.userData.vrm;

    if (!vrm) {
        console.error('VRMの読み込みに失敗しました');
        return;
    }

    // 不要なジョイントの削除
    VRMUtils.removeUnnecessaryJoints(gltf.scene);

    // 【追加】VRM0.0の場合に向きを補正（Migration Guide推奨）
    VRMUtils.rotateVRM0(vrm);

    scene.add(vrm.scene);
    window.currentVrm = vrm;
    console.log('VRM Loaded!');

    // 【変更】GUIのセットアップを実行
    initGUI(vrm);
  },
  (progress) => {
    console.log(`Loading Model... ${Math.round(100.0 * (progress.loaded / progress.total))}%`);
  },
  (error) => {
    console.error(error);
  }
);

// ====================
// 【新規】GUIセットアップ関数
// ====================
function initGUI(vrm) {
  const gui = new GUI({ title: 'VRM Controller' });

  // --- 1. Expressions (表情) の設定 ---
  // Migration Guide: BlendShapeProxy は ExpressionManager に名称変更されました
  const expressionsFolder = gui.addFolder('Expressions (表情)');
  
  // 操作したい表情のリスト
  const expressionNames = [
    'neutral', 'happy', 'angry', 'sad', 'relaxed', // 感情
    'blink', 'blinkLeft', 'blinkRight',            // まばたき
    'aa', 'ih', 'ou', 'ee', 'oh'                   // 口の形
  ];

  expressionNames.forEach((name) => {
    // スライダー用のオブジェクト
    const params = { weight: 0.0 };
    
    // VRM1.0では expressionManager.setValue('name', value) を使用します
    // プリセットが存在しない場合のエラーを防ぐためチェックしても良いですが、
    // setValueは存在しないキーでもクラッシュはしません。
    expressionsFolder.add(params, 'weight', 0.0, 1.0)
      .name(name)
      .onChange((v) => {
        if (vrm.expressionManager) {
          vrm.expressionManager.setValue(name, v);
        }
      });
  });

  // --- 2. Humanoid (ボーン) の設定 ---
  const boneFolder = gui.addFolder('Bones (関節)');

  // ボーン操作用のヘルパー関数
  const setupBoneControl = (boneName, label) => {
    // Migration Guide: 正規化されたボーンノードを取得します。
    // これにより、初期ポーズの回転値が扱いやすい状態 (0,0,0) になります。
    const node = vrm.humanoid.getNormalizedBoneNode(boneName);

    if (node) {
      const folder = boneFolder.addFolder(label);
      
      // X, Y, Z軸の回転スライダー
      // rotation.x/y/z を直接操作します（NormalizedBoneへの操作はupdate時にRawBoneへ反映されます）
      folder.add(node.rotation, 'x', -Math.PI, Math.PI).name('Rotate X');
      folder.add(node.rotation, 'y', -Math.PI, Math.PI).name('Rotate Y');
      folder.add(node.rotation, 'z', -Math.PI, Math.PI).name('Rotate Z');
    }
  };

  // 主要なボーンのスライダーを追加
  setupBoneControl('head', 'Head (頭)');
  setupBoneControl('neck', 'Neck (首)');
  setupBoneControl('chest', 'Chest (胸)');
  setupBoneControl('leftUpperArm', 'L Upper Arm (左上腕)');
  setupBoneControl('leftLowerArm', 'L Lower Arm (左前腕)');
  setupBoneControl('rightUpperArm', 'R Upper Arm (右上腕)');
  setupBoneControl('rightLowerArm', 'R Lower Arm (右前腕)');
}

// ====================
// アニメーションループ
// ====================
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  // VRM自体の更新
  if (window.currentVrm) {
    // update内で Expression や NormalizedBone の変更が実際のモデルに反映されます
    window.currentVrm.update(deltaTime);
  }

  // アニメーションミキサーの更新処理は削除しました

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