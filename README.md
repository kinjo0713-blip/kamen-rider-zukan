# 仮面ライダー図鑑

歴代の仮面ライダーを検索・閲覧できる、ファン作成の非公式図鑑サイトです。
HTML / CSS / JavaScript だけで動く静的サイトなので、GitHub Pages でそのまま公開できます。

## 構成

- `index.html` … ページ本体
- `style.css` … 見た目
- `app.js` … 一覧表示・検索・時代絞り込み・詳細表示
- `data/riders.json` … ライダーのデータ

## ライダーを追加する

`data/riders.json` に次の形の項目を足します。

```json
{
  "id": "kuuga",
  "name": "仮面ライダークウガ",
  "series": "仮面ライダークウガ",
  "year": 2000,
  "era": "平成",
  "transformer": "五代雄介",
  "actor": "オダギリジョー",
  "note": ""
}
```

## 手元で確認する

`fetch` でJSONを読むため、ファイルを直接開くのではなく簡易サーバーで開きます。

```sh
python3 -m http.server 8000
# http://localhost:8000 を開く
```
