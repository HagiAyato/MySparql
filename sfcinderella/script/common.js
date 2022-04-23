//　共通コード

/**
 * ページ表示時処理
 */
window.onload = function () {
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