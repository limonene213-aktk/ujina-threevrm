//配列の書き方（ふつうの配列）

const jmin_words = [
    "サンガツ",
    "グエー新団子",
    "ンゴwwwwwww",
    "ファッ！？",
    "やきう！"
];

const say=(code)=>{
    //配列は四角括弧のなかにIndex番号を入れる
   console.log(jmin_words[code]);
}

const code = 1;

say(code);

//連想配列の書き方と使い方

const jmin_words2 = {
    "ngo1":"サンガツ",
    "ngo2":"グエー新団子",
    "ngo3":"ンゴwwwwwww",
    "ngo4":"ファッ！？",
    "ngo5":"やきう！"
};

const say2=(jkey)=>{
    //配列は四角括弧のなかにIndex番号を入れる\
okotoba = jmin_words2[jkey] ?? "そんなキーワードないンゴ！"
   console.log(okotoba);
}

console.log(say2("アル中カラカラ"));