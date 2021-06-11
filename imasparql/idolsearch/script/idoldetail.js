/**
 * ページ表示時処理
 */
window.onload = function () {
    const Subject = getParam('s');
    if (Subject == null || Subject == "") location.href = "/MySparql/imasparql/idolsearch/";
    // アイドル詳細読み込み
    doIdolDetail(Subject);
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

/**
 * 検索結果初期化
 */
function initResultTable() {
    $("#resultTable").append(
        $("<tr></tr>")
            .append($("<th></th>").text("項目"))
            .append($("<th></th>").text("プロフィール"))
    );
}

// 定数定義
const URL = "https://sparql.crssnky.xyz/spql/imas/query?query=";
const Query =
    [// 1.定義
        Query_def
        + "PREFIX idol: <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/",
        // 2.SELECT
        "> "
        + "SELECT (group_concat(DISTINCT ?nameKana ; separator = ', ') as ?アイドル名ふりがな) (group_concat(DISTINCT ?name ; separator = ', ') as ?アイドル名)"
        + "  (group_concat(DISTINCT ?eName ; separator = ', ') as ?IDOL_NAME) (group_concat(DISTINCT ?title ; separator = ', ') as ?ブランド) "
        + "  (group_concat(DISTINCT ?cv ; separator = ', ') as ?キャスト) (group_concat(DISTINCT ?pastCv ; separator = ', ') as ?過去のキャスト) "
        + "  (group_concat(DISTINCT ?division ; separator = ', ') as ?属性) "
        + "  (?bloodType as ?血液型) (Max(?age) as ?年齢) (group_concat(DISTINCT ?gender ; separator = ', ') as ?性別／gender) "
        + "  (Max(?height) as ?身長_cm) (Max(?weight) as ?体重_kg) "
        + "  (group_concat(DISTINCT ?handedness ; separator = ', ') as ?利き手／handness) "
        + "  (Max(?bust) as ?バスト_cm) (Max(?waist) as ?ウエスト_cm) (Max(?hip) as ?ヒップ_cm) (Max(?shoeSize) as ?靴のサイズ_cm) "
        + "  (?birthDate as ?誕生日) (?constellation as ?星座) (?birthPlace as ?出身地) "
        + "  (group_concat(DISTINCT ?hobby ; separator = ', ') as ?趣味) (group_concat(DISTINCT ?favorite ; separator = ', ') as ?好きなもの・こと) "
        + "  (group_concat(DISTINCT ?talent ; separator = ', ') as ?特技) (?color as ?シンボルカラー) (?idolListURL as ?アイドル名鑑リンク) "
        + "  (group_concat(DISTINCT ?description ; separator = ', ') as ?説明) "
        + "  (group_concat(DISTINCT ?popLinksAttribute ; separator = ', ') as ?ポプマス属性) (group_concat(DISTINCT ?ePopLinksAttribute ; separator = ', ') as ?POPLINKS_Attribute)"
        + "WHERE { "
        + "  { ",
        // 3A.名前　通常
        "  idol: schema:name|schema:alternateName ?name FILTER( lang(?name) = 'ja') . "
        + "  OPTIONAL { idol: schema:name|schema:alternateName ?eName FILTER( lang(?eName) = 'en') . } "
        + "  OPTIONAL { idol: imas:nameKana|imas:alternateNameKana ?nameKana. } ",
        // 3B.名前　苗字なし
        "  FILTER NOT EXISTS {idol: schema:name|schema:alternateName ?fname} "
        + "  idol: schema:givenName ?name FILTER( lang(?name) = 'ja') . "
        + "  OPTIONAL { idol: schema:givenName ?eName FILTER( lang(?eName) = 'en') . } "
        + "  OPTIONAL { idol: imas:givenNameKana ?nameKana. } ",
        // 4.各種データ値
        "  idol: rdf:type ?ctype . FILTER( ?ctype = imas:Idol ) "
        + "  OPTIONAL { idol: imas:Brand ?title. } "
        + "  OPTIONAL { idol: imas:cv ?cv . FILTER( lang(?cv) = 'ja' ) } "
        + "  OPTIONAL { idol: imas:pastCv ?pastCv . FILTER( lang(?pastCv) = 'ja' ) } "
        + "  OPTIONAL { idol: imas:Division | imas:Type | imas:Category ?division. } "
        + "  OPTIONAL { idol: imas:BloodType ?bloodType . } "
        + "  OPTIONAL { idol: foaf:age ?age . } "
        + "  OPTIONAL { idol: schema:gender ?gender . } "
        + "  OPTIONAL { idol: schema:height ?height . } "
        + "  OPTIONAL { idol: schema:weight ?weight . } "
        + "  OPTIONAL { idol: imas:Handedness ?handedness. } "
        + "  OPTIONAL { idol: imas:Bust ?bust. } "
        + "  OPTIONAL { idol: imas:Waist ?waist. } "
        + "  OPTIONAL { idol: imas:Hip ?hip. } "
        + "  OPTIONAL { idol: imas:ShoeSize ?shoeSize. } "
        + "  OPTIONAL { idol: schema:birthDate ?birthDate . } "
        + "  OPTIONAL { idol: imas:Constellation ?constellation. } "
        + "  OPTIONAL { idol: schema:birthPlace ?birthPlace . } "
        + "  OPTIONAL { idol: imas:Hobby ?hobby. } "
        + "  OPTIONAL { idol: imas:Favorite ?favorite. } "
        + "  OPTIONAL { idol: imas:Talent ?talent. } "
        + "  OPTIONAL { idol: imas:Color ?color. } "
        + "  OPTIONAL { idol: imas:PopLinksAttribute ?popLinksAttribute . FILTER( lang(?popLinksAttribute) = 'ja' ) } "
        + "  OPTIONAL { idol: imas:PopLinksAttribute ?ePopLinksAttribute . FILTER( lang(?ePopLinksAttribute) = 'en' ) } "
        + "  OPTIONAL { idol: schema:description ?description . } "
        + "  OPTIONAL { idol: imas:IdolListURL ?idolListURL . } "
        + "  } "
        + "} "
        + "GROUP BY ?cv ?bloodType ?birthDate ?constellation ?birthPlace ?color ?idolListURL"];

// HTTPリクエスト
const request = new XMLHttpRequest();

/**
 * 検索処理本体
 * @param {String} Subject 主語 
 */
function doIdolDetail(Subject) {
    // クエリビルド
    const search1 = escapeForSparql(Subject);
    // URL、クエリ結合
    const urlQuery = URL + encodeURIComponent(Query[0] + search1 + Query[1] + Query[2] + Query[4]);
    // 通信実行
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        if (Object.keys(json).length < 1) {
            // 名前のみでもう一回検索
            const urlQuery2 = URL + encodeURIComponent(Query[0] + search1 + Query[1] + Query[3] + Query[4]);
            // 通信実行
            promiseSparqlRequest(urlQuery2).then(json => {
                showDetail(json);
            }).catch(error => {
                // 通信失敗
                alert('エラーが発生しました：' + error);
            });
        } else {
            showDetail(json);
        }
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
    });
}

function showDetail(json) {
    // 一度divの中身を空にする
    $("#resultTable tr").remove();
    // ヘッダ挿入
    initResultTable();
    // 戻り値を表に入れる
    json.forEach(i => {
        $("#idolName").text("アイドル詳細[" + i["アイドル名"]["value"] + "]");
        for (var item in i) {
            // item名称により分岐
            switch (true) {
                case /^.+_.+$/.test(item):
                    // 単位付きデータ
                    const val = i[item]["value"];
                    const unit = item.replace(/^.+_/, "");
                    $("#resultTable").append(
                        $("<tr></tr>")
                            .append($("<th></th>").text(item.replace(/_kg$/, "")))
                            .append($("<td></td>").text(val + (isNaN(val) ? "" : "[" + unit + "]")))
                    );
                    break;
                case /^年齢$/.test(item):
                    // 年齢
                    $("#resultTable").append(
                        $("<tr></tr>")
                            .append($("<th></th>").text(item))
                            .append($("<td></td>").text(i[item]["value"] + "歳"))
                    );
                    break;
                case /^性別／gender$/.test(item):
                    // 性別
                    let gender = i[item]["value"];
                    gender = (gender == "male" ? "男性／male" : (gender == "female" ? "女性／female" : gender))
                    $("#resultTable").append(
                        $("<tr></tr>")
                            .append($("<th></th>").text(item))
                            .append($("<td></td>").text(gender))
                    );
                    break;
                case /^利き手／handness$/.test(item):
                    // 利き手
                    let hand = i[item]["value"];
                    hand = (hand == "right" ? "右利き／right" : (hand == "left" ? "左利き／left" : (hand == "both" ? "両利き／both" : hand)))
                    $("#resultTable").append(
                        $("<tr></tr>")
                            .append($("<th></th>").text(item))
                            .append($("<td></td>").text(hand))
                    );
                    break;
                case /^血液型$/.test(item):
                    // 血液型
                    $("#resultTable").append(
                        $("<tr></tr>")
                            .append($("<th></th>").text(item))
                            .append($("<td></td>").text(i[item]["value"] + "型"))
                    );
                    break;
                case /^誕生日$/.test(item):
                    // 誕生日
                    $("#resultTable").append(
                        $("<tr></tr>")
                            .append($("<th></th>").text(item))
                            .append($("<td></td>").text(i[item]["value"].replace(/^--(\d+)-(\d+)/, "$1/$2")))
                    );
                    break;
                case /^シンボルカラー$/.test(item):
                    //シンボルカラー
                    $("#resultTable").append(
                        $("<tr></tr>")
                            .append($("<th></th>").text(item))
                            .append($("<td></td>")
                                .append("#" + i[item]["value"] + "<div class='col-xs-6' style='background-color:#" + i[item]["value"] + ";height:20px;'></div>"))
                    );
                    break;
                case /^アイドル名鑑リンク$/.test(item):
                    // リンク
                    $("#resultTable").append(
                        $("<tr></tr>")
                            .append($("<th></th>").text(item))
                            .append($("<td></td>").append("<a href=" + i[item]["value"] + " target='_blank'>Link</a>"))
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
}