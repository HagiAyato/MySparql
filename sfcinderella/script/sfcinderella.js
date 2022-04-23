var idolList;
var groupSize = [47, 47, 48, 48];
var grouptableId = ["#groupATable", "#groupBTable", "#groupCTable", "#groupDTable"];

// csv読み込み
// コード参考：https://uxmilk.jp/11586

/**
 * csvを読み込む
 * @param {string} path csvのパス
 */
function getCSV(path) {
    var request = new XMLHttpRequest();
    request.open("get", path, true);
    request.send(null); // HTTPリクエストの発行
    request.onload = function () {
        convertCSVtoArray(request.responseText);
        // アイドル一覧表示
        showIdolsOnGroup();
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
    idolList = result;
}

/**
 * ページ表示時処理
 */
window.onload = function () {
    changeEnable(false, "BTNMakeGroup");
    loadIdolData();
}

/**
 * 最初のデータ読み込み～表示
 */
function loadIdolData() {
    // CSV読み込み
    getCSV("https://hagiayato.github.io/MySparql/sfcinderella/data/idol_list.csv");
}

/**
 * TRUE/FALSE => 有無
 * @param {String} flag 
 * @returns 有無
 */
function flagToUmu(flag) {
    return (flag = "TRUE" ? '有' : '無');
}

/**
 * アイドルをグループごとに表示する
 */
function showIdolsOnGroup() {
    let groupIndex = 0;
    let idolCount = 0;
    for (let index = 1; index < idolList.length; index++) {
        if (groupSize[groupIndex] <= idolCount) {
            idolCount = 0;
            groupIndex++;
        }
        $(grouptableId[groupIndex]).append(
            $("<tr></tr>")
                .append($("<th></th>").text(index))
                .append($("<td></td>").text(idolList[index][1]))
                .append($("<td></td>").text(idolList[index][2]))
                .append($("<td></td>").text(flagToUmu(idolList[index][3])))
                .append($("<td></td>").text(flagToUmu(idolList[index][4])))
                .append($("<td></td>").text(flagToUmu(idolList[index][5])))
        );
        idolCount++;
    }
    changeEnable(true, "BTNMakeGroup");
}

/**
 * グループ分け
 */
function doMakeGroup(){
    
}