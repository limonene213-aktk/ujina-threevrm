# 🎛️ Example-002: GUI操作でVRMを動かす

> **難易度:** ⭐⭐⭐☆☆（中級）  
> **学習時間:** 約30分  
> **前提知識:** example-001を完了していること、基本的なJavaScript

---

## 📖 このサンプルについて

このサンプルでは、**アニメーションファイルを使わずに、画面上のスライダー（GUI）でVRMの表情や関節を直接動かす**方法を学びます。

### 学べること
- ✅ ExpressionManager（表情制御）の使い方
- ✅ Normalized Bones（正規化ボーン）の概念
- ✅ lil-gui を使ったインタラクティブUI
- ✅ VRM0.0モデルへの対応

---

## 🚀 動かしてみよう！

### 手順

1. VS Codeでこのフォルダを開く
2. `index.html` を右クリック → **「Open with Live Server」**
3. 画面右上のGUIパネルでスライダーを動かしてみよう！

---

## 📁 ファイル構成

```
example-002/
├── index.html      # メインのHTMLファイル
├── main.js         # JavaScriptのロジック
├── vrm/
│   └── model.vrm   # 3Dキャラクターモデル
└── vrma/
    └── motion.vrma # （このサンプルでは使用しない）
```

---

## 🔄 プログラムの全体像

このプログラムは大きく分けて3つのステップで動作しています。

```
┌─────────────────────────────────────────────────┐
│ 1️⃣ 準備                                         │
│    Three.jsの基本セット（シーン、カメラ、ライト）  │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ 2️⃣ 読み込み                                     │
│    VRMモデルをロード＆VRM 1.0ルールで初期化       │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ 3️⃣ 操作                                         │
│    GUIライブラリでスライダーを作成               │
│    スライダー操作 → 表情・ボーン変更             │
└─────────────────────────────────────────────────┘
```

---

## 🎓 VRM 1.0の重要な変更点

### A. 読み込み方法の変更（復習）

VRMの読み込みは、`GLTFLoader` の「プラグイン」として機能するようになりました。

```javascript
// ❌ 旧: VRM.from(...) や VRMImporter は削除されました
// ✅ 新: loader.register でプラグインとして登録します
loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});
```

### B. 表情の操作（ExpressionManager）

昔は `BlendShapeProxy` と呼ばれていた機能は、**`ExpressionManager`** という名前に変わりました。

```javascript
// ❌ 旧: vrm.blendShapeProxy.setValue(...)
// ✅ 新: vrm.expressionManager.setValue(...)
vrm.expressionManager.setValue('happy', 1.0);
```

### C. ボーンの操作（Normalized Bones）

これがVRM 1.0の少し難しいけれど便利な点です。

#### 🤔 なぜ「正規化」が必要？

モデルによって「腕の初期角度」などがバラバラだとプログラムで扱いづらいため、**「正規化されたボーン（Normalized Bone）」** という機能を使います。

```
┌────────────────────────────────────────────────────────┐
│ 正規化なし ❌                                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  モデルA: 腕の初期角度 = 45度                          │
│  モデルB: 腕の初期角度 = 0度                           │
│  モデルC: 腕の初期角度 = 30度                          │
│                                                        │
│  → 同じコードで「腕を上げる」をやると結果がバラバラ！   │
│                                                        │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 正規化あり ✅                                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  どのモデルでも「回転(0, 0, 0) ＝ まっすぐな状態」      │
│                                                        │
│  → 同じコードで同じポーズが作れる！ 🎉                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 💻 コードのポイント解説

### ① GUIの準備（`initGUI` 関数）

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

> 💡 **ポイント:** `setValue('happy', 1.0)` のように文字列で表情を指定できます。

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

> 💡 **ポイント:** `getNormalizedBoneNode` を使うことで、モデルごとの個体差を無視して直感的に動かすことができます。

> 📐 **補足:** `Math.PI` は 180度 を意味します。スライダーは -180度 〜 +180度 の範囲で動くよう設定しています。

### ② モデルの向き補正（`VRMUtils.rotateVRM0`）

```javascript
loader.load(..., (gltf) => {
  const vrm = gltf.userData.vrm;
  
  // ★VRM0.0モデルへの対応
  VRMUtils.rotateVRM0(vrm); 
  
  // ...
});
```

> 📖 **Migration Guide より:**  
> VRM 1.0では、モデルの正面が「Z軸のプラス方向」に変更されました。古いVRM 0.0のモデルを読み込むと後ろを向いてしまうことがあるため、この便利な関数を使って自動的に向きを修正しています。

### ③ 毎フレームの更新（`animate` 関数）

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

> ⚠️ **重要:** スライダーで値を変更しても、画面上のモデルに反映されるのはこの `vrm.update(deltaTime)` が呼ばれた瞬間です。特に「正規化ボーン」への操作は、この `update` のタイミングで実際のボーンへと計算・反映されます。

---

## 🎮 使用できる表情・ボーン一覧

### 表情（Expressions）

| 名前 | 説明 | 範囲 |
|-----|------|------|
| `happy` | 喜び | 0.0〜1.0 |
| `angry` | 怒り | 0.0〜1.0 |
| `sad` | 悲しみ | 0.0〜1.0 |
| `relaxed` | リラックス | 0.0〜1.0 |
| `surprised` | 驚き | 0.0〜1.0 |
| `blink` | まばたき | 0.0〜1.0 |
| `aa` / `ih` / `ou` / `ee` / `oh` | 口の形（リップシンク用） | 0.0〜1.0 |
| `lookUp` / `lookDown` / `lookLeft` / `lookRight` | 視線 | 0.0〜1.0 |

### ボーン（Humanoid Bones）

| 名前 | 説明 |
|-----|------|
| `head` | 頭 |
| `neck` | 首 |
| `chest` | 胸 |
| `spine` | 背骨 |
| `leftUpperArm` / `rightUpperArm` | 上腕 |
| `leftLowerArm` / `rightLowerArm` | 前腕 |
| `leftHand` / `rightHand` | 手 |
| `leftUpperLeg` / `rightUpperLeg` | 太もも |
| `leftLowerLeg` / `rightLowerLeg` | すね |
| `leftFoot` / `rightFoot` | 足 |

---

## 🚀 次のステップ：チャレンジしてみよう！

このコードが動いたら、次のようなことに挑戦してみると理解が深まります。

### 1️⃣ 表情を増やす
`expressionNames` の配列に `'surprised'` や `'lookUp'` などを追加して、動くか試してみる。

### 2️⃣ ポーズを作る
関節を動かして好きなポーズを取らせてみる。スクリーンショットを撮ってみよう！

### 3️⃣ 他のボーンを追加
`setupBoneControl` を使って、足（`leftUpperLeg`）や手（`leftHand`）などを追加してみる。

### 4️⃣ アニメーションと組み合わせる
example-001のアニメーション再生と、このGUI操作を組み合わせてみよう。

---

## 🛠️ トラブルシューティング

| 症状 | 原因 | 解決方法 |
|-----|------|---------|
| GUIが表示されない | lil-guiの読み込み失敗 | ネットワーク接続を確認 |
| スライダーを動かしても変化しない | `update()`が呼ばれていない | `animate`関数を確認 |
| ボーンが見つからない | ボーン名の間違い | VRMのボーン名を確認 |

---

## 📖 関連ドキュメント

- [01.GLTF.md](../docs/01.GLTF.md) - glTFの基礎知識
- [02.VRMUtils最適化.md](../docs/02.VRMUtils最適化.md) - パフォーマンス改善
- [03.async-await.md](../docs/03.async-await.md) - 非同期処理の理解
- [example-001](../example-001/README.MD) - アニメーション再生編

---

## ❓ 質問・フィードバック

何か不明な点や、エラーが出た場合はお気軽にご質問ください！