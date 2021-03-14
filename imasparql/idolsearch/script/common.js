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