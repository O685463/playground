# 背景切り抜きアプリ (Background Remover)

画像をアップロードするだけで、AIが自動的に背景を削除してくれるWebアプリケーションです。

## 特徴
- **高精度な切り抜き**: `rembg` ライブラリを使用し、人物や物体の背景をきれいに削除します。
- **モダンなUI**: グラスモーフィズムを取り入れたスタイリッシュなデザイン。
- **簡単操作**: ドラッグ＆ドロップで画像をアップロードするだけ。

## 必要要件
- Python 3.8以上
- 以下のライブラリ（`requirements.txt`に含まれています）:
    - fastapi
    - uvicorn
    - python-multipart
    - rembg
    - pillow

## インストール方法

1. 必要なライブラリをインストールします。
   ```bash
   pip install -r requirements.txt
   ```

   ※ 初回実行時、`rembg` は学習済みモデル（約100MB〜）を自動的にダウンロードするため、インターネット接続が必要です。

## 使い方

1. アプリケーションを起動します。
   ```bash
   uvicorn app:app --reload
   ```

2. ブラウザで以下のURLにアクセスします。
   [http://localhost:8081](http://localhost:8081)

3. 画像をドラッグ＆ドロップするか、「Browse Files」ボタンから選択してアップロードしてください。

4. 処理が完了すると、背景が削除された画像が表示され、ダウンロードボタンが現れます。

## 便利な起動方法
`start_app.bat` をダブルクリックすると、サーバーの起動とブラウザの表示を自動的に行います。

## ファイル構成
- `app.py`: バックエンド (FastAPI)
- `static/`: フロントエンド (HTML, CSS, JS)
- `requirements.txt`: 依存ライブラリ一覧
