//クラス定義

class Jmin{

    constructor(){
        console.log("やきうやるやで！");
    }

    static team = "なんJ球団";

    //プロパティ（キーとバリューの形式で定義）
    static jmin_words = {
        "ngo1":"サンガツ",
        "ngo2":"グエー新団子",
        "ngo3":"ンゴwwwwwww",
        "ngo4":"ファッ！？",
        "ngo5":"やきう！"
    };

    //メソッド（インスタンス用）
    say(code){
        return Jmin.jmin_words[code] ?? "そんなワード知らないンゴ……";
        //自分自身のプロパティを使うときにはthisキーワードが必要
    }
}

let jmin = new Jmin(); //インスタンス化（なんJ民爆★誕）

console.log(jmin.say("ngo1"));