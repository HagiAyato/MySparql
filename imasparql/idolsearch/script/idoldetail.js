/**
 * ページ表示時処理
 */
 window.onload = function () {
    const idolName = getParam('idolName');
    if(idolName == null|| idolName == "")location.href="/MySparql/imasparql/idolsearch/";
    $("#idolName").text("アイドル詳細[" + idolName + "]");
    // アイドル詳細読み込み
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