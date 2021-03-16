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
            .append($("<th></th>").text("ブランド"))
            .append($("<th></th>").text("アイドル名"))
            .append($("<th></th>").text("アイドル名鑑(公式)"))
    );
}

// 定数定義
const URL = "https://sparql.crssnky.xyz/spql/imas/query?query=";
const Query =
    [// 1.SELECT
        Query_def
        + "SELECT ?s (group_concat(DISTINCT ?title ; separator = ', ') as ?titles) "
        + "(group_concat(DISTINCT ?name ; separator = ', ') as ?iName) ?idolListURL "
        + "WHERE {"
        + "  {"
        + "  ?s schema:name|schema:alternateName ?name"
        + "    FILTER( lang(?name) = 'ja' ",
        // 2,4.各種データ値
        ") . "
        + "  ?s rdf:type ?ctype . FILTER( ?ctype = imas:Idol ) "
        + "  OPTIONAL { ?s imas:Title ?title. } "
        + "  OPTIONAL { ?s imas:cv ?cv . FILTER( lang(?cv) = 'ja' ) } "
        + "  OPTIONAL { ?s imas:pastCv ?pastCv . FILTER( lang(?pastCv) = 'ja' ) } "
        + "  OPTIONAL { ?s imas:Division | imas:Type | imas:Category ?division. } "
        + "  OPTIONAL { ?s imas:BloodType ?bloodType . } "
        + "  OPTIONAL { ?s foaf:age ?age . } "
        + "  OPTIONAL { ?s schema:gender ?gender . } "
        + "  OPTIONAL { ?s schema:height ?height . } "
        + "  OPTIONAL { ?s schema:weight ?weight . } "
        + "  OPTIONAL { ?s imas:Handedness ?handedness. } "
        + "  OPTIONAL { ?s imas:Bust ?bust. } "
        + "  OPTIONAL { ?s imas:Waist ?waist. } "
        + "  OPTIONAL { ?s imas:Hip ?hip. } "
        + "  OPTIONAL { ?s imas:ShoeSize ?shoeSize. } "
        + "  OPTIONAL { ?s schema:birthDate ?birthDate . } "
        + "  OPTIONAL { ?s imas:Constellation ?constellation. } "
        + "  OPTIONAL { ?s schema:birthPlace ?birthPlace . } "
        + "  OPTIONAL { ?s imas:Hobby ?hobby. } "
        + "  OPTIONAL { ?s imas:Favorite ?favorite. } "
        + "  OPTIONAL { ?s imas:Talent ?talent. } "
        + "  OPTIONAL { ?s imas:Color ?color. } "
        + "  OPTIONAL { ?s imas:PopLinksAttribute ?popLinksAttribute . FILTER( lang(?popLinksAttribute) = 'ja' ) } "
        + "  OPTIONAL { ?s schema:description ?description . } "
        + "  OPTIONAL { ?s imas:IdolListURL ?idolListURL . } ",
        // 3.UNION～名前のみ検索
        "  }UNION{"
        + "  FILTER NOT EXISTS {?s schema:name|schema:alternateName ?fname} "
        + "  ?s schema:givenName ?name "
        + "    FILTER( lang(?name) = 'ja' ",
        // 5.集約とソート
        "  }"
        + "}"
        + "GROUP BY ?s ?cv ?bloodType ?birthDate ?constellation ?birthPlace ?color ?idolListURL "
        + "ORDER BY ?iName"];

// HTTPリクエスト
const request = new XMLHttpRequest();

/**
 * 検索処理本体
 */
function doIdolSearch() {
    // 通信準備
    const nameInput = $("#idolName").val();
    const search0 = " && regex(?name, '" + escapeForSparql(nameInput) + "', 'i')";
    const search1 = (nameInput != "") ? search0 : "";
    request.open("GET", URL + encodeURIComponent(Query[0] + search1 + Query[1] + Query[2] + search1 + Query[1] + Query[3]));
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
        // 戻り値を表に入れる
        json.forEach(i => {
            $("#resultTable").append(
                $("<tr></tr>")
                    .append($("<th></th>").text(index))
                    .append($("<td></td>").text(i["titles"]["value"]))
                    .append($("<td></td>").append("<a href='/MySparql/imasparql/idolsearch/detail.html?s="
                        + i["s"]["value"].replace("https://sparql.crssnky.xyz/imasrdf/RDFs/detail/", "")
                        + "' target='_blank'>" + i["iName"]["value"] + "</a>"))
                    .append($("<td></td>").append((("idolListURL" in i)
                        ? ("<a href=" + i["idolListURL"]["value"] + " target='_blank'>Link</a>") : ("---"))))
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