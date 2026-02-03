# Three-VRM 初心者向け実装ガイド：スライダー操作編

このガイドでは、VRMモデル（3Dアバター）を読み込み、アニメーションファイルを使わずに、**画面上のスライダー（GUI）で表情や関節を直接動かす**ためのコードについて解説します。

## 1. 全体の仕組み

このプログラムは大きく分けて3つのステップで動作しています。

1. **準備**: Three.jsの基本セット（シーン、カメラ、ライト）を用意する。
2. **読み込み**: VRMモデルをロードし、ThreeVRM 1.0のルールに従って初期化する。
3. **操作**: GUIライブラリ（`lil-gui`）を使って、表情やボーン（骨）の数値を変化させる。

---

## 2. 重要な変更点 (Migration Guide 対応)

以前のバージョン（v0.x）と最新のバージョン（v1.0）では、書き方が大きく変わっています。今回のコードでは以下の点を特に意識しています。

### A. 読み込み方法の変更

VRMの読み込みは、`GLTFLoader` の「プラグイン」として機能するようになりました。

```javascript
// 旧: VRM.from(...) や VRMImporter は削除されました
// 新: loader.register でプラグインとして登録します
loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});

```

### B. 表情の操作 (ExpressionManager)

昔は `BlendShapeProxy` と呼ばれていた機能は、**`ExpressionManager`** という名前に変わりました。
スライダーで数値をいじる際は、このマネージャーを通して「喜び（happy）」や「あ（aa）」などの値をセットします。

### C. ボーンの操作 (Normalized Bones)

これがVRM 1.0の少し難しいけれど便利な点です。
モデルによって「腕の初期角度」などがバラバラだとプログラムで扱いづらいため、**「正規化されたボーン（Normalized Bone）」** という機能を使います。
これを使うと、どのモデルでも「回転(0, 0, 0) ＝ まっすぐな状態」として統一して扱えるようになります。

---

## 3. コードのポイント解説

ここでは、新しく追加した機能を中心に解説します。

### ① GUIの準備 (`initGUI` 関数)

画面右上に表示されるコントローラーを作る部分です。`lil-gui` というライブラリを使用しています。

#### 表情（Expressions）の登録

```javascript
// 操作したい表情の名前リスト
const expressionNames = ['neutral', 'happy', 'blink', 'aa', ...];

expressionNames.forEach((name) => {
  // ...スライダーの設定...
  .onChange((v) => {
    // スライダーの値(v)が変わったら実行される場所
    if (vrm.expressionManager) {
      // ★ここが重要！表情の名前と強さ(0.0~1.0)を指定
      vrm.expressionManager.setValue(name, v);
    }
  });
});

```

* **ポイント**: `setValue('happy', 1.0)` のように文字列で表情を指定できるようになりました。

#### ボーン（関節）の登録

```javascript
const setupBoneControl = (boneName, label) => {
  // ★重要: 「正規化されたボーン」を取得します
  const node = vrm.humanoid.getNormalizedBoneNode(boneName);

  if (node) {
    // 回転(rotation)の X, Y, Z 軸をスライダーに紐付けます
    folder.add(node.rotation, 'x', -Math.PI, Math.PI);
    // ...
  }
};

```

* **ポイント**: `getNormalizedBoneNode` を使うことで、モデルごとの個体差を無視して直感的に動かすことができます。
* **補足**: `Math.PI` は 180度 を意味します。スライダーは -180度 〜 +180度 の範囲で動くよう設定しています。

### ② モデルの向き補正 (`VRMUtils.rotateVRM0`)

```javascript
loader.load(..., (gltf) => {
  const vrm = gltf.userData.vrm;
  
  // ★VRM0.0モデルへの対応
  VRMUtils.rotateVRM0(vrm); 
  
  // ...
});

```

* **なぜこれが必要？**: VRM 1.0では、モデルの正面が「Z軸のプラス方向」に変更されました。
* 古いVRM 0.0のモデルを読み込むと後ろを向いてしまうことがあるため、この便利な関数を使って自動的に向きを修正しています。

### ③ 毎フレームの更新 (`animate` 関数)

```javascript
function animate() {
  requestAnimationFrame(animate);
  
  const deltaTime = clock.getDelta();

  if (window.currentVrm) {
    // ★ここで変更を適用！
    window.currentVrm.update(deltaTime);
  }
  
  renderer.render(scene, camera);
}

```

* **重要**: スライダーで値を変更しても、画面上のモデルに反映されるのはこの `vrm.update(deltaTime)` が呼ばれた瞬間です。
* 特に「正規化ボーン」への操作は、この `update` のタイミングで実際のボーンへと計算・反映されます。

---

## 4. 次のステップ

このコードが動いたら、次のようなことに挑戦してみると理解が深まります。

1. **表情を増やす**: `expressionNames` の配列に `'surprised'` や `'lookup'` などを追加して、動くか試してみる。
2. **ポーズを作る**: 関節を動かして好きなポーズを取らせてみる。
3. **他のボーン**: `setupBoneControl` を使って、足（`leftUpperLeg`）や手（`leftHand`）などを追加してみる。

何か不明な点や、エラーが出た場合はお気軽にご質問ください。