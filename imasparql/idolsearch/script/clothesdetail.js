/**
 * ページ表示時処理
 */
window.onload = function () {
    const Subject = getSubjectOrRedirect();
    makeRDFLink(Subject);
    doClothesDetail(Subject);
    doMemberList(Subject);
}

// 定数定義
const QUERY_CLOTHES =
    [Query_def + "PREFIX clothes: <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/",
    "> "
    + "SELECT ?s (?name as ?衣装名) (?description as ?説明) "
    + "WHERE { "
    + "  clothes: rdf:type imas:Clothes. "
    + "  clothes: schema:name ?name. "
    + "  OPTIONAL { clothes: schema:description ?description } . "
    + "  FILTER( lang(?name) = 'ja' ) "
    + "} "
    + "GROUP BY ?s ?name ?description "
    + "ORDER BY ?name"];

/**
 * 衣装詳細表示
 * @param {String} Subject 主語 
 */
function doClothesDetail(Subject) {
    // Sparql実行
    runSubjectQuery(QUERY_CLOTHES, Subject).then(json => {
        // 通信成功
        // ヘッダ挿入
        init2ColumnsTable("#detailTable", "項目", "情報");
        // 戻り値を表に入れる
        json.forEach(i => {
            $("#clothesName").text("衣装詳細[" + i["衣装名"]["value"] + "]");
            writeDetailTable(i);
        });
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
    });
}

// 定数定義
const QUERY_CLOTHES_MEMBER =
    [Query_def + "PREFIX clothes: <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/",
    "> "
    + "SELECT (?whose as ?s) (group_concat(DISTINCT ?whose_name ; separator = ', ') as ?name)"
    + "WHERE { "
    + "  { "
    + "    ?whose schema:name|schema:alternateName ?whose_name. FILTER( lang(?whose_name) = 'ja' ) "
    + "    clothes: rdf:type imas:Clothes. "
    + "    clothes: imas:Whose ?whose. "
    + "  } UNION { "
    + "    FILTER NOT EXISTS {?whose schema:name|schema:alternateName ?fname} "
    + "    ?whose schema:givenName ?whose_name. FILTER( lang(?whose_name) = 'ja' ) "
    + "    clothes: rdf:type imas:Clothes. "
    + "    clothes: imas:Whose ?whose. "
    + "  } "
    + "} "
    + "GROUP BY ?whose "
    + "ORDER BY ?whose"];

/**
 * 対象者表示
 * @param {String} Subject 主語 
 */
function doMemberList(Subject) {
    // Sparql実行
    runSubjectQuery(QUERY_CLOTHES_MEMBER, Subject).then(json => {
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