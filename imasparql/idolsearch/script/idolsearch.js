/**
 * ページ表示時処理
 */
window.onload = function () {
    
}

// 定数定義

/**
 * クエリ
 */
const Query =
    [// 1.SELECT
        Query_def
        + "SELECT ?s (group_concat(DISTINCT ?title ; separator = ', ') as ?titles) "
        + "(group_concat(DISTINCT ?name ; separator = ', ') as ?iName) ?idolListURL ?ctype "
        + "WHERE {"
        + "  {"
        + "  ?s schema:name|schema:alternateName ?name"
        + "    FILTER( lang(?name) = 'ja' ",
        // 2,4.各種データ値
        ") . "
        + "  ?s rdf:type ?ctype . FILTER( ?ctype = imas:Idol || ?ctype = imas:Staff ) "
        + "  OPTIONAL { ?s schema:name|schema:alternateName ?eName. FILTER( lang(?eName) = 'en')} "
        + "  OPTIONAL { ?s imas:nameKana|imas:alternateNameKana ?nameKana. } "
        + "  OPTIONAL { ?s imas:Brand ?title. } "
        + "  OPTIONAL { ?s imas:IdolListURL ?idolListURL. } ",
        // 3.UNION～名前のみ検索
        "  }UNION{"
        + "  FILTER NOT EXISTS {?s schema:name|schema:alternateName ?fname} "
        + "  OPTIONAL { ?s schema:givenName ?eName. FILTER( lang(?eName) = 'en')} "
        + "  OPTIONAL { ?s imas:givenNameKana ?nameKana. } "
        + "  ?s schema:givenName ?name "
        + "    FILTER( lang(?name) = 'ja' ",
        // 5.集約とソート
        "  }"
        + "}"
        + "GROUP BY ?s ?idolListURL ?ctype "
        + "ORDER BY ?iName"];

/**
 * 条件とのその分類
 */
const conditions = {
    "name": "name", "title": "title", "division": "text", "position": "text", "popLinksAttribute": "text", "cv": "text", "pastCv": "text",
    "bloodType": "textPerfect", "age": "number", "schoolGrade": "text", "gender": "gender", "height": "number", "weight": "number",
    "handedness": "handedness", "bust": "number", "waist": "number", "hip": "number", "shoeSize": "number", "birthDate": "birthDate",
    "constellation": "text", "birthPlace": "text", "hobby": "text", "favorite": "text", "talent": "text", "description": "text"
}

/**
 * 条件検索用クエリ
 */
const conditionQueries = {
    "cv": "  OPTIONAL { ?s imas:cv ?cv . FILTER( lang(?cv) = 'ja' ) } ",
    "pastCv": "  OPTIONAL { ?s imas:pastCv ?pastCv . FILTER( lang(?pastCv) = 'ja' ) } ",
    "division": "  OPTIONAL { ?s imas:Division | imas:Type | imas:Category ?division. } ",
    "position": "  OPTIONAL { ?s schema:position ?position . } ",
    "bloodType": "  OPTIONAL { ?s imas:BloodType ?bloodType. } ",
    "age": "  OPTIONAL { ?s foaf:age ?age. } ",
    "schoolGrade": "  OPTIONAL { ?s imas:SchoolGrade ?schoolGrade . } ",
    "gender": "  OPTIONAL { ?s schema:gender ?gender. } ",
    "height": "  OPTIONAL { ?s schema:height ?height. } ",
    "weight": "  OPTIONAL { ?s schema:weight ?weight. } ",
    "handedness": "  OPTIONAL { ?s imas:Handedness ?handedness. } ",
    "bust": "  OPTIONAL { ?s imas:Bust ?bust. } ",
    "waist": "  OPTIONAL { ?s imas:Waist ?waist. } ",
    "hip": "  OPTIONAL { ?s imas:Hip ?hip. } ",
    "shoeSize": "  OPTIONAL { ?s imas:ShoeSize ?shoeSize. } ",
    "birthDate": "  OPTIONAL { ?s schema:birthDate ?birthDate . } ",
    "constellation": "  OPTIONAL { ?s imas:Constellation ?constellation. } ",
    "birthPlace": "  OPTIONAL { ?s schema:birthPlace ?birthPlace . } ",
    "hobby": "  OPTIONAL { ?s imas:Hobby ?hobby. } ",
    "favorite": "  OPTIONAL { ?s imas:Favorite ?favorite. } ",
    "talent": "  OPTIONAL { ?s imas:Talent ?talent. } ",
    "color": "  OPTIONAL { ?s imas:Color ?color. } ",
    "popLinksAttribute": "  OPTIONAL { ?s imas:PopLinksAttribute ?popLinksAttribute . } ",
    "description": "  OPTIONAL { ?s schema:description ?description . } ",
}

/**
 * 検索処理本体
 */
function doIdolSearch() {
    // 検索ボタン無効化
    // 削除ボタン無効化
    changeEnable(false, "BTNIdolSearch", "BTNDeleteConditions");
    // 検索条件入力無効化
    changeEnableConditions(false);
    // クエリビルド
    let search1 = "";
    let search2 = "";
    for (const [key, value] of Object.entries(conditions)) {
        const inputVal = $("#" + key + "Input").val();
        if (inputVal == "") continue;
        switch (value) {
            case "name":
                // 英語名・ひらがな対応
                search1 += " && (regex(?" + key + ", '" + escapeForSparql(inputVal) + "', 'i') "
                    + "|| regex(?eName, '" + escapeForSparql(inputVal) + "', 'i') "
                    + "|| regex(?nameKana, '" + escapeForSparql(inputVal) + "', 'i'))";
                break;
            case "number":
                // 数値
                if (isNaN(inputVal)) {
                    if (inputVal.match(/^(\d*)~(\d*)$/) !== null) {
                        // 範囲検索
                        const from = inputVal.replace(/^(\d*)~(\d*)$/, "$1");
                        const to = inputVal.replace(/^(\d*)~(\d*)$/, "$2");
                        search1 += " && " + Number(from) + "<=?" + key
                            + " && ?" + key + "<=" + (to.match(/^$/) ? Number.MAX_SAFE_INTEGER : Number(to)) + "";
                    } else {
                        // 数値にできないtextの場合
                        // 永遠の17歳、ダイエットちゅう、ぼんっ、きゅっ、ぼんっ♪…の対策
                        search1 += " && regex(?" + key + ", '" + escapeForSparql(inputVal) + "', 'i')";
                    }
                } else {
                    // 数値の場合
                    search1 += " && ?" + key + "=" + inputVal + "";
                }
                search2 += conditionQueries[key];
                break;
            case "title":
                // タイトル(ブランド名)
                search1 += " && regex(?" + key + ", '" + escapeForSparql(inputVal) + "', 'i')";
                break;
            case "gender":
                // 性別
                // 将来的にLGBTや男の娘が出てくることを考慮
                search1 += " && ?" + key + "='" + escapeForSparql(
                    (inputVal == "男性" ? "male" : (inputVal == "女性" ? "female" : inputVal))) + "'";
                search2 += conditionQueries[key];
                break;
            case "handedness":
                // 利き手
                search1 += " && ?" + key + "='" + escapeForSparql(
                    (inputVal == "右利き" ? "right" : (inputVal == "左利き" ? "left" : (inputVal == "両利き" ? "both" : inputVal)))) + "'";
                search2 += conditionQueries[key];
                break;
            case "birthDate":
                // 誕生日
                if (inputVal.match(/^(\d+)\/(\d+)/) !== null) {
                    // mm/ddの場合
                    const month = inputVal.replace(/^(\d+)\/(\d+)/, "$1");
                    const day = inputVal.replace(/^(\d+)\/(\d+)/, "$2");
                    search1 += " && regex(str(?" + key + "), '--"
                        + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) + "', 'i')";
                } else if (inputVal.match(/^--(\d+)-(\d+)/)) {
                    // --mm-ddの場合
                    const month = inputVal.replace(/^--(\d+)-(\d+)/, "$1");
                    const day = inputVal.replace(/^--(\d+)-(\d+)/s, "$2");
                    search1 += " && regex(str(?" + key + "), '--"
                        + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) + "', 'i')";
                } else {
                    // 将来的に○○歴xx年mm月dd日のようなパターンが出てくることを考慮
                    search1 += " && regex(str(?" + key + "), '" + escapeForSparql(inputVal) + "', 'i')";
                }
                search2 += conditionQueries[key];
                break;
            case "textPerfect":
                // text完全一致
                search1 += " && ?" + key + "='" + escapeForSparql(inputVal) + "'";
                search2 += conditionQueries[key];
                break;
            default:
                // 基本はtextの場合
                search1 += " && regex(?" + key + ", '" + escapeForSparql(inputVal) + "', 'i')";
                search2 += conditionQueries[key];
                break;
        }
    }
    // URL、クエリ結合
    const urlQuery = ADDRESS + encodeURIComponent(Query[0] + search1 + Query[1] + search2 + Query[2] + search1 + Query[1] + search2 + Query[3]);
    // 通信実行
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        // 件数表示
        $("#lenResult").text(Object.keys(json).length);
        // 一度tbodyの中身を空にする
        $("#resultTable tbody").remove();
        // 戻り値を表に入れる
        let index = 1;
        json.forEach(i => {
            $("#resultTable").append(
                $("<tr></tr>")
                    .append($("<th></th>").text(index))
                    .append($("<td></td>").text(i["titles"]["value"]))
                    .append($("<td></td>").text((/Idol/.test(i["ctype"]["value"]) ? "アイドル" : "アイドル以外")))
                    .append($("<td></td>").append("<a href='/MySparql/imasparql/idolsearch/detail.html?s="
                        + encodeURIComponent(i["s"]["value"].replace("https://sparql.crssnky.xyz/imasrdf/RDFs/detail/", ""))
                        + "' target='_blank'>" + i["iName"]["value"] + "</a>"))
                    .append($("<td></td>").append((("idolListURL" in i)
                        ? ("<a href=" + i["idolListURL"]["value"] + " target='_blank'>Link</a>") : ("---"))))
            );
            index++;
        });
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
    }).finally(v => {
        // 検索ボタン有効化
        // 削除ボタン有効化
        changeEnable(true, "BTNIdolSearch", "BTNDeleteConditions");
        // 検索条件入力無効化
        changeEnableConditions(true);
    });
}

/**
 * 検索詳細条件削除
 */
function deleteConditions() {
    // 検索ボタン無効化
    // 削除ボタン無効化
    changeEnable(false, "BTNIdolSearch", "BTNDeleteConditions");
    for (const [key, value] of Object.entries(conditions)) {
        $("#" + key + "Input").val("");
    }
    // 検索ボタン有効化
    // 削除ボタン有効化
    changeEnable(true, "BTNIdolSearch", "BTNDeleteConditions");
}

/**
 * 検索詳細条件
 * @param {boolean} isEnable 有効無効
 */
function changeEnableConditions(isEnable) {
    for (const [key, value] of Object.entries(conditions)) {
        $("#" + key + "Input").prop("disabled", !isEnable);
    }
}