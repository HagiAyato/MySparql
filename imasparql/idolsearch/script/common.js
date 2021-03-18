//　共通コード

/**
 * クエリの定義共通部分
 */
const Query_def = "PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>"
    + "PREFIX schema: <http://schema.org/>"
    + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>"
    + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>";

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
 * @returns 
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