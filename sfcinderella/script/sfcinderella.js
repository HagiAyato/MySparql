var idolList;
var groupSize = [47, 47, 48, 48];
var grouptableId = ["#groupATable", "#groupBTable", "#groupCTable", "#groupDTable"];

// 概要関係
var groupOverviewId = ["#groupAOverview", "#groupBOverview", "#groupCOverview", "#groupDOverview"];

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
        changeEnable(true, "BTNMakeGroup");
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
    // getCSV("https://hagiayato.github.io/MySparql/sfcinderella/data/idol_list.csv");
    getCSV("/MySparql/sfcinderella/data/idol_list.csv");
}

/**
 * TRUE/FALSE => 有無
 * @param {String} flag 
 * @returns 有無
 */
function flagToUmu(flag) {
    return (flag == "TRUE" ? '有' : '無');
}

/**
 * TRUE/FALSE => trueのみ色付け
 * @param {String} flag 
 * @returns CSS
 */
function flagToBG(flag) {
    return (flag == "TRUE" ? " class='bgTrue'" : "");
}

/**
 * アイドルをグループごとに表示する
 */
function showIdolsOnGroup() {
    let groupIndex = 0;
    let idolCount = 0;
    let cntHasVoice = [0, 0, 0, 0], cntWithinRange = [0, 0, 0, 0], cntIsCG = [0, 0, 0, 0];
    grouptableId.forEach(id => {
        // 一度tbodyの中身を空にする
        $(id + " tbody").remove();
    });
    for (let index = 1; index < idolList.length; index++) {
        if (groupSize[groupIndex] <= idolCount) {
            idolCount = 0;
            groupIndex++;
        }
        idolCount++;
        $(grouptableId[groupIndex]).append(
            $("<tr></tr>")
                .append($("<th></th>").text(idolCount))
                .append($("<td class='bg" + idolList[index][1] + "'></td>").text(idolList[index][1]))
                .append($("<td></td>").text(idolList[index][2]))
                .append($("<td " + flagToBG(idolList[index][3]) + "></td>").text(flagToUmu(idolList[index][3])))
                .append($("<td " + flagToBG(idolList[index][4]) + "></td>").text(flagToUmu(idolList[index][4])))
                .append($("<td " + flagToBG(idolList[index][5]) + "></td>").text(flagToUmu(idolList[index][5])))
        );
        // カウント関係
        if (idolList[index][3] == "TRUE") cntHasVoice[groupIndex]++;
        if (idolList[index][4] == "TRUE") cntWithinRange[groupIndex]++;
        if (idolList[index][5] == "TRUE") cntIsCG[groupIndex]++;
    }
    // カウント結果
    for (let index = 0; index < groupOverviewId.length; index++) {
        $(groupOverviewId[index]).text("内訳=>ボイス有：" + cntHasVoice[index] + "人/" + ((cntHasVoice[index]/groupSize[index])*100).toFixed(1) + "%、圏内入り経験有：" + cntWithinRange[index] + "人/" + ((cntWithinRange[index]/groupSize[index])*100).toFixed(1) + "%、CG(1位)経験有：" + cntIsCG[index] + "人/" + ((cntIsCG[index]/groupSize[index])*100).toFixed(1) + "%");
    }
}

/**
 * グループ分け
 * 参考：https://gray-code.com/javascript/shuffle-for-item-of-array/#:~:text=%E3%82%92%E3%82%B7%E3%83%A3%E3%83%83%E3%83%95%E3%83%AB%E3%81%99%E3%82%8B-,%E9%85%8D%E5%88%97%E3%81%AE%E8%A6%81%E7%B4%A0%E3%82%92%E3%83%A9%E3%83%B3%E3%83%80%E3%83%A0%E3%81%AB%E4%B8%A6%E3%81%B3%E6%9B%BF%E3%81%88%E3%82%8B,%E3%81%99%E3%82%8B%E3%81%93%E3%81%A8%E3%81%8C%E3%81%A7%E3%81%8D%E3%81%BE%E3%81%99%E3%80%82
 */
function doMakeGroup() {
    changeEnable(false, "BTNMakeGroup");
    for (let i = 1; i < idolList.length; i++) {
        // 1〜配列最大の範囲で値を取得
        let j = Math.floor(Math.random() * (idolList.length - 2)) + 1;
        // console.log(i + ":" + j);
        // 要素の並び替えを実行
        let tmp = idolList[i];
        idolList[i] = idolList[j];
        idolList[j] = tmp;
    }
    showIdolsOnGroup();
    changeEnable(true, "BTNMakeGroup");
}
