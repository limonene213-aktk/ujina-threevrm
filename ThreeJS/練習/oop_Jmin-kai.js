//クラス定義

class Jmin{

    constructor(){
        console.log("よっしゃ！今日もスレ立てするやで！！");
    }

    static team = "なんJ球団";

    //プロパティ（リスト形式で定義）
    jmin_words = [
        "サンガツ",
        "グエー新団子",
        "ンゴwwwwwww",
        "ファッ！？",
        "やきう！"
    ];

    //メソッド（インスタンス用）
   say(code){
        return this.jmin_words[code] ?? "そんなコード知らないンゴ……"; 
        //自分自身のプロパティを使うときにはthisキーワードが必要
    }

    dispose(){
        console.log("グエー死んだンゴ……");
    }
}

//なんJ民爆誕
let jmin = new Jmin(); //インスタンス化（なんJ民爆★誕）

//【速報】なんJ民、仕事する
console.log(jmin.say(3));

//【悲報】なんJ民、無事脂肪
jmin.dispose();