/**
 * ページ表示時処理
 */
window.onload = function () {
    const Subject = getSubjectOrRedirect();
    makeRDFLink(Subject);
    doUnitDetail(Subject);
    doMemberList(Subject);
}

// 定数定義
const QUERY_UNIT =
    [Query_def + "PREFIX unit: <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/",
    "> "
    + "SELECT ?s (?name as ?ユニット名) (?nameKana as ?ユニット名ふりがな) (?description as ?説明) "
    + "(group_concat(DISTINCT ?alternateName ; separator = ', ') as ?別名) (?color as ?シンボルカラー) "
    + "WHERE { "
    + "  unit: rdf:type imas:Unit. "
    + "  unit: schema:name ?name. "
    + "  OPTIONAL { unit: imas:nameKana ?nameKana} . "
    + "  OPTIONAL { unit: schema:description ?description } . "
    + "  OPTIONAL { unit: schema:alternateName ?alternateName} . "
    + "  OPTIONAL { unit: imas:Color ?color. } "
    + "} "
    + "GROUP BY ?s ?name ?nameKana ?description ?color "
    + "ORDER BY ?name"];

/**
 * ユニット詳細表示
 * @param {String} Subject 主語 
 */
function doUnitDetail(Subject) {
    // Sparql実行
    runSubjectQuery(QUERY_UNIT, Subject).then(json => {
        // 通信成功
        // ヘッダ挿入
        init2ColumnsTable("#detailTable", "項目", "情報");
        // 戻り値を表に入れる
        json.forEach(i => {
            $("#unitName").text("ユニット詳細[" + i["ユニット名"]["value"] + "]");
            writeDetailTable(i);
        });
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
    });
}

// 定数定義
const QUERY_UNIT_MEMBER =
    [Query_def + "PREFIX unit: <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/",
    "> "
    + "SELECT (?member as ?s) (group_concat(DISTINCT ?member_name ; separator = ', ') as ?name) "
    + "WHERE { "
    + "  { "
    + "    ?member schema:name|schema:alternateName ?member_name. FILTER( lang(?member_name) = 'ja' ) "
    + "    unit: rdf:type imas:Unit. "
    + "    unit: schema:member ?member. "
    + "  } UNION { "
    + "    FILTER NOT EXISTS {?member schema:name|schema:alternateName ?fname} "
    + "    ?member schema:givenName ?member_name. FILTER( lang(?member_name) = 'ja' ) "
    + "    unit: rdf:type imas:Unit. "
    + "    unit: schema:member ?member. "
    + "  } "
    + "} "
    + "GROUP BY ?member "
    + "ORDER BY ?member"];

/**
 * 対象者表示
 * @param {String} Subject 主語 
 */
function doMemberList(Subject) {
    // Sparql実行
    runSubjectQuery(QUERY_UNIT_MEMBER, Subject).then(json => {
        // 通信成功
        // ヘッダ挿入
        init2ColumnsTable("#memberTable", "No.", "名前");
        // 戻り値を表に入れる
        writeLinkName(json, "#memberTable", "detail.html");
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
    });
}