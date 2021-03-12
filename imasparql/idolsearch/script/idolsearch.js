/**
 * ページ表示時処理
 */
window.onload = function () {
    initResultTable();
}

/**
 * 検索結果初期化
 */
function initResultTable() {
    $("#resultTable").append(
        $("<tr></tr>")
            .append($("<th></th>").text("№"))
            .append($("<td></td>").text("ブランド"))
            .append($("<td></td>").text("アイドル名"))
            .append($("<td></td>").text("アイドル名鑑(公式)"))
    );
}

// 検索フォームの有効/無効
const isEnableInput = {
    "sw_idolName": true
}

/**
 * フォームの有効無効切り替え
 * @param {string} swID スイッチのID
 * @param {string} inputID input要素のID
 * @param {boolean} isEnabled 有効/無効
 */
function OnChangeInputEnable(swID, inputID, isEnabled) {
    isEnableInput[swID] = isEnabled;
    $("#" + inputID).prop("disabled", !isEnableInput[swID])
}

// 定数定義
const URL = "https://sparql.crssnky.xyz/spql/imas/query?query=";
const Query =
    ["PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>"
        + "PREFIX schema: <http://schema.org/>"
        + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>"
        + "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"
        + "SELECT DISTINCT *"
        + "WHERE {"
        + "  ?s schema:name|schema:alternateName ?name"
        + "    FILTER( lang(?name) = 'ja' ",
    ") ."
    + "  ?s rdf:type ?ctype . FILTER( ?ctype = imas:Idol )"
    + "  OPTIONAL { ?s imas:Title ?title. }"
    + "  OPTIONAL { ?s imas:cv ?cv . FILTER( lang(?cv) = 'ja' ) }"
    + "  OPTIONAL { ?s imas:Division ?division1. }"
    + "  OPTIONAL { ?s imas:Type ?division2. }"
    + "  OPTIONAL { ?s imas:Category ?division3. }"
    + "  OPTIONAL { ?s imas:BloodType ?bloodType . }"
    + "  OPTIONAL { ?s foaf:age ?age . }"
    + "  OPTIONAL { ?s schema:height ?height . }"
    + "  OPTIONAL { ?s schema:weight ?weight . }"
    + "  OPTIONAL { ?s imas:Handedness ?handedness. }"
    + "  OPTIONAL { ?s imas:Bust ?bust. }"
    + "  OPTIONAL { ?s imas:Waist ?waist. }"
    + "  OPTIONAL { ?s imas:Hip ?hip. }"
    + "  OPTIONAL { ?s imas:ShoeSize ?shoeSize. }"
    + "  OPTIONAL { ?s schema:birthDate ?birthDate . }"
    + "  OPTIONAL { ?s imas:Constellation ?constellation. }"
    + "  OPTIONAL { ?s schema:birthPlace ?birthPlace . }"
    + "  OPTIONAL { ?s schema:description ?description . }"
    + "  OPTIONAL { ?s imas:IdolListURL ?idolListURL . }"
    + "}"];

// HTTPリクエスト
const request = new XMLHttpRequest();

/**
 * 検索処理本体
 */
function doIdolSearch() {
    // 通信準備
    const nameInput = $("#idolName").val();
    const search1 = " && regex(?name, '" + nameInput + "', 'i')";
    request.open("GET", URL + encodeURIComponent(Query[0] + ((nameInput != "" && isEnableInput["sw_idolName"]) ? search1 : "") + Query[1]));
    // 通信実行
    request.send();
    // 通信成功
    request.addEventListener("load", (e) => {
        // サーバでの処理失敗判定
        if (e.target.status != 200) {
            console.log(e.target.status + ':' + e.target.statusText);
            alert("検索に失敗しました。");
            return;
        }
        // 一度divの中身を空にする
        $("#resultTable tr").remove();
        // JSON分解
        const json = JSON.parse(e.target.responseText)["results"]["bindings"];
        let index = 1;
        // ヘッダ挿入
        initResultTable();
        json.forEach(i => {
            $("#resultTable").append(
                $("<tr></tr>")
                    .append($("<th></th>").text(index))
                    .append($("<td></td>").text(i["title"]["value"]))
                    .append($("<td></td>").text(i["name"]["value"]))
                    .append($("<td></td>").append((("idolListURL" in i)
                        ? ("<a href=" + i["idolListURL"]["value"] + ">Link</a>") : ("---"))))
            );
            index++;
        });
    });
    // 通信失敗
    request.addEventListener("error", () => {
        console.log("Http Request Error");
        alert("通信に失敗しました。");
    });
}