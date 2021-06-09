/**
 * ページ表示時処理
 */
window.onload = function () {
    initResultTable();
}

/**
 * 検索結果初期化
 */
function initResultTable() {
    $("#resultTable").append(
        $("<tr></tr>")
            .append($("<th></th>").text("№"))
            .append($("<th></th>").text("ブランド"))
            .append($("<th></th>").text("アイドル名"))
            .append($("<th></th>").text("アイドル名鑑(公式)"))
    );
}

// 定数定義
const URL = "https://sparql.crssnky.xyz/spql/imas/query?query=";
const Query =
    [// 1.SELECT
        Query_def
        + "SELECT ?s (group_concat(DISTINCT ?title ; separator = ', ') as ?titles) "
        + "(group_concat(DISTINCT ?name ; separator = ', ') as ?iName) ?idolListURL "
        + "WHERE {"
        + "  {"
        + "  ?s schema:name|schema:alternateName ?name"
        + "    FILTER( lang(?name) = 'ja' ",
        // 2,4.各種データ値
        ") . "
        + "  ?s rdf:type ?ctype . FILTER( ?ctype = imas:Idol ) "
        + "  OPTIONAL { ?s imas:Brand ?title. } "
        + "  OPTIONAL { ?s imas:cv ?cv . FILTER( lang(?cv) = 'ja' ) } "
        + "  OPTIONAL { ?s imas:pastCv ?pastCv . FILTER( lang(?pastCv) = 'ja' ) } "
        + "  OPTIONAL { ?s imas:Division | imas:Type | imas:Category ?division. } "
        + "  OPTIONAL { ?s imas:BloodType ?bloodType . } "
        + "  OPTIONAL { ?s foaf:age ?age . } "
        + "  OPTIONAL { ?s schema:gender ?gender . } "
        + "  OPTIONAL { ?s schema:height ?height . } "
        + "  OPTIONAL { ?s schema:weight ?weight . } "
        + "  OPTIONAL { ?s imas:Handedness ?handedness. } "
        + "  OPTIONAL { ?s imas:Bust ?bust. } "
        + "  OPTIONAL { ?s imas:Waist ?waist. } "
        + "  OPTIONAL { ?s imas:Hip ?hip. } "
        + "  OPTIONAL { ?s imas:ShoeSize ?shoeSize. } "
        + "  OPTIONAL { ?s schema:birthDate ?birthDate . } "
        + "  OPTIONAL { ?s imas:Constellation ?constellation. } "
        + "  OPTIONAL { ?s schema:birthPlace ?birthPlace . } "
        + "  OPTIONAL { ?s imas:Hobby ?hobby. } "
        + "  OPTIONAL { ?s imas:Favorite ?favorite. } "
        + "  OPTIONAL { ?s imas:Talent ?talent. } "
        + "  OPTIONAL { ?s imas:Color ?color. } "
        + "  OPTIONAL { ?s imas:PopLinksAttribute ?popLinksAttribute . FILTER( lang(?popLinksAttribute) = 'ja' ) } "
        + "  OPTIONAL { ?s schema:description ?description . } "
        + "  OPTIONAL { ?s imas:IdolListURL ?idolListURL . } ",
        // 3.UNION～名前のみ検索
        "  }UNION{"
        + "  FILTER NOT EXISTS {?s schema:name|schema:alternateName ?fname} "
        + "  ?s schema:givenName ?name "
        + "    FILTER( lang(?name) = 'ja' ",
        // 5.集約とソート
        "  }"
        + "}"
        + "GROUP BY ?s ?cv ?bloodType ?birthDate ?constellation ?birthPlace ?color ?idolListURL "
        + "ORDER BY ?iName"];

const conditions = {
    "name": "text", "title": "text", "division": "text", "popLinksAttribute": "text", "cv": "text", "pastCv": "text",
    "age": "number", "gender": "gender", "height": "number", "weight": "number", "handedness": "handedness",
    "bust": "number", "waist": "number", "hip": "number", "shoeSize": "number", "birthDate": "birthDate",
    "constellation": "text", "birthPlace": "text", "hobby": "text", "favorite": "text", "talent": "text", "description": "text"
}

/**
 * 検索処理本体
 */
function doIdolSearch() {
    // 検索ボタン無効化
    changeEnable(false, "BTNIdolSearch");
    // クエリビルド
    let search1 = "";
    for (const [key, value] of Object.entries(conditions)) {
        const inputVal = $("#" + key + "Input").val();
        if (inputVal == "") continue;
        switch (value) {
            case "number":
                // 数値
                if (isNaN(inputVal)) {
                    // 数値にできないtextの場合
                    // 永遠の17歳、ダイエットちゅう、ぼんっ、きゅっ、ぼんっ♪…の対策
                    search1 = search1 + " && regex(?" + key + ", '" + escapeForSparql(inputVal) + "', 'i')";
                } else {
                    // 数値の場合
                    search1 = search1 + " && ?" + key + "=" + inputVal + "";
                }
                break;
            case "gender":
                // 性別
                // 将来的にLGBTや男の娘が出てくることを考慮
                search1 = search1 + " && ?" + key + "='" + escapeForSparql(
                    (inputVal == "男性" ? "male" : (inputVal == "女性" ? "female" : inputVal))) + "'";
                break;
            case "handedness":
                // 利き手
                search1 = search1 + " && ?" + key + "='" + escapeForSparql(
                    (inputVal == "右利き" ? "right" : (inputVal == "左利き" ? "left" : (inputVal == "両利き" ? "both" : inputVal)))) + "'";
                break;
            case "birthDate":
                // 誕生日
                if (inputVal.match(/^(\d+)\/(\d+)/) !== null) {
                    // mm/ddの場合
                    const month = inputVal.replace(/^(\d+)\/(\d+)/, "$1");
                    const day = inputVal.replace(/^(\d+)\/(\d+)/, "$2");
                    search1 = search1 + " && regex(str(?" + key + "), '--" +
                        (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) + "', 'i')";
                } else if (inputVal.match(/^--(\d+)-(\d+)/)) {
                    // --mm-ddの場合
                    search1 = search1 + " && regex(str(?" + key + "), '" + inputVal + "', 'i')";
                } else {
                    // 将来的に○○歴xx年mm月dd日のようなパターンが出てくることを考慮
                    search1 = search1 + " && regex(str(?" + key + "), '" + escapeForSparql(inputVal) + "', 'i')";
                }
                break;
            default:
                // 基本はtextの場合
                search1 = search1 + " && regex(?" + key + ", '" + escapeForSparql(inputVal) + "', 'i')";
                break;
        }
    }
    // URL、クエリ結合
    const urlQuery = URL + encodeURIComponent(Query[0] + search1 + Query[1] + Query[2] + search1 + Query[1] + Query[3]);
    // 通信実行
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        // 一度divの中身を空にする
        $("#resultTable tr").remove();
        // ヘッダ挿入
        initResultTable();
        // 戻り値を表に入れる
        let index = 1;
        json.forEach(i => {
            $("#resultTable").append(
                $("<tr></tr>")
                    .append($("<th></th>").text(index))
                    .append($("<td></td>").text(i["titles"]["value"]))
                    .append($("<td></td>").append("<a href='/MySparql/imasparql/idolsearch/detail.html?s="
                        + i["s"]["value"].replace("https://sparql.crssnky.xyz/imasrdf/RDFs/detail/", "")
                        + "' target='_blank'>" + i["iName"]["value"] + "</a>"))
                    .append($("<td></td>").append((("idolListURL" in i)
                        ? ("<a href=" + i["idolListURL"]["value"] + " target='_blank'>Link</a>") : ("---"))))
            );
            index++;
        });
        // 検索ボタン有効化
        changeEnable(true, "BTNIdolSearch");
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
        // 検索ボタン有効化
        changeEnable(true, "BTNIdolSearch");
    });
}