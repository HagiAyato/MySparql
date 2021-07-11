/**
 * ページ表示時処理
 */
window.onload = function () {
    const Subject = getParam('s');
    if (Subject == null || Subject == "") location.href = "/MySparql/imasparql/idolsearch/";
    // アイドル詳細読み込み
    doClothesDetail(Subject);
    doMemberList(Subject);
}

/**
 * Get the URL parameter value
 * https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 *
 * @param {string} name パラメータのキー文字列
 * @param {url} url 対象のURL文字列（任意）
 * @return 引数戻り値
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
 * 詳細表示初期化
 */
function initResultTable() {
    $("#resultTable").append(
        $("<tr></tr>")
            .append($("<th></th>").text("項目"))
            .append($("<th></th>").text("情報"))
    );
}

/**
 * 衣装詳細表示
 * @param {String} Subject 主語 
 */
function doClothesDetail(Subject) {
    // クエリビルド
    const search1 = escapeForSparql(Subject);
    // URL、クエリ結合
    const urlQuery = ADDRESS + encodeURIComponent(QUERY_CLOTHES[0] + search1 + QUERY_CLOTHES[1]);
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        // ヘッダ挿入
        initResultTable();
        // 戻り値を表に入れる
        json.forEach(i => {
            $("#clothesName").text("衣装詳細[" + i["衣装名"]["value"] + "]");
            for (var item in i) {
                $("#resultTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item))
                        .append($("<td></td>").text(i[item]["value"]))
                );
            }
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
    + "SELECT ?whose (group_concat(DISTINCT ?whose_name ; separator = ', ') as ?name)"
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
 * 対象者表示初期化
 */
function initMemberTable() {
    $("#memberTable").append(
        $("<tr></tr>")
            .append($("<th></th>").text("No."))
            .append($("<th></th>").text("名前"))
    );
}

/**
 * 対象者表示
 * @param {String} Subject 主語 
 */
function doMemberList(Subject) {
    // クエリビルド
    const search1 = escapeForSparql(Subject);
    // URL、クエリ結合
    const urlQuery = ADDRESS + encodeURIComponent(QUERY_CLOTHES_MEMBER[0] + search1 + QUERY_CLOTHES_MEMBER[1]);
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        // ヘッダ挿入
        initMemberTable();
        // 戻り値を表に入れる
        let index = 1;
        json.forEach(i => {
            $("#memberTable").append(
                $("<tr></tr>")
                    .append($("<th></th>").text(index))
                    .append($("<td></td>").append("<a href='/MySparql/imasparql/idolsearch/detail.html?s="
                        + i["whose"]["value"].replace("https://sparql.crssnky.xyz/imasrdf/RDFs/detail/", "")
                        + "' >" + i["name"]["value"] + "</a>"))
                    // .append($("<td></td>").text(i["name"]["value"]))
            );
            index++;
        });
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
    });
}