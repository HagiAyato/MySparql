//　共通コード

/**
 * クエリの定義共通部分
 */
const Query_def = "PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>"
    + "PREFIX schema: <http://schema.org/>"
    + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>"
    + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>";

/**
 * 要素の表示非表示
 * @param {string} btnId 表示非表示切替ボタンのID
 * @param {string} elementId 表示非表示切替対象のID
 * @param {string} btnText 表示非表示切替ボタンの文字
 */
function dispElement(btnId, elementId, btnText) {
    if ($(elementId).css('display') == 'none') {
        // 表示
        $(btnId).text(btnText + '非表示△');
        $(elementId).attr('style', 'display:block');
    } else {
        // 非表示
        $(btnId).text(btnText + '表示▼');
        $(elementId).attr('style', 'display:none');
    }

}

/**
 * 要素の有効無効切替
 * @param {boolean} isEnable 有効無効
 * @param {...string} target 対象要素(複数指定可能)
 */
function changeEnable(isEnable, ...target) {
    target.forEach(
        function (item, index) {
            $("#" + item).prop("disabled", !isEnable);
        });
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

/**
 * Sparqlクエリ実行関数
 * @param {String} url 実行URL(URL+クエリ)
 * @returns Promise
 */
var promiseSparqlRequest = function (url) {
    return new Promise(function (resolve, reject) {
        // HTTPリクエスト
        const request = new XMLHttpRequest();
        request.open("GET", url);
        // 通信実行
        request.send();
        // 通信成功
        request.addEventListener("load", (e) => {
            // サーバでの処理失敗判定
            if (e.target.status != 200) {
                console.log(e.target.status + ':' + e.target.statusText);
                reject("検索に失敗しました。");
                return;
            }
            resolve(JSON.parse(e.target.responseText)["results"]["bindings"]);
        });
        // 通信失敗
        request.addEventListener("error", () => {
            console.log("Http Request Error");
            reject("通信に失敗しました。");
        });
    });
}