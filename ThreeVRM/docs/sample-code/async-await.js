async function sayHello() {
    console.log("準備中...");
    
    // 3秒待つという処理が終わるのを「待機(await)」する
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log("こんにちは！"); // 3秒後にしか実行されない
}

sayHello();