console.log("main.jsが読み込まれました");

// ====================
// import
// ====================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//追加
import { VRMLoaderPlugin, VRMUtils} from '@pixiv/three-vrm';
import { createVRMAnimationClip, VRMAnimationLoaderPlugin } from '@pixiv/three-vrm-animation';

// ====================
// ファイルパス定義
// ====================
const modelName = 'model.vrm';
// アニメーションファイルのパス（※拡張子が .vrma であると仮定しています）
// index.html から見た相対パスを指定してください
const animationUrl = './vrma/VRMA_04.vrma'; 

// ====================
// グローバル変数（アニメーション管理用）
// ====================
let currentMixer = null; // 【追加】アニメーションを再生するプレイヤー

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
renderer.outputColorSpace = THREE.SRGBColorSpace;  //色空間の設定
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
scene.add(new THREE.AmbientLight(0xffffff, 2.0)); // 明るめ設定
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(1, 2, 1).normalize();
scene.add(dirLight);

// ====================
// VRM 読み込み
// ====================

//glTFという3D標準形式を使ってVRMファイルを読み込んでいる
const loader = new GLTFLoader();
const clock = new THREE.Clock();

//VRMローダー
loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});

//VRMアニメーションローダー
loader.register((parser) => {
    return new VRMAnimationLoaderPlugin(parser);
  });

loader.load(
  `./vrm/${modelName}`, //モデル名
  (gltf) => {
    const vrm = gltf.userData.vrm; // ここにVRMデータが入っている

    if (!vrm) {
        console.error('VRMの読み込みに失敗しました');
        return;
    }

    VRMUtils.removeUnnecessaryJoints(gltf.scene); //最適化
    scene.add(vrm.scene);
    
    window.currentVrm = vrm;
    console.log('VRM Loaded!');

    // 【変更点2】VRM読み込み完了後、アニメーションを読み込んで再生
    loadVRMAnimation(animationUrl, vrm);
  },
  (progress) => {
    console.log(`Loading Model... ${Math.round(100.0 * (progress.loaded / progress.total))}%`);
  },
  (error) => {
    console.error(error);
  }
);

// ====================
// 【追加】VRMアニメーション読み込み関数
// ====================
async function loadVRMAnimation(url, vrm) {
  try {
    // 1. VRMAファイルを読み込む
    const gltf = await loader.loadAsync(url);
    
    // 2. VRMアニメーションデータを取り出す
    const vrmAnimations = gltf.userData.vrmAnimations;
    if (!vrmAnimations) {
      console.error('VRMAファイルにアニメーションデータが含まれていません');
      return;
    }

    // 3. VRM専用のAnimation Clipを作成
    // (VRM標準のHumanoidボーンに対応させる変換処理)
    const clip = createVRMAnimationClip(vrmAnimations[0], vrm);

    // 4. 以前のミキサーがあれば破棄（重複防止）
    if (currentMixer) {
        currentMixer.stopAllAction();
        currentMixer.uncacheRoot(vrm.scene);
    }

    // 5. 新しいミキサーを作成して再生
    currentMixer = new THREE.AnimationMixer(vrm.scene);
    const action = currentMixer.clipAction(clip);
    action.play(); // 再生開始
    
    console.log('Animation playing:', url);

  } catch (error) {
    console.error('アニメーション読み込みエラー:', error);
    console.warn('パスが正しいか確認してください:', url);
  }
}

// ====================
// アニメーションループ
// ====================
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  // VRM自体の更新（揺れもの等）
  if (window.currentVrm) {
    window.currentVrm.update(deltaTime);
  }

  // 【変更点3】アニメーションミキサーの更新
  if (currentMixer) {
    currentMixer.update(deltaTime);
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