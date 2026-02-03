class ThreeApp {
    constructor() {
      // シーン
      this.scene = new THREE.Scene();
  
      // カメラ
      this.camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
      );
      this.camera.position.set(0, 1, 5);
  
      // レンダラー
      this.renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector("#myCanvas"),
        antialias: true
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
  
      // モデル（例として箱を置いた）
      const geometry = new THREE.TorusGeometry(
        1,  //半径
        0.35, //太さ
        1000, //太さ方向の分割数
        1000 //円周方向の分割数
      );
      const material = new THREE.MeshNormalMaterial();
      this.model = new THREE.Mesh(geometry, material);
      
      this.scene.add(this.model);
  
      // アニメスタート！
      this.animate = this.animate.bind(this);
      this.animate();
    }
  
    animate() {
      requestAnimationFrame(this.animate);
  
      // 回転の処理（演出）
      this.model.rotation.y += 0.05;
  
      // 描画！
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  // 実行！
  new ThreeApp();
  