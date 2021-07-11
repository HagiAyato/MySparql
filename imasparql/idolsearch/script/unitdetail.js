/**
 * ページ表示時処理
 */
window.onload = function () {
    const Subject = getParam('s');
    if (Subject == null || Subject == "") location.href = "/MySparql/imasparql/idolsearch/";
    // アイドル詳細読み込み
    doUnitDetail(Subject);
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
 * ユニット詳細表示
 * @param {String} Subject 主語 
 */
function doUnitDetail(Subject) {
    // クエリビルド
    const search1 = escapeForSparql(Subject);
    // URL、クエリ結合
    const urlQuery = ADDRESS + encodeURIComponent(QUERY_UNIT[0] + search1 + QUERY_UNIT[1]);
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        // ヘッダ挿入
        initResultTable();
        // 戻り値を表に入れる
        json.forEach(i => {
            $("#unitName").text("ユニット詳細[" + i["ユニット名"]["value"] + "]");
            for (var item in i) {
                // item名称により分岐
                switch (true) {
                    case /^シンボルカラー$/.test(item):
                        //シンボルカラー
                        $("#resultTable").append(
                            $("<tr></tr>")
                                .append($("<th></th>").text(item))
                                .append($("<td></td>")
                                    .append("#" + i[item]["value"] + "<div class='col-xs-6' style='background-color:#" + i[item]["value"] + ";height:20px;'></div>"))
                        );
                        break;
                    default:
                        $("#resultTable").append(
                            $("<tr></tr>")
                                .append($("<th></th>").text(item))
                                .append($("<td></td>").text(i[item]["value"]))
                        );
                        break;
                }
            }
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
    + "SELECT ?member (group_concat(DISTINCT ?member_name ; separator = ', ') as ?name) "
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
    const urlQuery = ADDRESS + encodeURIComponent(QUERY_UNIT_MEMBER[0] + search1 + QUERY_UNIT_MEMBER[1]);
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
                        + i["member"]["value"].replace("https://sparql.crssnky.xyz/imasrdf/RDFs/detail/", "")
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