//　共通コード

/**
 * ページ表示時処理
 */
window.onload = function () {
    // CSV読み込み
    getCSV();
}

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

// csv読み込み
// コード参考：https://uxmilk.jp/11586

/**
 * csvを読み込む
 */
function getCSV() {
    var request = new XMLHttpRequest();
    request.open("get", "/data/idol_list.csv", true);
    request.send(null); // HTTPリクエストの発行
    request.onload = function () {
        convertCSVtoArray(request.responseText);
    }
}

/**
 * csv文字列を配列化する関数
 * @param {string} csvText csv文字列
 */
function convertCSVtoArray(csvText) {
    var result = [];
    var tmp = csvText.split("\n");

    for (var i = 0; i < tmp.length; ++i) {
        result[i] = tmp[i].split(',');
    }
}