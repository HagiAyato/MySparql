/**
 * ページ表示時処理
 */
 window.onload = function () {
    const idolName = getParam('idolName');
    if(idolName == null|| idolName == "")location.href="/MySparql/imasparql/idolsearch/";
    $("#idolName").text("アイドル詳細[" + idolName + "]");
    // アイドル詳細読み込み
    doIdolDetail(idolName);
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
    ["PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>"
        + "PREFIX schema: <http://schema.org/>"
        + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>"
        + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"
        + "SELECT DISTINCT *"
        + "WHERE {"
        + "  ?s schema:name|schema:alternateName ?name"
        + "    FILTER( lang(?name) = 'ja' ",
    ") ."
    + "  ?s rdf:type ?ctype . FILTER( ?ctype = imas:Idol )"
    + "  OPTIONAL { ?s imas:Title ?title. }"
    + "  OPTIONAL { ?s imas:cv ?cv . FILTER( lang(?cv) = 'ja' ) }"
    + "  OPTIONAL { ?s imas:Division | imas:Type | imas:Category ?division. }"
    + "  OPTIONAL { ?s imas:BloodType ?bloodType . }"
    + "  OPTIONAL { ?s foaf:age ?age . }"
    + "  OPTIONAL { ?s schema:height ?height . }"
    + "  OPTIONAL { ?s schema:weight ?weight . }"
    + "  OPTIONAL { ?s imas:Handedness ?handedness. }"
    + "  OPTIONAL { ?s imas:Bust ?bust. }"
    + "  OPTIONAL { ?s imas:Waist ?waist. }"
    + "  OPTIONAL { ?s imas:Hip ?hip. }"
    + "  OPTIONAL { ?s imas:ShoeSize ?shoeSize. }"
    + "  OPTIONAL { ?s schema:birthDate ?birthDate . }"
    + "  OPTIONAL { ?s imas:Constellation ?constellation. }"
    + "  OPTIONAL { ?s schema:birthPlace ?birthPlace . }"
    + "  OPTIONAL { ?s schema:description ?description . }"
    + "  OPTIONAL { ?s imas:IdolListURL ?idolListURL . }"
    + "}"];

// HTTPリクエスト
const request = new XMLHttpRequest();

/**
 * 検索処理本体
 */
function doIdolDetail(nameInput) {
    // 通信準備
    const search1 = " && regex(?name, '" + escapeForSparql(nameInput) + "', 'i')";
    request.open("GET", URL + encodeURIComponent(Query[0] + (search1) + Query[1]));
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
        let index = 1;
        // ヘッダ挿入
        initResultTable();
        // 戻り値を表に入れる
    });
    // 通信失敗
    request.addEventListener("error", () => {
        console.log("Http Request Error");
        alert("通信に失敗しました。");
    });
}