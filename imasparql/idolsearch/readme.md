# im@s アイドル・人物検索 (by im@sparql)

## 概要

このWebアプリは、[im@sparql](https://sparql.crssnky.xyz/imas/)を利用して、アイドルマスターシリーズのアイドルや関連人物情報を検索・表示するツールです。  
`imasparql/idolsearch` フォルダ配下の各HTML/JSファイルが画面・機能ごとに分かれており、SPARQLクエリを用いてデータ取得・表示を行います。

---

## 主な機能

- **アイドル検索・一覧表示**
- **詳細情報表示（プロフィール、誕生日、血液型など）**
- **衣装・ユニット情報表示**
- **関連リンク生成（Wikipedia, RDFリンク等）**

---

## フォルダ構成

```
imasparql/
└─ idolsearch/
    ├─ index.html           ... トップページ・検索画面
    ├─ detail.html          ... アイドル詳細情報画面
    ├─ clothesdetail.html   ... 衣装詳細情報画面
    ├─ unitdetail.html      ... ユニット詳細情報画面
    ├─ script/
    │   ├─ common.js        ... 共通処理JS（SPARQL実行・UI操作など）
    │   ├─ idolsearch.js    ... 検索画面用JS
    │   ├─ detail.js        ... 詳細画面用JS
    │   ├─ clothesdetail.js ... 衣装詳細画面用JS
    │   ├─ unitdetail.js    ... ユニット詳細画面用JS
    └─ style.css            ... 共通スタイル
```

---

## 使い方

1. ブラウザで `index.html` を開き、検索条件を入力して検索ボタンを押します。
2. 検索結果からアイドルや人物を選択すると、詳細情報画面へ遷移します。
3. 詳細画面ではプロフィールや関連リンク、衣装・ユニット情報などを閲覧できます。

---

## 技術情報

- **データ取得**: [im@sparql](https://sparql.crssnky.xyz/imas/) のSPARQLエンドポイントを利用
- **フロントエンド**: HTML, CSS, JavaScript (jQuery)
- **共通処理**: `script/common.js` にてSPARQL実行・UI操作・テーブル操作などを関数化

---

## 補足

- 本アプリは有志による非公式ファンツールです。
- データはim@sparqlのRDFデータを元にしています。
