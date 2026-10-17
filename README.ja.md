<div align="center">
  <h1>
    <img src="assets/brand/edgeever-icon.svg" alt="EdgeEver のロゴ" width="48" align="absmiddle" /> EdgeEver
  </h1>
  <p>
    <b>AI ネイティブ知識ベース、瞬時マルチデバイス同期＆ネイティブ MCP を備えた Evernote / Obsidian 代替ツール。Cloudflare 無料運用または Docker 自前運用</b>
  </p>
  <p>
    <a href="https://github.com/tianma-if/edgeever/stargazers"><img src="https://img.shields.io/github/stars/tianma-if/edgeever?style=social" alt="GitHub Stars" /></a>
    <a href="https://github.com/tianma-if/edgeever/network/members"><img src="https://img.shields.io/github/forks/tianma-if/edgeever?style=social" alt="GitHub Forks" /></a>
    <a href="https://github.com/tianma-if/edgeever/pkgs/container/edgeever"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fghcr-badge.elias.eu.org%2Fapi%2Ftianma-if%2Fedgeever%2Fedgeever&query=downloadCount&style=social&logo=docker&label=Docker%20Pulls" alt="Docker Pulls" /></a>
    <a href="https://www.producthunt.com/products/edgeever?utm_source=other&utm_medium=social"><img src="https://img.shields.io/badge/Product%20Hunt-ea532a?style=social&logo=product-hunt" alt="Product Hunt" /></a>
    <a href="https://hellogithub.com/repository/tianma-if/edgeever" target="_blank"><img src="https://api.hellogithub.com/v1/widgets/recommend.svg?rid=150fee4403f6433880bda91e9576ac06&claim_uid=TWNAjisURpnhL1l&theme=small" alt="Featured｜HelloGitHub" /></a>
    <a href="#スポンサーと支援"><img src="https://img.shields.io/badge/Sponsor-EdgeEver-ea4aaa?logo=github-sponsors" alt="スポンサーと支援" /></a>
  </p>
  <p>
    <a href="README.zh-CN.md">简体中文</a> | <a href="README.zh-TW.md">繁體中文</a> | <a href="README.md">English</a> | <b>日本語</b> | <a href="README.pl-PL.md">Polski</a>
  </p>
  <p>
    <a href="https://t.me/+wwUx1BYLrIdiZjY1"><img src="assets/readme/community/telegram.svg" alt="Telegram" width="16" height="16" align="absmiddle" /> Telegram グループ</a> &nbsp;|&nbsp;
    <a href="https://demo.edgeever.org">🌐 オンラインデモ</a> &nbsp;|&nbsp;
    <a href="#全プラットフォームクライアントと拡張機能">📱 クライアントと拡張機能</a> &nbsp;|&nbsp;
    <a href="#features">主な機能と活用シーン</a>
  </p>
  <p>
    <img src="assets/readme/hero.png" alt="EdgeEver 3ペインワークスペースと AI パートナー画面" width="880" />
  </p>
</div>

EdgeEver は、オープンソースのノートと知識ベースの作業領域です。クラシックで高効率な三ペインの作業体験（ツリー階層・ノート一覧・エディタ）を継承しつつ、データを自分で持ち、AI Agent と連携できます。

> 💡 **サーバーレス、ずっと無料**
> EdgeEver は Cloudflare の無料枠内で動かせ、サーバーを借りたり保守したりする必要はありません。VPS、NAS、自宅サーバーを使いたい場合は、同じアプリを Docker で導入できます。

> ⭐ EdgeEver が役に立ったら、Star をお願いします。発見のきっかけになります。

## なぜ EdgeEver か

多くの**ノートアプリや個人知識ベース**のユーザーが求めているのは、**信頼でき、開かれていて、速い**個人知識ベースです。よくある代替には、それぞれ代償があります。

| ソリューション | 代表製品 | レイアウトと操作体験 | 同期とセルフホスト費用 | AI・Agent エコシステム |
| :--- | :--- | :--- | :--- | :--- |
| **商用クラウドノート** | Evernote | 3ペイン、経年により肥大化 | 無料枠縮小、有料プランが高額 | 閉鎖的で私有 AI との連携が困難 |
| **ローカルファイル保管庫** | Obsidian | ローカルフォルダとタブ、大量時に遅延 | コア閉源、公式同期は有料、添付で肥大化 | コミュニティ頼み、公式 MCP/ACP 未搭載 |
| **軽量カード／ブロック型** | Memos / 思源ノート | タイムラインや全ブロック構造で書く負担増 | サーバーが必要、または有料同期 | 断片メモ中心、長文と Agent の両立に難 |
| **Serverless 全スタックオープン知識ベース** | **EdgeEver** | **伝統の3ペイン + リッチテキスト/Markdown 両対応** | **Cloudflare 無料枠でゼロ運用 / Docker 自前** | **ネイティブ Remote MCP & デスクトップ ACP 連携** |

**EdgeEver はその隙間を埋めます。** スタック全体がオープンソースで、**ストレスフリーかつ低遅延なマルチデバイス即時クラウド同期**を提供し、すべてのサービスを完全に無料でセルフホストできます。使い慣れた三ペインを残し、1万件のノートを抱えて常駐しても軽快でなめらか、ネイティブな AI Agent と手軽な導入も備えています。

## オンラインデモ

- Demo: [https://demo.edgeever.org](https://demo.edgeever.org)

公開デモは毎日 3:00（中国標準時）にリセットされ、サンプルノートが戻ります。非公開の内容は置かないでください。

## 全プラットフォームクライアントと拡張機能

### クライアントのダウンロード

<p>
  <a href="https://github.com/tianma-if/edgeever/releases/latest"><img src="assets/readme/platforms/macos.svg" alt="macOS 向け EdgeEver をダウンロード" width="40" height="40" /></a>&nbsp;&nbsp;
  <a href="https://github.com/tianma-if/edgeever/releases/latest"><img src="assets/readme/platforms/windows.svg" alt="Windows 向け EdgeEver をダウンロード" width="40" height="40" /></a>&nbsp;&nbsp;
  <a href="https://github.com/tianma-if/edgeever/releases/latest"><img src="assets/readme/platforms/tux.svg" alt="Linux x86_64 AppImage Preview をダウンロード" width="40" height="40" /></a>&nbsp;&nbsp;
  <a href="https://play.google.com/store/apps/details?id=org.edgeever.mobile&hl=ja"><img src="assets/readme/platforms/google-play.svg" alt="Google Play から Android 向け EdgeEver をダウンロード" width="40" height="40" /></a>&nbsp;&nbsp;
  <a href="https://apps.apple.com/jp/app/edgeever/id6792625631"><img src="assets/readme/platforms/app-store.svg" alt="App Store から iOS 向け EdgeEver をダウンロード" width="40" height="40" /></a>
</p>

> iOS アプリは、中国本土以外の Apple ID が必要です。

### ブラウザ Web クリッパー拡張機能

<p>
  <a href="https://chromewebstore.google.com/detail/edgeever-web-clipper/gjadpfmanienmlofajibkfkkpfdkclgo"><img src="https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/chrome/chrome.svg" alt="Google Chrome に EdgeEver Web クリッパーをインストール" width="36" height="36" /></a>&nbsp;&nbsp;
  <a href="https://chromewebstore.google.com/detail/edgeever-web-clipper/gjadpfmanienmlofajibkfkkpfdkclgo"><img src="https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/edge/edge.svg" alt="Microsoft Edge に EdgeEver Web クリッパーをインストール" width="36" height="36" /></a>&nbsp;&nbsp;
  <a href="https://addons.mozilla.org/ja/firefox/addon/edgeever-web-clipper/"><img src="https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/firefox/firefox.svg" alt="Firefox に EdgeEver Web クリッパーをインストール" width="36" height="36" /></a>
</p>

- **スマートな本文抽出**：Web ページの本文を自動抽出し、クリーンな Markdown に変換。参照元 URL と取得日時を保持。
- **選択範囲と右クリッククリップ**：テキストを選択するか画像を右クリックして、余分な要素を除いて即時ノート化。
- **SNS と技術コミュニティへの深い対応**：X (Twitter)、小紅書、知乎、Reddit、GitHub、Bilibili、YouTube など 15 以上の主要プラットフォームに最適化。
- **セルフホストへの直接安全通信**：取得した内容は中継サーバーを介さず、プライベートな自前インスタンスへ直接送信。

<a id="features"></a>
## 主な機能と活用シーン

マルチチャネルでの情報収集からビジュアル表現、チーム連携まで、EdgeEver は摩擦のないエンドツーエンドのワークフローを提供します：

### 注目の実機ワークフロー

| 💡 AI 一言指示でマインドマップ・図解作成 | 📊 AI 業務多次元テーブルとオンラインフォーム |
| :---: | :---: |
| <img src="docs/assets/best-practices/ai-diagram-mindmap.png" alt="AI 一言指示でマインドマップ作成" width="420" /> | <img src="docs/assets/best-practices/ai-database-employee-roster.png" alt="AI 多次元テーブル構築" width="420" /> |
| **💬 微信チャット履歴の構造化一括取り込み** | **🎨 微信公式アカウント・記事向けリッチ整形** |
| <img src="docs/assets/best-practices/wechat-chat-imported-note.png" alt="微信チャット履歴取り込み" width="420" /> | <img src="docs/assets/best-practices/copy-to-wechat-mp-menu.png" alt="リッチテキスト整形コピー" width="420" /> |

### 1. 全方位のクリッピングとメディア蓄積
- **クロスプラットフォームのワンクリック保存**：拡張機能は [小紅書](docs/best-practices.md#2-one-click-xiaohongshu-red-note-clipping)、[X (Twitter)](docs/best-practices.md#3-one-click-x-twitter-post--quote-clipping)、[知乎](docs/best-practices.md#4-one-click-zhihu-answer--column-article-clipping)、[Reddit](docs/best-practices.md#5-one-click-reddit-discussion-post-clipping)、[GitHub](docs/best-practices.md#8-one-click-github-repository-metadata-clipping)、Bilibili、YouTube に深層対応；スマホ共有から[画像](docs/best-practices.md#9-one-click-mobile-image-sharing-to-notes)や[記事](docs/best-practices.md#10-one-click-wechat-article-clipping-on-mobile)を即時保存。
- **微信チャット履歴の完全取り込み**：macOS 版で発言者、時間軸、画像、添付を保ったまま一括ノート化。詳細は[微信チャット履歴取り込み](docs/best-practices.md#1-one-click-wechat-chat-history-archiving)。
- **汎用添付ファイルとクライアント側画像圧縮**：最大 1 GiB まで安全に添付可能；ブラウザ側での自動画像圧縮により 50%〜90% 容量を削減。

### 2. インテリジェントなビジュアル表現と多次元データ協調
- **ビジュアル図解ノートとプロフェッショナルインフォグラフィック**：AI に指示するだけで編集可能な[マインドマップやフローチャート](docs/best-practices.md#11-ai-conversational-generation-of-mind-maps-flowcharts--architecture-diagrams) を自動生成（[設計ガイド](docs/visual-diagram-notes.md)）；多彩な[インフォグラフィック](docs/best-practices.md#12-ai-powered-generation-of-professional-infographics) を手軽に作成。
- **AI 多次元テーブルと公開集計フォーム**：自然言語プロンプトから[多次元データベーステーブル](docs/best-practices.md#13-instant-multi-dimensional-database-table-generation-via-ai-prompt) を即座に構築；ログイン不要の[一般公開オンライン集計フォーム](docs/best-practices.md#14-one-click-public-online-form-collection-from-database-tables) をワンクリックで発行。
- **ネイティブポスターノートと AI レイアウト**：キャンバスベースのポスターノートを内蔵し、AI アシスタントと連携して美麗なグラフィックを直接デザイン。
- **デュアルビュー編集と知識ベース公開**：リッチテキストと Markdown を自在に切替；**ノートブック全体を階層ツリー付きの独立 Web サイトとして公開**可能。

### 3. クリエイター向けワンクリック配信
- **微信公式アカウント向け一括整形**：インラインスタイル付きの美麗レイアウトへ瞬時に変換し、[エディタへ直接貼り付け](docs/best-practices.md#6-one-click-note-copy-to-wechat-official-account--blogs) 可能。
- **高画質ポスター画像共有とマルチ形式書き出し**：ノートを[美麗な縦長ポスターカード](docs/best-practices.md#7-ai-rss-daily-digest--elegant-image-poster-sharing) として共有；Markdown、HTML、PDF への書き出しにも対応。
- **AI RSS 購読日報**：公式 AI RSS プラグインが情報源を巡回し、ノイズを除去した構造化日報を自動生成。

### 4. ネイティブ AI Agent とオープンなエコシステム
- **ネイティブ Agent プロトコル連携（MCP & ACP）**：組み込みの MCP により外部 AI Agent が安全にノートを操作；デスクトップ版は ACP 経由でローカル Agent（Codex、Antigravity、Claude Code など）と協調作業。
- **独自モデル連携とオープンなプラグイン API**：OpenAI、Anthropic、Gemini 互換プロバイダと連携；[プラグイン開発 API](docs/plugin-development.md) で自由に拡張可能。

### 5. オープンアーキテクチャ・マルチプラットフォーム・強固なセキュリティ
- **柔軟なデプロイとオープンなデータ構造**：Cloudflare Serverless（無料枠で約15万件ノート対応）または Docker 自前運用；標準 SQLite、可逆 ZIP アーカイブ対応。
- **全プラットフォーム対応とエンタープライズ品質の安全性**：Web、Android、iOS、macOS、Windows、Linux、ブラウザ拡張に対応；オフライン下書き、同期キュー、ブルートフォース保護。

👉 全 14 の実機スクリーンショットと解説を見る：**[完全な活用シーンとショーケースガイド](docs/best-practices.md)**

## 導入

Cloudflare が、サーバーを持たない導入の推奨です。VPS、NAS、自宅サーバーなら Docker も使えます。

Cloudflare のオンライン導入は、次のいずれかです。

### 方法 A: AI Agent に任せて導入（推奨）

次のプロンプトを AI Agent（Codex、Claude、Cursor、WorkBuddy、Antigravity、OpenClaw、Hermes Agent など）へそのまま送ってください。実行中に GitHub や Cloudflare へのアクセスが求められたら、権限を確認して認可してください。

```text
GitHub と Cloudflare のオンライン操作だけで EdgeEver を導入してください:
1. Fork https://github.com/tianma-if/edgeever.
2. Cloudflare で D1 `edgeever` と R2 `edgeever-resources` を作成します。
3. Workers & Pages で Fork の `main` ブランチから `edgeever` という名前の Worker を作成します。
   リポジトリのルートを使い、Cloudflare Workers Builds の既定のデプロイコマンドを維持します。
   その API トークンに D1 の読み取り・編集権限があることを確認して Save and Deploy を選択します。
4. Worker の作成後、ユーザーが指定したパスワードを実行時 Secret
   `EDGE_EVER_AUTH_PASSWORD` に設定します
   （32 文字以上を推奨）。管理者ユーザー名の既定値は `admin` です。別の名前を指定された場合は、
   次のビルド前に Workers Builds 変数 `EDGE_EVER_AUTH_USERNAME` を設定します。
5. 再度ビルドし、`/api/health` と `/api/openapi.json` を確認してから、
   その管理者ユーザー名とパスワードでログインできることを確認します。
6. GitHub Actions の `Update deployed EdgeEver` を有効にし、一度手動実行して、
   Fork が今後の安定版と修正を自動で受け取れるようにします。
```

> 詳細な要件: [AI Agent Cloudflare Deployment](docs/agent-deploy-cloudflare.md)。

### 方法 B: 手動のオンライン導入

<details>
<summary>📖 クリックして展開：Web で行う 6 ステップの手動導入手順</summary>

ウェブ上の 6 手順で完了します。

1. **リポジトリを Fork**：GitHub 右上の **Fork** で、EdgeEver を自分のアカウントへ Fork します。
2. **Cloudflare リソースを作成**：D1 `edgeever` と R2 `edgeever-resources` を作ります。
3. **プロジェクトを取り込み、設定**：Cloudflare **Workers & Pages** で Fork の `main` ブランチから `edgeever` という名前の Worker を作成します。リポジトリのルートと、Cloudflare 上で実行される Workers Builds の既定のデプロイコマンドを使い、API トークンの D1 読み取り・編集権限を確認します。binding はデプロイコマンドが作るため、Fork 内のファイルは編集しないでください。
4. **管理者パスワードを準備**：管理者ログイン用パスワードを用意します。32 文字以上を推奨します。Worker 作成後、実行時 Secret `EDGE_EVER_AUTH_PASSWORD` に保存します。
5. **ビルドと確認**：Save and Deploy で Worker が作成され、ビルドが始まります。初回のビルドは Worker インスタンスを初期化するためのものであり、管理者 Secret 未設定によるエラーは想定内の動作です。手順 4 の実行時 Secret `EDGE_EVER_AUTH_PASSWORD` を追加した後に再試行ボタンを押せばビルドが通過します。管理者ユーザー名の既定値は `admin` です。別の名前を使う場合は、再試行前に Workers Builds 変数 `EDGE_EVER_AUTH_USERNAME` を設定します。導入後に `/api/health` が `200` を返すことを確認し、設定した管理者ユーザー名とパスワードでログインします。
6. **自動更新を有効化**：Fork の **Actions** タブで **I understand my workflows, go ahead and enable them** を押し、**Update deployed EdgeEver** を一度手動実行して、今後の安定版と修正を自動で受け取れるようにします。

> 📖 手順と設定の詳細は [Online Deployment Guide](docs/deploy-cloudflare-button.md) を見てください。

> 💡 **ドメインとアクセス**：デプロイ完了後は、Cloudflare から自動で割り当てられる `*.workers.dev` ドメインでそのまま利用できるほか、Worker の **Settings → Domains & Routes** で独自のカスタムドメインを紐付けることもできます。

> 💡 **Cloudflare R2 の有効化**：Cloudflare R2 にはノート用途で足りる [無料保存枠](https://developers.cloudflare.com/r2/pricing/#free-tier) がありますが、先に R2 のサブスクリプションを有効にし、支払い方法を登録する必要があります。Cloudflare は [公式に](https://developers.cloudflare.com/billing/get-started/update-billing-info/#supported-payment-methods) UnionPay、Visa、Mastercard などのカードと、PayPal、Apple Pay、Google Pay などを受け付けます。

</details>

### 方法 C: VPS または NAS 上で Docker を使用

Docker と Cloudflare は同じフロントエンド、API ルート、ビジネスサービス、認証、MCP 実装、および migration を共有します。コンテナは SQLite を使用し、ローカルファイルまたは S3 互換ストレージに対応し、`amd64` と `arm64` イメージを提供します。詳細は[Docker によるデプロイ](docs/deploy-docker.md)と[セルフホストと Docker アーキテクチャ](docs/self-hosting-architecture.md)をご覧ください。

GitHub でホストされているインストールスクリプトと公式 GHCR イメージを使用します。

```sh
curl -fsSL https://edgeever.org/install.sh | bash
```

このコマンドは最新のイメージを取得し、管理者パスワードを生成して、Docker Compose で EdgeEver を起動します。導入後は毎日自動更新されます。手動更新する場合は、サーバー上で `~/edgeever/update.sh` を実行します。

> 💡 **ネットワークの注意事項**：公式イメージは GitHub (GHCR) にあります。環境によって取得が遅い場合は、ネットワークプロキシやミラーを設定してください。

---

## データ移行と高度な活用

### 移行ガイド (Migration)

他のノートアプリから EdgeEver に移行する場合は、次のガイドを参照してください。

- **Evernote からの移行**：[docs/evernote-migration-guide.md](docs/evernote-migration-guide.md) を参照
- **flomo からの移行**：[docs/flomo-migration-guide.md](docs/flomo-migration-guide.md) を参照
- **Memos からの移行**：[docs/memos-migration-guide.md](docs/memos-migration-guide.md) を参照
- **Notion からの移行**：[docs/notion-migration-guide.md](docs/notion-migration-guide.md) を参照

### ネイティブ MCP 連携

**個人設定** -> **API / MCP** で API トークンを生成し、Remote MCP 設定をワンクリックでコピーすれば、Claude Code、Cursor、Antigravity、OpenClaw などの AI Agent に知識ベースの安全な管理を許可できます。テキストノート、ダイアグラム（マインドマップ、フローチャート、アーキテクチャ図）、多次元テーブル、ポスターノートの閲覧・編集に加え、ノートブック、タグ、添付、リビジョン履歴、テンプレート、プロンプトの管理もサポートします。

> 💡 **シーンのヒント：**
> AI を真のナレッジオーケストレーター、創作の副操縦士として活用しましょう。構想を一瞬で図解や多次元テーブルに変換し、AI Agent にプライベートな文脈を提供できます。EdgeEver の豊かな編集機能と洗練されたタイポグラフィにより、AI と共同で築いた資産はただのテキストにとどまらず、いつでも活用・配信できる上質な成果物となります。

### 複数アカウントとストレージ使用量

導入後、1 つのインスタンスで複数アカウントのログインをサポートします。管理者は **個人設定** -> **アカウント管理** でメンバーアカウントの作成、無効化、パスワードリセットを行えます。各メンバーにはノートブック、ノート、添付、ゴミ箱、インポート/エクスポート、MCP トークンなどが完全に独立した個人スペースが割り当てられます。ストレージ分析画面から、全体の容量とアカウント別の添付ファイル消費状況をリアルタイムで確認できます。

### 高度なオブジェクトストレージと PicGo 外部図床

- **OSS オブジェクトストレージ**：インスタンスの Owner は **設定 → 高度な設定 → OSS オブジェクトストレージ** で S3 互換ストレージを設定できます。ストレージを変更しても、既存の添付ファイルには影響しません。
- **デスクトップ PicGo 連携**：デスクトップ版はローカルの PicGo クライアントと連携でき、ノートに画像を挿入する際に外部図床へ直接アップロードすることで、自前インスタンスのストレージ消費とトラフィックを最小化できます。

### プラグインとテーマ

Web 版およびデスクトップ版は機能プラグインと外観テーマに対応しており、公式マーケット、GitHub、または Manifest URL からワンクリックでインストールし、ワークスペース全体で同期できます。開発者は `@edgeever/plugin-api` を用いて自由に拡張可能です。[プラグイン開発ガイド](docs/plugin-development.md)および[プラグインマーケットポリシー](docs/plugin-marketplace-policy.md)をご覧ください。

---

## 開発者ガイドとアーキテクチャ

### 技術スタック

- Bun workspace monorepo。Web、API、公式サイト、共有型定義パッケージを含みます。
- フロントエンド：Vite、React、React Router、TanStack Query。UI は Tailwind CSS、shadcn/ui、Radix UI。
- エディタ：TipTap / ProseMirror（Markdown 対応）。PWA は vite-plugin-pwa、Workbox、Dexie。
- Android アプリ：`apps/mobile` の Expo + React Native。SQLite ローカルストレージと増量同期。
- iOS アプリ：`apps/ios` のネイティブ SwiftUI（iOS 17+）。TipTap EditorBundle と GRDB ローカルミラー/outbox。
- ネイティブデスクトップ版：Electron + Rust sidecar。ローカル SQLite によるオフライン編集と増量同期。
- Web クリッパー：Manifest V3、Mozilla Readability、Turndown（Chrome、Microsoft Edge、Firefox 対応）。
- バックエンド：Hono/Zod による REST API および Remote MCP。Cloudflare Workers/D1/R2、Docker は Bun/SQLite/ローカルファイルまたは S3。
- 公式サイト：`apps/site` の Astro 静的サイト。Cloudflare Pages に独立してデプロイ可能。

### クイックスタート

```sh
bun install
bun run dev
```

ローカル開発環境では自動ログインが有効になっており、初期アカウントは `owner` / `edgeever-local-dev` です。

### ディレクトリ構成

```text
apps/web          Vite + React フロントエンド、PWA、オフライン下書きと同期キュー
apps/extension    Chrome/Edge/Firefox Manifest V3 Web クリッパー拡張
apps/api          Cloudflare Worker + Hono API、MCP エンドポイント
apps/mobile       Expo + React Native Android アプリ
apps/ios          ネイティブ SwiftUI iOS アプリ (TipTap EditorBundle, GRDB)
apps/desktop      Electron デスクトップシェル、preload bridge、ネイティブパッケージ設定
apps/site         Astro 公式サイト（単独デプロイ可能）
packages/client   Web とモバイルで共有する API クライアント
packages/shared   共有型定義、Zod スキーマ、TipTap / Markdown 変換
crates/desktop-sidecar
                  Rust sidecar。ローカル SQLite、オフラインデータ、バックアップを管理
scripts           Wrangler ラッパー、パスワードハッシュ、CLI、MCP stdio bridge、ENEX 取り込み
migrations        D1/SQLite で共用される追記専用のデータベース migration
docs              アーキテクチャ、移行、デプロイに関するドキュメント
.github/workflows Web、モバイル、iOS、デスクトップのビルド、デプロイ、Release CI
wrangler.toml     Cloudflare Workers、Assets、D1、R2 設定
```

<details>
<summary>⚙️ アーキテクチャ設計と同期の実装詳細（クリックして展開）</summary>

#### コンテンツ形式

EdgeEver は 3 つのコンテンツ表現を同時に保持します。

```text
content_json      TipTap/ProseMirror ドキュメント。エディタの正式形式
content_markdown  API、AI Agent、インポート/エクスポート用
content_text      検索、要約、インデックス用
```

**個人設定** -> **インポートとエクスポート** から EdgeEver ZIP をエクスポートまたはインポートします。ZIP 内の `notes/` ディレクトリはそのまま Markdown として閲覧や移行に使用でき、構造化データは EdgeEver インスタンス間での完全復元に利用されます。

#### 画像圧縮の仕様

画像圧縮は Web クライアントでのアップロード前にのみ実行され、設定の「ノート内画像を圧縮」スイッチで制御されます。有効にすると、ブラウザが PNG、JPEG、WebP、AVIF を WebP に圧縮し、長辺を `2560px` 以内に収めます。圧縮によってサイズが縮小しない場合は原画が保持されます。

Cloudflare Worker 側での画像処理はリソースを消費するため、EdgeEver では圧縮処理を Web クライアント側で完結させています。REST API や MCP からのアップロードはクライアントから送られたデータをそのまま保存します。

#### 同期タイミング

Web、PWA、デスクトップ版は編集停止から 30 秒後にノートをアップロードし、画面表示中は 5 分ごとにクラウドの変更を確認します。ウィンドウへのフォーカス時や手動更新時は即時に反映されます。設定は [`apps/web/src/lib/workspace-refresh.ts`](apps/web/src/lib/workspace-refresh.ts) の `DEFERRED_MEMO_SYNC_DELAY_MS` と `BACKGROUND_WORKSPACE_REFRESH_INTERVAL_MS` で調整可能です。

</details>

---

## コミュニティとフィードバック

- 不具合報告や機能提案、導入時の疑問は [GitHub Issues](https://github.com/tianma-if/edgeever/issues) へ投稿してください。
- コントリビューションの前に [CONTRIBUTING.md](CONTRIBUTING.md) をお読みください。

## スポンサーと支援

EdgeEver は無料のオープンソースプロジェクトです。各プラットフォーム向けの開発、実機テスト、証明書署名、マルチランタイムエコシステムの維持には継続的な労力とリソースが必要です。

- [EdgeEver を支援する](docs/sponsor.md)
- [スポンサーとパートナー](docs/partners.md)

## 謝辞

- 製品設計にあたり、[Evernote](https://evernote.com/) や [Notion](https://www.notion.com/) などの公開製品体験を参考にしています。
- 図解ノートは [XMind](https://xmind.com/) や [ProcessOn](https://www.processon.com/) の公開デザインを参考にしています。
- ポスターキャンバスは、向陽喬木（joeseesun）氏の [Qiaomu Design](https://github.com/joeseesun/qiaomu-cover-design) をベースに改編しています（MIT ライセンス）。
- 画像共有カードのビジュアルスタイルは [流光卡片 (FireflyCard)](https://fireflycard.shushiai.com/) を参考にしています。

## 商標とブランドの利用

EdgeEver の名称、ロゴ、ブランドアセットは公式プロジェクトを識別するためのものです。派生版で「EdgeEver に基づく」旨を明記することは可能ですが、公式であるかのように誤認させる表示は禁止されています。

## 免責事項

EdgeEver は完全に独立したオープンソースソフトウェアです。Evernote® およびその関連企業との提携、認可、後援関係はありません。

EdgeEver はセルフホスト型ソフトウェアです。公式デモを除き、プロジェクト管理者が利用者のコンテンツをホスト、管理、検閲することはありません。
