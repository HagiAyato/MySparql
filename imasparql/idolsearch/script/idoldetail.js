/**
 * ページ表示時処理
 */
window.onload = function () {
    const Subject = getParam('s');
    if (Subject == null || Subject == "") location.href = "/MySparql/imasparql/idolsearch/";
    // アイドル詳細読み込み
    makeRDFLink(Subject);
    doIdolDetail(Subject);
    doIdolColl(Subject);
    doIdolUnit(Subject);
    doIdolClothes(Subject);
    doIdolEvent(Subject);
    doMusicRecordingEvent(Subject);
    doScriptTextEvent(Subject);
}

// 定数定義
const QUERY_DETAIL =
    [// 1.定義
        Query_def
        + "PREFIX idol: <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/",
        // 2.SELECT
        "> "
        + "SELECT (group_concat(DISTINCT ?nameKana ; separator = ', ') as ?名前ふりがな) (group_concat(DISTINCT ?name ; separator = ', ') as ?名前)"
        + "  (group_concat(DISTINCT ?eName ; separator = ', ') as ?NAME) (group_concat(DISTINCT ?sibling ; separator = ', ') as ?兄弟姉妹) "
        + "  (group_concat(DISTINCT ?title ; separator = ', ') as ?ブランド) "
        + "  (group_concat(DISTINCT ?cv ; separator = ', ') as ?キャスト) (group_concat(DISTINCT ?pastCv ; separator = ', ') as ?過去のキャスト) "
        + "  (group_concat(DISTINCT ?division ; separator = ', ') as ?属性) (group_concat(DISTINCT ?position ; separator = ', ') as ?役職) "
        + "  (?bloodType as ?血液型) (Max(?age) as ?年齢) (group_concat(DISTINCT ?schoolGrade ; separator = ', ') as ?学年) "
        + "  (group_concat(DISTINCT ?gender ; separator = ', ') as ?性別／gender) (Max(?height) as ?身長_cm) (Max(?weight) as ?体重_kg) "
        + "  (group_concat(DISTINCT ?handedness ; separator = ', ') as ?利き手／handness) "
        + "  (Max(?bust) as ?バスト_cm) (Max(?waist) as ?ウエスト_cm) (Max(?hip) as ?ヒップ_cm) (Max(?shoeSize) as ?靴のサイズ_cm) "
        + "  (?birthDate as ?誕生日) (?constellation as ?星座) (?birthPlace as ?出身地) "
        + "  (group_concat(DISTINCT ?hobby ; separator = ', ') as ?趣味) (group_concat(DISTINCT ?favorite ; separator = ', ') as ?好きなもの・こと) "
        + "  (group_concat(DISTINCT ?talent ; separator = ', ') as ?特技) (?color as ?シンボルカラー) (?idolListURL as ?アイドル名鑑リンク) "
        + "  (group_concat(DISTINCT ?description ; separator = ', ') as ?説明) "
        + "  (group_concat(DISTINCT ?popLinksAttribute ; separator = ', ') as ?ポプマス属性) (group_concat(DISTINCT ?ePopLinksAttribute ; separator = ', ') as ?POPLINKS_Attribute) ?ctype "
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
        "  idol: rdf:type ?ctype . FILTER( ?ctype = imas:Idol || ?ctype = imas:Staff ) "
        + "  OPTIONAL { idol: schema:sibling ?sibling. } "
        + "  OPTIONAL { idol: imas:Brand ?title. } "
        + "  OPTIONAL { idol: imas:cv ?cv . FILTER( lang(?cv) = 'ja' ) } "
        + "  OPTIONAL { idol: imas:pastCv ?pastCv . FILTER( lang(?pastCv) = 'ja' ) } "
        + "  OPTIONAL { idol: imas:Division | imas:Type | imas:Category ?division. } "
        + "  OPTIONAL { idol: schema:position ?position. } "
        + "  OPTIONAL { idol: imas:BloodType ?bloodType . } "
        + "  OPTIONAL { idol: foaf:age ?age . } "
        + "  OPTIONAL { idol: imas:SchoolGrade ?schoolGrade . } "
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
        + "GROUP BY ?cv ?bloodType ?birthDate ?constellation ?birthPlace ?color ?idolListURL ?ctype"];

// HTTPリクエスト
const request = new XMLHttpRequest();

/**
 * 詳細表示処理1
 * @param {String} Subject 主語 
 */
function doIdolDetail(Subject) {
    // クエリビルド
    const search1 = escapeForSparql(Subject);
    // URL、クエリ結合
    const urlQuery = ADDRESS + encodeURIComponent(QUERY_DETAIL[0] + search1 + QUERY_DETAIL[1] + QUERY_DETAIL[2] + QUERY_DETAIL[4]);
    // 通信実行
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        if (Object.keys(json).length < 1) {
            // 名前のみでもう一回検索
            const urlQuery2 = ADDRESS + encodeURIComponent(QUERY_DETAIL[0] + search1 + QUERY_DETAIL[1] + QUERY_DETAIL[3] + QUERY_DETAIL[4]);
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

/**
 * 詳細表示処理2
 * @param {json} json アイドルデータ
 */
function showDetail(json) {
    // ヘッダ挿入
    init2ColumnsTable("#detailTable", "項目", "情報");
    // 戻り値を表に入れる
    json.forEach(i => {
        $("#idolName").text((/Idol/.test(i["ctype"]["value"]) ? "アイドル" : "人物") + "詳細[" + i["名前"]["value"] + "]");
        writeDetailTable(i);
    });
}

// 定数定義
const QUERY_CALL =
    [Query_def + "PREFIX idol: <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/> "
        + "SELECT ?callee (group_concat(DISTINCT ?name; separator = ', ') as ?name2) "
        + "(group_concat(DISTINCT ?gName; separator = ', ') as ?gName2) "
        + "(group_concat(DISTINCT ?called; separator = ', ') as ?call) "
        + "WHERE { "
        + "  ?s rdf:type imas:CallName. "
        + "  ?s imas:Source idol:",
    ". "
    + "  ?s imas:Source ?caller. "
    + "  ?s imas:Destination ?callee. "
    + "  ?s imas:Called ?called. "
    + "  OPTIONAL { ?callee schema:name|schema:alternateName ?name FILTER( lang(?name) = 'ja'). } "
    + "  ?callee schema:givenName ?gName FILTER( lang(?gName) = 'ja'). "
    + "} "
    + "GROUP BY ?name2 ?gName2 ?callee "
    + "ORDER BY ?name2 ?gName2 "];

/**
 * アイドル呼称表示初期化
 */
function initCallTable() {
    $("#callTable").append("<thead><tr><th>№</th><th>呼ぶアイドル・人物</th><th>呼称</th></tr></thead>");
}

/**
 * アイドル呼称表示処理1
 * @param {String} Subject 主語 
 */
function doIdolColl(Subject) {
    // クエリビルド
    const search1 = escapeForSparql(Subject);
    // URL、クエリ結合
    const urlQuery = ADDRESS + encodeURIComponent(QUERY_CALL[0] + search1 + QUERY_CALL[1]);
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        // ヘッダ挿入
        initCallTable();
        // 戻り値を表に入れる
        let index = 1;
        json.forEach(i => {
            let name = ("name2" in i)?i["name2"]["value"]:i["gName2"]["value"];
            $("#callTable").append(
                $("<tr></tr>")
                    .append($("<th></th>").text(index))
                    .append($("<td></td>").append("<a href='/MySparql/imasparql/idolsearch/detail.html?s="
                        + encodeURIComponent(i["callee"]["value"].replace("https://sparql.crssnky.xyz/imasrdf/RDFs/detail/", ""))
                        + "' >" + name + "</a>"))
                    .append($("<td></td>").text(i["call"]["value"]))
            );
            index++;
        });
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
    });
}

// 定数定義
const QUERY_UNIT =
    [Query_def + "PREFIX idol: <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/> "
        + "SELECT ?s ?name "
        + "WHERE { "
        + "  ?s rdf:type imas:Unit. "
        + "  ?s schema:member idol:",
    ". "
    + "  ?s schema:name ?name. "
    + "} "
    + "ORDER BY ?name "];

/**
 * ユニット名表示処理1
 * @param {String} Subject 主語 
 */
function doIdolUnit(Subject) {
    // クエリビルド
    const search1 = escapeForSparql(Subject);
    // URL、クエリ結合
    const urlQuery = ADDRESS + encodeURIComponent(QUERY_UNIT[0] + search1 + QUERY_UNIT[1]);
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        // ヘッダ挿入
        init2ColumnsTable("#unitTable", "№", "ユニット名");
        // 戻り値を表に入れる
        writeLinkName(json, "#unitTable", "unitdetail.html");
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
    });
}

// 定数定義
const QUERY_CLOTHES =
    [Query_def + "PREFIX idol: <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/> "
        + "SELECT ?s ?name "
        + "WHERE { "
        + "  ?s rdf:type imas:Clothes. "
        + "  ?s imas:Whose idol:",
    ". "
    + "  ?s schema:name ?name. "
    + "} "
    + "ORDER BY ?name "];

/**
 * 衣装表示処理1
 * @param {String} Subject 主語 
 */
function doIdolClothes(Subject) {
    // クエリビルド
    const search1 = escapeForSparql(Subject);
    // URL、クエリ結合
    const urlQuery = ADDRESS + encodeURIComponent(QUERY_CLOTHES[0] + search1 + QUERY_CLOTHES[1]);
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        // ヘッダ挿入
        init2ColumnsTable("#clothesTable", "№", "衣装名");
        // 戻り値を表に入れる
        writeLinkName(json, "#clothesTable", "clothesdetail.html");
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
    });
}

// 定数定義
const QUERY_EVENT =
    [Query_def + "PREFIX idol: <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/> "
        + "SELECT ?s ?name "
        + "WHERE { "
        + "  ?s rdf:type imas:Event. "
        + "  ?s schema:actor idol:",
    ". "
    + "  ?s schema:name ?name. "
    + "} "
    + "ORDER BY ?name "];

/**
 * イベント表示処理1
 * @param {String} Subject 主語 
 */
function doIdolEvent(Subject) {
    // クエリビルド
    const search1 = escapeForSparql(Subject);
    // URL、クエリ結合
    const urlQuery = ADDRESS + encodeURIComponent(QUERY_EVENT[0] + search1 + QUERY_EVENT[1]);
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        // ヘッダ挿入
        init2ColumnsTable("#eventTable", "№", "イベント名");
        // 戻り値を表に入れる
        writeName(json, "#eventTable");
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
    });
}

// 定数定義
const QUERY_MUSIC_RACORDING =
    [Query_def + "PREFIX idol: <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/> "
        + "SELECT ?s ?name "
        + "WHERE { "
        + "  ?s rdf:type schema:MusicRecording. "
        + "  ?s schema:byArtist idol:",
    ". "
    + "  ?s schema:name ?name. "
    + "} "
    + "ORDER BY ?name "];

/**
 * 参加楽曲表示処理1
 * @param {String} Subject 主語 
 */
function doMusicRecordingEvent(Subject) {
    // クエリビルド
    const search1 = escapeForSparql(Subject);
    // URL、クエリ結合
    const urlQuery = ADDRESS + encodeURIComponent(QUERY_MUSIC_RACORDING[0] + search1 + QUERY_MUSIC_RACORDING[1]);
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        // ヘッダ挿入
        init2ColumnsTable("#musicRecordingTable", "№", "曲名");
        // 戻り値を表に入れる
        writeName(json, "#musicRecordingTable");
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
    });
}

// 定数定義
const QUERY_SCRIPT_TEXT =
    [Query_def + "PREFIX idol: <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/> "
        + "SELECT ?s ?name "
        + "WHERE { "
        + "  ?s rdf:type imas:ScriptText. "
        + "  ?s imas:Source idol:",
    ". "
    + "  ?s schema:text ?name. "
    + "} "
    + "ORDER BY ?name "];

/**
 * 台詞表示処理1
 * @param {String} Subject 主語 
 */
function doScriptTextEvent(Subject) {
    // クエリビルド
    const search1 = escapeForSparql(Subject);
    // URL、クエリ結合
    const urlQuery = ADDRESS + encodeURIComponent(QUERY_SCRIPT_TEXT[0] + search1 + QUERY_SCRIPT_TEXT[1]);
    promiseSparqlRequest(urlQuery).then(json => {
        // 通信成功
        // ヘッダ挿入
        init2ColumnsTable("#scriptTextTable", "№", "台詞");
        // 戻り値を表に入れる
        writeName(json, "#scriptTextTable");
    }).catch(error => {
        // 通信失敗
        alert('エラーが発生しました：' + error);
    });
}