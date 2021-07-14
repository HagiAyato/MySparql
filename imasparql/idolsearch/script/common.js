//　共通コード

/**
 * クエリの定義共通部分
 */
const ADDRESS = "https://sparql.crssnky.xyz/spql/imas/query?query=";
const Query_def = "PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>"
    + "PREFIX schema: <http://schema.org/>"
    + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>"
    + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>";

//　要素表示関係

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

// sparql実行関係

/**
 * Sparql向けのエスケープ処理
 * @param {string} param エスケープする文字列
 * @returns エスケープ処理後の文字列
 */
function escapeForSparql(param) {
    const converted = param
        .replace(/\\/g, '\\\\\\\\') // バックスラッシュ(正規表現、sparqlで2回エスケープする※2回"\"だとimasa@rql内部エラー)
        .replace(/'/g, "\\'") // シングルコーテーション
        .replace(/"/g, '\\"'); // ダブルコーテーション
    try {
        // 正規表現構文チェック
        new RegExp(converted);
        // 構文チェック成功->正規表現のまま
    } catch (e) {
        // 構文チェック失敗
        /* ここから下をやると、エスケープ処理が無効化される(はず) */
        converted = converted
            .replace(/\?/g, "\\\\?") // ?
            .replace(/\*/g, '\\\\*') // *
            .replace(/{/g, "\\\\{") // {
            .replace(/}/g, '\\\\}') // }
            .replace(/\(/g, "\\\\(") // (
            .replace(/\)/g, '\\\\)') // )
            .replace(/\[/g, "\\\\[") // [
            .replace(/\]/g, '\\\\]') // ]
            .replace(/\+/g, '\\\\+'); // +
    }
    return converted;
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
                console.log('[' + e.target.status + ']' + e.target.statusText);
                reject("検索に失敗しました。[" + e.target.status + '] Error');
                return;
            }
            resolve(JSON.parse(e.target.responseText)["results"]["bindings"]);
        });
        // 通信失敗
        request.addEventListener("error", () => {
            console.log("Http Request Error");
            reject("通信に失敗しました。");
        });
        // 通信失敗
        request.addEventListener("timeout", () => {
            console.log("Http Request Timeout");
            reject("通信がタイムアウトしました。");
        });
    });
}

// 詳細表示画面の処理集約

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

/**
 * 2列テーブルの初期化
 * @param {String} tableId テーブルID
 * @param {String} thName ヘッダ列名
 * @param {String} tdName 値列名
 */
function init2ColumnsTable(tableId, thName, tdName) {
    $(tableId).append(
        $("<tr></tr>")
            .append($("<th></th>").text(thName))
            .append($("<th></th>").text(tdName))
    );
}

/**
 * 詳細テーブルへのデータ書き込み
 * @param {Object} i Jsonデータ 
 */
function writeDetailTable(i) {
    for (var item in i) {
        // item名称により分岐
        switch (true) {
            case /^.+_.+$/.test(item):
                // 単位付きデータ
                const val = i[item]["value"];
                const unit = item.replace(/^.+_/, "");
                $("#detailTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item.replace(/_kg$/, "")))
                        .append($("<td></td>").text(val + (isNaN(val) ? "" : "[" + unit + "]")))
                );
                break;
            case /^年齢$/.test(item):
                // 年齢
                $("#detailTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item))
                        .append($("<td></td>").text(i[item]["value"] + "歳"))
                );
                break;
            case /^性別／gender$/.test(item):
                // 性別
                let gender = i[item]["value"];
                gender = (gender == "male" ? "男性／male" : (gender == "female" ? "女性／female" : gender))
                $("#detailTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item))
                        .append($("<td></td>").text(gender))
                );
                break;
            case /^利き手／handness$/.test(item):
                // 利き手
                let hand = i[item]["value"];
                hand = (hand == "right" ? "右利き／right" : (hand == "left" ? "左利き／left" : (hand == "both" ? "両利き／both" : hand)))
                $("#detailTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item))
                        .append($("<td></td>").text(hand))
                );
                break;
            case /^血液型$/.test(item):
                // 血液型
                $("#detailTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item))
                        .append($("<td></td>").text(i[item]["value"] + "型"))
                );
                break;
            case /^誕生日$/.test(item):
                // 誕生日
                $("#detailTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item))
                        .append($("<td></td>").text(i[item]["value"].replace(/^--(\d+)-(\d+)/, "$1/$2")))
                );
                break;
            case /^シンボルカラー$/.test(item):
                //シンボルカラー
                $("#detailTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item))
                        .append($("<td></td>")
                            .append("#" + i[item]["value"] + "<div class='col-xs-6' style='background-color:#" + i[item]["value"] + ";height:20px;'></div>"))
                );
                break;
            case /^アイドル名鑑リンク$/.test(item):
                // リンク
                $("#detailTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item))
                        .append($("<td></td>").append("<a href=" + i[item]["value"] + " target='_blank'>Link</a>"))
                );
                break;
            case /^キャスト$/.test(item):
                // キャスト
                $("#detailTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item))
                        .append($("<td></td>").append("<a href=https://ja.wikipedia.org/wiki/"
                            + i[item]["value"] + " target='_blank'>" + i[item]["value"] + "</a>"))
                );
                break;
            case /^兄弟姉妹$/.test(item):
                // 兄弟姉妹
                let tdVal = "";
                i[item]["value"].split(', ').forEach(sibling => {
                    let name = sibling.replace("https://sparql.crssnky.xyz/imasrdf/RDFs/detail/", "");
                    tdVal += "<a href=https://hagiayato.github.io/MySparql/imasparql/idolsearch/detail.html?s=" + encodeURIComponent(name) + " >" + name + "</a> ";
                });
                $("#detailTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item))
                        .append($("<td></td>").append(tdVal))
                );
                break;
            case /^ctype$/.test(item):
                // ctype:表には出さず、ページの文字切替に使用
                break;
            default:
                $("#detailTable").append(
                    $("<tr></tr>")
                        .append($("<th></th>").text(item))
                        .append($("<td></td>").text(i[item]["value"]))
                );
                break;
        }
    }
}

/**
 * 任意のテーブルに、名称一覧+そのリンクを書き込み
 * @param {Object} json データファイル
 * @param {String} tableName 対象テーブル名
 * @param {String} htmlName リンク先のHTMLファイル名
 */
function writeLinkName(json, tableName, htmlName) {
    let index = 1;
    json.forEach(i => {
        $(tableName).append(
            $("<tr></tr>")
                .append($("<th></th>").text(index))
                .append($("<td></td>").append("<a href='/MySparql/imasparql/idolsearch/" + htmlName + "?s="
                    + encodeURIComponent(i["s"]["value"].replace("https://sparql.crssnky.xyz/imasrdf/RDFs/detail/", ""))
                    + "' >" + i["name"]["value"] + "</a>"))
        );
        index++;
    });
}

/**
 * 任意のテーブルに、名称一覧を書き込み
 * @param {Object} json データファイル
 * @param {String} tableName 対象テーブル名
 */
function writeName(json, tableName) {
    let index = 1;
    json.forEach(i => {
        $(tableName).append(
            $("<tr></tr>")
                .append($("<th></th>").text(index))
                .append($("<td></td>").text(i["name"]["value"]))
        );
        index++;
    });
}