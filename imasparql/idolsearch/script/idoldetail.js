/**
 * ページ表示時処理
 */
window.onload = function () {
    const idolName = getParam('idolName');
    const Subject = getParam('s');
    if (idolName == null || idolName == ""||Subject == null || Subject == "") location.href = "/MySparql/imasparql/idolsearch/";
    $("#idolName").text("アイドル詳細[" + idolName + "]");
    // アイドル詳細読み込み
    doIdolDetail(Subject);
}

/**
 * Get the URL parameter value
 * https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 *
 * @param  name {string} パラメータのキー文字列
 * @return  url {url} 対象のURL文字列（任意）
 */
function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * 検索結果初期化
 */
function initResultTable() {
    $("#resultTable").append(
        $("<tr></tr>")
            .append($("<th></th>").text("項目"))
            .append($("<td></td>").text("プロフィール"))
    );
}

/**
 * Sparql向けのエスケープ処理
 * @param {string} param エスケープする文字列
 * @returns 
 */
function escapeForSparql(param) {
    return param
        .replace(/\\/g, '\\\\\\\\') // バックスラッシュ(正規表現、sparqlで2回エスケープする※2回"\"だとimasa@rql内部エラー)
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
}

// 定数定義
const URL = "https://sparql.crssnky.xyz/spql/imas/query?query=";
const Query =
    ["PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#> "
        + "PREFIX schema: <http://schema.org/> "
        + "PREFIX foaf: <http://xmlns.com/foaf/0.1/> "
        + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
        + "PREFIX idol: <",
    "> "
    + "SELECT (group_concat(DISTINCT ?name ; separator = ', ') as ?アイドル名) (group_concat(DISTINCT ?title ; separator = ', ') as ?ブランド) "
    + "  (group_concat(DISTINCT ?cv ; separator = ', ') as ?キャスト) (group_concat(DISTINCT ?division ; separator = ', ') as ?属性) "
    + "  (?bloodType as ?血液型) (Max(?age) as ?年齢) (group_concat(DISTINCT ?gender ; separator = ', ') as ?性別) "
    + "  (Max(?height) as ?身長) (Max(?weight) as ?体重) "
    + "  (group_concat(DISTINCT ?handedness ; separator = ', ') as ?利き手) "
    + "  (Max(?bust) as ?バスト_cm) (Max(?waist) as ?ウエスト_cm) (Max(?hip) as ?ヒップ_cm) (Max(?shoeSize) as ?靴のサイズ_cm) "
    + "  (?birthDate as ?誕生日) (?constellation as ?星座) (?birthPlace as ?出身地) "
    + "  (group_concat(DISTINCT ?hobby ; separator = ', ') as ?趣味) "
    + "  (?color as ?色) (?idolListURL as ?アイドル名鑑リンク) "
    + "WHERE { "
    + "  idol: schema:name|schema:alternateName ?name "
    + "         FILTER( lang(?name) = 'ja') . "
    + "  idol: rdf:type ?ctype . FILTER( ?ctype = imas:Idol ) "
    + "  OPTIONAL { idol: imas:Title ?title. } "
    + "  OPTIONAL { idol: imas:cv ?cv . FILTER( lang(?cv) = 'ja' ) } "
    + "  OPTIONAL { idol: imas:Division | imas:Type | imas:Category ?division. } "
    + "  OPTIONAL { idol: imas:BloodType ?bloodType . } "
    + "  OPTIONAL { idol: foaf:age ?age . } "
    + "  OPTIONAL { idol: schema:gender ?gender . } "
    + "  OPTIONAL { idol: schema:height ?height . } "
    + "  OPTIONAL { idol: schema:weight ?weight . } "
    + "  OPTIONAL { idol: imas:Handedness ?handedness. } "
    + "  OPTIONAL { idol: imas:Bust ?bust. } "
    + "  OPTIONAL { idol: imas:Waist ?waist. } "
    + "  OPTIONAL { idol: imas:Hip ?hip. } "
    + "  OPTIONAL { idol: imas:ShoeSize ?shoeSize. } "
    + "  OPTIONAL { idol: schema:birthDate ?birthDate . } "
    + "  OPTIONAL { idol: imas:Constellation ?constellation. } "
    + "  OPTIONAL { idol: schema:birthPlace ?birthPlace . } "
    + "  OPTIONAL { idol: imas:Hobby ?hobby. } "
    + "  OPTIONAL { idol: imas:Hobby ?hobby. } "
    + "  OPTIONAL { idol: imas:Color ?color. } "
    + "  OPTIONAL { idol: imas:IdolListURL ?idolListURL . } "
    + "} "
    + "GROUP BY ?cv ?bloodType ?birthDate ?constellation ?birthPlace ?color ?idolListURL"];

// HTTPリクエスト
const request = new XMLHttpRequest();

/**
 * 検索処理本体
 */
function doIdolDetail(Subject) {
    // 通信準備
    request.open("GET", URL + encodeURIComponent(Query[0] + (Subject) + Query[1]));
    // 通信実行
    request.send();
    // 通信成功
    request.addEventListener("load", (e) => {
        // サーバでの処理失敗判定
        if (e.target.status != 200) {
            console.log(e.target.status + ':' + e.target.statusText);
            alert("検索に失敗しました。");
            return;
        }
        // 一度divの中身を空にする
        $("#resultTable tr").remove();
        // JSON分解
        const json = JSON.parse(e.target.responseText)["results"]["bindings"];
        // ヘッダ挿入
        initResultTable();
        // 戻り値を表に入れる
        json.forEach(i => {
            for (var item in i){
                $("#resultTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item))
                        .append($("<td></td>").text(i[item]["value"]))
                );
            }
        });
    });
    // 通信失敗
    request.addEventListener("error", () => {
        console.log("Http Request Error");
        alert("通信に失敗しました。");
    });
}