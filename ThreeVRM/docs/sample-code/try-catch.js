try {
    // 失敗するかもしれない処理
    let data = loadFile(hoge.hoge);  //hoge.hogeなんてないので必ず失敗！
  } catch (error) {
    // 失敗した時のバックアップ
    console.log("ファイルがなかったので、デフォルト設定を使います。");
  }