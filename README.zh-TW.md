<div align="center">
  <h1>
    <img src="assets/brand/edgeever-icon.svg" alt="EdgeEver Logo" width="48" align="absmiddle" /> EdgeEver
  </h1>
  <p>
    <b>AI 原生知識庫與 Evernote / Obsidian 替代方案，支援多端瞬時同步與原生 MCP。Cloudflare 免費代管或 Docker 自行託管</b>
  </p>
  <p>
    <a href="https://github.com/tianma-if/edgeever/stargazers"><img src="https://img.shields.io/github/stars/tianma-if/edgeever?style=social" alt="GitHub Stars" /></a>
    <a href="https://github.com/tianma-if/edgeever/network/members"><img src="https://img.shields.io/github/forks/tianma-if/edgeever?style=social" alt="GitHub Forks" /></a>
    <a href="https://github.com/tianma-if/edgeever/pkgs/container/edgeever"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fghcr-badge.elias.eu.org%2Fapi%2Ftianma-if%2Fedgeever%2Fedgeever&query=downloadCount&style=social&logo=docker&label=Docker%20Pulls" alt="Docker Pulls" /></a>
    <a href="https://www.producthunt.com/products/edgeever?utm_source=other&utm_medium=social"><img src="https://img.shields.io/badge/Product%20Hunt-ea532a?style=social&logo=product-hunt" alt="Product Hunt" /></a>
    <a href="https://hellogithub.com/repository/tianma-if/edgeever" target="_blank"><img src="https://api.hellogithub.com/v1/widgets/recommend.svg?rid=150fee4403f6433880bda91e9576ac06&claim_uid=TWNAjisURpnhL1l&theme=small" alt="Featured｜HelloGitHub" /></a>
    <a href="#贊助與支持"><img src="https://img.shields.io/badge/Sponsor-支持專案-ea4aaa?logo=github-sponsors" alt="贊助與支持" /></a>
  </p>
  <p>
    <a href="README.zh-CN.md">简体中文</a> | <b>繁體中文</b> | <a href="README.md">English</a> | <a href="README.ja.md">日本語</a> | <a href="README.pl-PL.md">Polski</a>
  </p>
  <p>
    <a href="#wechat-group"><img src="assets/readme/community/wechat.svg" alt="WeChat" width="16" height="16" align="absmiddle" /> 微信交流群</a> &nbsp;|&nbsp;
    <a href="https://demo.edgeever.org">🌐 線上展示</a> &nbsp;|&nbsp;
    <a href="#全平台用戶端與瀏覽器外掛">📱 用戶端與外掛下載</a> &nbsp;|&nbsp;
    <a href="#features">核心特性與場景</a>
  </p>
  <p>
    <img src="assets/readme/hero.png" alt="EdgeEver 三欄工作台與 AI 伴侶介面" width="880" />
  </p>
</div>

EdgeEver 是一款現代化的開源筆記與個人知識庫工作區。它延續經典高效的三欄工作區體驗（目錄樹 · 筆記列表 · 編輯寫作），同時具備完全開放的資料架構與原生 AI Agent 聯動能力，讓個人知識沉澱更輕量、更自由。

> 💡 **終身免伺服器，100% 免費**
> EdgeEver 可以免費執行在 Cloudflare 配額內，無需購買或維護伺服器；希望使用 VPS、NAS 或家用伺服器的使用者，也可以透過 Docker 部署同一套應用程式。

> ⭐ 如果 EdgeEver 對你有幫助，歡迎點個 Star。你的支持會幫助更多人發現這個專案。

## 為什麼做 EdgeEver

很多**筆記與個人知識庫**的使用者，核心需求只是一個**可靠、開放、回應迅速**的個人知識庫。主流方案各有側重與取捨：

| 方案類型 | 代表產品 | 版面與互動體驗 | 同步機制與自託管成本 | AI 與 Agent 擴充生態 |
| :--- | :--- | :--- | :--- | :--- |
| **傳統商業雲筆記** | 印象筆記 / Evernote | 經典三欄版面，功能逐漸膨脹重型化 | 免費額度收緊，高級商業訂閱昂貴 | 商業封閉生態，難以接入私有 AI 工作流 |
| **本地檔案雙鏈庫** | Obsidian | 本地資料夾與標籤頁，大量筆記檢索易卡頓 | 核心程式碼閉源，官方同步收費，附件混存易膨脹 | 依賴社群外掛，缺乏原生雲端與 Agent 協定 |
| **輕量卡片 / 區塊級知識庫** | Memos / 思源筆記 | 串流卡片或全面區塊級架構，書寫心智負擔偏重 | 需自備伺服器，或依賴官方訂閱與付費解鎖同步 | 側重單點記錄，難以兼顧長文與原生 Agent 協同 |
| **Serverless 全端開源知識庫** | **EdgeEver** | **經典三欄工作區 + 富文字與 Markdown 雙視圖** | **Cloudflare 零成本免維代管 / Docker 本地自建** | **原生內建 Remote MCP & 桌面端 ACP 深度互聯** |

**EdgeEver 恰好填補了这一空白**：全端開源，提供真正**零感知、低延遲的多端瞬時雲端同步**，且全部服務均可免費自行託管；同時保留經典三欄版面與流暢排版，萬條筆記常駐依然輕盈絲滑，原生支援接入 AI Agent，部署維護零門檻、零費用。

## 線上展示

- Demo 網址：[https://demo.edgeever.org](https://demo.edgeever.org)

公開展示環境會在每天凌晨 3:00（北京時間）自動重設並還原範例筆記，請不要儲存私密內容。

## 全平台用戶端與瀏覽器外掛

### 用戶端下載

<p>
  <a href="https://github.com/tianma-if/edgeever/releases/latest"><img src="assets/readme/platforms/macos.svg" alt="下載 macOS 用戶端" width="40" height="40" /></a>&nbsp;&nbsp;
  <a href="https://github.com/tianma-if/edgeever/releases/latest"><img src="assets/readme/platforms/windows.svg" alt="下載 Windows 用戶端" width="40" height="40" /></a>&nbsp;&nbsp;
  <a href="https://github.com/tianma-if/edgeever/releases/latest"><img src="assets/readme/platforms/tux.svg" alt="下載 Linux x86_64 AppImage 預覽版" width="40" height="40" /></a>&nbsp;&nbsp;
  <a href="https://play.google.com/store/apps/details?id=org.edgeever.mobile&hl=zh-TW"><img src="assets/readme/platforms/google-play.svg" alt="從 Google Play 下載 Android 用戶端" width="40" height="40" /></a>&nbsp;&nbsp;
  <a href="https://apps.apple.com/tw/app/edgeever/id6792625631"><img src="assets/readme/platforms/app-store.svg" alt="從 App Store 下載 iOS 用戶端" width="40" height="40" /></a>
</p>

> iOS 用戶端需要使用非中國大陸區 Apple ID 下載。

### 瀏覽器網頁擷取外掛

<p>
  <a href="https://chromewebstore.google.com/detail/edgeever-web-clipper/gjadpfmanienmlofajibkfkkpfdkclgo"><img src="https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/chrome/chrome.svg" alt="為 Google Chrome 安裝 EdgeEver 網頁擷取外掛" width="36" height="36" /></a>&nbsp;&nbsp;
  <a href="https://chromewebstore.google.com/detail/edgeever-web-clipper/gjadpfmanienmlofajibkfkkpfdkclgo"><img src="https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/edge/edge.svg" alt="為 Microsoft Edge 安裝 EdgeEver 網頁擷取外掛" width="36" height="36" /></a>&nbsp;&nbsp;
  <a href="https://addons.mozilla.org/zh-TW/firefox/addon/edgeever-web-clipper/"><img src="https://raw.githubusercontent.com/alrra/browser-logos/58881b84c4d73adc03c06fa2c275a7abee02d935/src/firefox/firefox.svg" alt="為 Firefox 安裝 EdgeEver 網頁擷取外掛" width="36" height="36" /></a>
</p>

- **智慧正文擷取**：自動提取網頁文章正文並轉為純淨 Markdown，自動保留來源網址與擷取時間。
- **選取範圍與按右鍵擷取**：選取局部文字或按右鍵任意圖片直接儲存為獨立筆記，無需抓取整頁冗餘內容。
- **社群媒體與技術社群深度擷取**：深度適配 X (Twitter)、小紅書、知乎、Reddit、GitHub、Bilibili、YouTube 等十餘個主流平台，一鍵結構化入庫。
- **自託管隱私直連**：擷取內容直傳個人自託管實例，不經過任何第三方伺服器轉發。

<a id="features"></a>
## 核心特性與場景

從跨渠道內容捕獲到深度知識表達與業務協同，EdgeEver 為個人與團隊提供了高效流暢的端到端工作流：

### 精選核心場景實機預覽

| 💡 AI 一鍵產生心智圖與架構圖 | 📊 AI 業務多維表格與線上收集表單 |
| :---: | :---: |
| <img src="docs/assets/best-practices/ai-diagram-mindmap.png" alt="AI 一鍵產生心智圖" width="420" /> | <img src="docs/assets/best-practices/ai-database-employee-roster.png" alt="AI 一鍵建構多維表格" width="420" /> |
| **💬 微信聊天記錄一鍵整段結構化歸檔** | **🎨 微信公眾號一鍵排版與內聯格式複製** |
| <img src="docs/assets/best-practices/wechat-chat-imported-note.png" alt="微信聊天記錄歸檔" width="420" /> | <img src="docs/assets/best-practices/copy-to-wechat-mp-menu.png" alt="微信公眾號排版複製" width="420" /> |

### 1. 全渠道剪藏與多媒體沉澱
- **跨平台一鍵剪藏**：外掛深度適配 [小紅書](docs/best-practices.zh-CN.md#2-小红书图文笔记一键剪藏)、[X (Twitter)](docs/best-practices.zh-CN.md#3-x-twitter-推文与引用一键剪藏)、[知乎](docs/best-practices.zh-CN.md#4-知乎回答与文章一键精准剪藏)、[Reddit](docs/best-practices.zh-CN.md#5-reddit-讨论帖一键剪藏)、[GitHub](docs/best-practices.zh-CN.md#8-github-开源仓库信息一键剪藏)、B站及 YouTube；手機端支援[全網圖片](docs/best-practices.zh-CN.md#9-移动端社媒图片一键转存笔记)與[公眾號文章一鍵剪藏](docs/best-practices.zh-CN.md#10-手机端一键剪藏微信公众号文章)。
- **微信聊天記錄完整歸檔**：macOS 端支援微信一鍵轉發整段對話匯入筆記，完整保留時間軸、頭像、表情、附件與圖片，詳見[微信歸檔說明](docs/best-practices.zh-CN.md#1-微信聊天记录一键归档与整理)。
- **通用檔案附件與端側圖片壓縮**：支援各類影音與辦公檔案（串流分塊最高 1 GiB）；瀏覽器端靜默智慧壓縮圖片，節省 50%-90% 儲存空間。

### 2. 智慧視覺化與多維資料協作
- **全類型視覺化圖表與專業資訊圖**：AI 一句話直接產生可編輯的[心智圖、流程圖與架構圖](docs/best-practices.zh-CN.md#11-ai-对话一键生成思维导图流程图与架构图)（詳見[圖表筆記設計](docs/visual-diagram-notes.zh-CN.md)）；內建模板一鍵產生[時間線、對比圖等資訊圖](docs/best-practices.zh-CN.md#12-ai-智能生成专业信息图时间线对比图架构图等)。
- **AI 多維表格與線上收集表單**：自然語言一鍵建構[任意業務場景多維表格](docs/best-practices.zh-CN.md#13-借助右侧-ai-助手一句话生成多维表格)，自動推斷欄位與範例資料；支援一鍵產生免登入[對外線上收集表單](docs/best-practices.zh-CN.md#14-多维表格一键生成在线公开收集表单)。
- **原生海報筆記與 AI 視覺排版**：內建結構化圖文卡片模板與排版畫布，支援按兩下編輯、替換素材與一鍵自適應縮放，AI 助手可直接協同產生。
- **雙視圖編輯與知識庫公開發布**：支援富文字與 Markdown 原始碼自由切換；提供經典三欄無限層級樹、版本回溯，以及**整本筆記本一鍵公開發布為帶目錄樹的獨立網站**。

### 3. 創作者排版與一鍵發布
- **微信公眾號一鍵排版與複製**：專為創作者打造，筆記一鍵轉換為帶行內樣式的公眾號格式，[一鍵複製內聯富文本](docs/best-practices.zh-CN.md#6-一键复制笔记到微信公众号排版)到後台直接發布。
- **高質感長圖分享與多格式匯出**：任意筆記一鍵[產生精美長圖海報](docs/best-practices.zh-CN.md#7-ai-rss-智能订阅日报与精美长图分享)，內建多套質感版式；支援匯出 Markdown、HTML 與 PDF。
- **AI RSS 智慧訂閱日報**：內建 AI RSS 外掛，自動定時抓取資訊與部落格，AI 過濾雜訊並產生精煉日報。

### 4. 原生 AI Agent 與開放生態
- **原生 Agent 協定互聯（MCP & ACP）**：內建 MCP 協定供外部 AI Agent 安全讀寫管理知識庫；桌面端透過 ACP 協定直接調動本機 Agent（Codex、Claude Code、Antigravity 等）協同創作。
- **接入自有模型與開放外掛 API**：支援接入 OpenAI、Anthropic、Gemini 相容服務，在側邊欄隨時進行摘要與翻譯；提供豐富的[外掛開發文件](docs/plugin-development.zh-CN.md)。

### 5. 開放架構、全端體驗與安全基座
- **自由部署與資料無圍牆**：支援 Cloudflare Serverless 零成本代管（免費額度約容納 15 萬條筆記）或 Docker 本地部署（承載百萬級筆記與海量圖片）；標準 SQLite 儲存，支援無損 ZIP 匯入匯出。
- **全平台涵蓋與穩定安全**：官方涵蓋 Web、Android、iOS、macOS、Windows、Linux 與主流瀏覽器外掛，多端同步無裝置數量限制；支援離線草稿、同步佇列與防暴力破解限流。

👉 查看全部 14 個實機展示與操作效果：**[完整場景與最佳實踐指南](docs/best-practices.zh-CN.md)**

## 部署

Cloudflare 是建議的零伺服器部署方式；希望使用 VPS、NAS 或家用伺服器的使用者也可以選擇 Docker。

Cloudflare 線上部署可以選擇以下兩種方式之一：

### 方案一：交給 AI Agent 部署（建議）

將下方提示詞直接複製傳送給 AI Agent（如 Codex、Claude、Cursor、WorkBuddy、Antigravity、OpenClaw、Hermes Agent 等）。執行過程中，如需存取 GitHub 或 Cloudflare，請確認權限範圍並依提示完成授權。

```text
請全程透過 GitHub 和 Cloudflare 線上部署 EdgeEver：
1. Fork https://github.com/tianma-if/edgeever。
2. 在 Cloudflare 中建立 D1 `edgeever` 與 R2 `edgeever-resources`。
3. 在 Workers & Pages 中從 Fork 的 `main` 分支建立名為 `edgeever` 的 Worker。
   使用儲存庫根目錄，保留 Cloudflare Workers Builds 的預設部署指令，確認其 API Token
   具備 D1 讀取及編輯權限，然後儲存並部署。
4. Worker 建立後，設定執行時 Secret `EDGE_EVER_AUTH_PASSWORD`，值為使用者指定的密碼
   （建議至少 32 個字元）。管理員使用者名稱預設為 `admin`；如需自訂，請在再次建置前
   設定 Workers Builds 建置變數 `EDGE_EVER_AUTH_USERNAME`。
5. 再次建置，驗證 `/api/health` 和 `/api/openapi.json`，再用該管理員
   使用者名稱和密碼驗證登入。
6. 啟用並手動執行一次名為 `Update deployed EdgeEver` 的 GitHub Actions 工作流程，
   以便後續自動同步正式版本，持續獲得 EdgeEver 的功能更新與問題修復。
```

> 詳細約定與要求請查看：[AI Agent 線上部署約定](docs/agent-deploy-cloudflare.zh-CN.md)。

### 方案二：手動線上部署

<details>
<summary>📖 展開查看：網頁端 6 步手動部署流程</summary>

只需在網頁端完成 6 步設定：

1. **Fork 儲存庫**：在 GitHub 點選右上角 **Fork**，將專案 Fork 到您的個人帳戶下。
2. **建立 Cloudflare 資源**：建立 D1 `edgeever` 與 R2 `edgeever-resources`。
3. **匯入並設定專案**：在 Cloudflare **Workers & Pages** 中從 Fork 的 `main` 分支建立名為 `edgeever` 的 Worker。使用儲存庫根目錄，保留由 Cloudflare 線上執行的 Workers Builds 預設部署指令，並確認其 API Token 具備 D1 讀取及編輯權限。binding 由部署指令產生，不要修改 Fork 中的檔案。
4. **準備管理員密碼**：準備管理員登入密碼，建議至少 32 個字元。Worker 建立後，將它儲存為執行時 Secret `EDGE_EVER_AUTH_PASSWORD`。
5. **首次建置與驗證**：儲存並部署會建立 Worker 並啟動建置。首次建置主要用於初始化實例，若因尚未配置管理員 Secret 而報錯屬於預期行為，只需在第 4 步新增執行時 Secret `EDGE_EVER_AUTH_PASSWORD` 後點擊重試建置即可通過。管理員使用者名稱預設為 `admin`；如需使用其他名稱，請在重試建置前設定 Workers Builds 建置變數 `EDGE_EVER_AUTH_USERNAME`。部署完成後造訪 `/api/health`，確認回傳 `200`，再用設定的管理員使用者名稱和密碼登入。
6. **啟用自動更新**：進入 Fork 的 **Actions** 分頁，點選 **I understand my workflows, go ahead and enable them**，然後手動執行一次 **Update deployed EdgeEver**，確保後續能夠自動獲得正式版本的功能更新與修復。

> 📖 包含具體參數與建置指令的詳細步驟，請查看 [線上部署完整文件](docs/deploy-cloudflare-button.zh-CN.md)。

> 💡 **網域與存取**：實例部署完成後，可以直接使用 Cloudflare 預設分配的 `*.workers.dev` 網域存取，也可以在 Worker 設定中的 **Settings → Domains & Routes** 綁定自己的自訂網域。

> 💡 **Cloudflare R2 開通**：雖然 Cloudflare R2 儲存提供了足夠寬裕、在筆記場景中完全不會超量的[免費儲存額度](https://developers.cloudflare.com/r2/pricing/#free-tier)，但需先開通 R2 subscription 並綁定付款方式。Cloudflare [官方支援](https://developers.cloudflare.com/billing/get-started/update-billing-info/#supported-payment-methods) 銀聯（UnionPay）、Visa、Mastercard 等金融卡與信用卡，以及 PayPal、Apple Pay、Google Pay 等付款方式。

</details>

### 方案三：在 VPS 或 NAS 上使用 Docker

Docker 與 Cloudflare 共用同一套前端、API 路由、業務服務、鑑權、MCP 實現和 migration。容器使用 SQLite，並支援本地檔案或 S3 相容附件儲存，提供 `amd64` 與 `arm64` 映像檔。詳見[使用 Docker 部署 EdgeEver](docs/deploy-docker.zh-CN.md)和[自託管與 Docker 架構](docs/self-hosting-architecture.zh-CN.md)。

使用 GitHub 託管的安裝指令碼和官方 GHCR 映像檔：

```sh
curl -fsSL https://edgeever.org/install.sh | bash
```

該指令會自動拉取最新映像檔、產生管理員密碼，並使用 Docker Compose 啟動 EdgeEver。安裝後預設每日自動更新；如需手動更新，請在部署伺服器上執行 `~/edgeever/update.sh`。

> 💡 **網路提示**：官方映像檔託管於 GitHub（GHCR）。若在部分網路環境下遇到拉取緩慢或逾時，請在部署前自行設定可用的網路代理或可信的映像檔加速服務。

---

## 資料遷移與進階使用

### 匯入與遷移 (Migration)

如果你想從其他筆記軟體遷移到 EdgeEver，請參考以下極簡遷移指引：

- **印象筆記（Evernote）的遷入**：請參考 [docs/evernote-migration-guide.md](docs/evernote-migration-guide.md)
- **flomo 筆記的遷入**：請參考 [docs/flomo-migration-guide.md](docs/flomo-migration-guide.md)
- **Memos 筆記的遷入**：請參考 [docs/memos-migration-guide.md](docs/memos-migration-guide.md)
- **Notion 筆記的遷入**：請參考 [docs/notion-migration-guide.md](docs/notion-migration-guide.md)

### MCP 原生整合

在 **個人中心** -> **API / MCP** 中建立 API Token 並一鍵複製 Remote MCP 設定，即可讓 Claude Code、Cursor、Antigravity、OpenClaw 等 AI Agent 在帳號授權範圍內安全管理你的知識庫。系統支援文字筆記、圖表筆記（心智圖、流程圖與架構圖）、多維表格筆記與原生海報筆記的完整增刪改查，Agent 還可管理筆記本目錄、標籤、附件、歷史版本、筆記模板與 AI 指令。

> 💡 **場景啟發：**
> 讓 AI 真正成為你的知識管家與創作外腦——不僅能將方案秒級產生為可互動的心智圖、流程圖、架構圖與多維表格，還能為 AI Agent 提供私有知識上下文。依托 EdgeEver 強大的富文字編輯與精美排版能力，AI 協同沉澱的不再是冰冷文字，而是結構工整、排版優雅、隨時可一鍵分發的高品質知識資產。

### 多帳號登入與儲存用量

部署完成後，單個實例支援多帳號登入。實例管理員可以在 **個人中心** -> **帳號管理** 中建立、停用成員帳號或重設密碼。每個成員擁有完全隔離的個人空間，包括筆記本、筆記、附件、資源回收筒、匯入匯出和 MCP Token 等。系統同時提供直觀的儲存用量面板，可即時掌握實例整體與各帳號的附件儲存占用明細。

### 高級物件儲存與第三方圖床

- **OSS 物件儲存**：實例 Owner 可在**設定 → 進階設定 → OSS 物件儲存**中設定相容 S3 API 的物件儲存。切換儲存不會遷移或影響已有附件。
- **桌面端 PicGo 圖床**：桌面端支援可選接入本機 PicGo 用戶端服務，在筆記中插入圖片時可直接上傳至 GitHub、SM.MS、又拍雲、七牛雲或自建圖床，進一步減少自託管實例的儲存開銷與流量占用。

### 外掛與主題

Web 與桌面端支援功能外掛與個性化主題，可從官方市場、GitHub 或 Manifest 位址一鍵安裝，並隨工作區跨端同步。開發者可使用 `@edgeever/plugin-api` 擴充能力，詳見[外掛開發文件](docs/plugin-development.zh-CN.md)與[官方外掛市場上架政策](docs/plugin-marketplace-policy.zh-CN.md)。

---

## 開發者指南與架構

### 技術棧

- Bun workspace monorepo，包含 Web、API、官網與共享型別包。
- 前端：Vite、React、React Router、TanStack Query，UI 基於 Tailwind CSS、shadcn/ui、Radix UI。
- 編輯器：TipTap / ProseMirror，支援 Markdown；PWA 使用 vite-plugin-pwa、Workbox、Dexie。
- Android App：`apps/mobile` 中的 Expo + React Native，採用 SQLite 本地儲存與增量同步。
- iOS App：`apps/ios` 中的原生 SwiftUI（iOS 17+），內建 TipTap EditorBundle、GRDB 本地鏡像/outbox，介面與 Android 殼層對齊。
- 原生桌面端：Electron + Rust sidecar，兼顧跨平台一致體驗與高效能本地資料服務；基於 SQLite 支援離線編輯、連網後增量同步與本地備份。
- 網頁擷取：Manifest V3、Mozilla Readability、Turndown，支援 Chrome、Microsoft Edge 與 Firefox。
- 後端：一套基於 Hono/Zod 的業務應用，提供 REST API 與 Remote MCP；Cloudflare 使用 Workers/D1/R2，Docker 使用 Bun/SQLite/本地檔案或 S3。
- 官網：Astro 靜態站點，位於 `apps/site`，可獨立建置並部署到 Cloudflare Pages。

### 快速開始

```sh
bun install
bun run dev
```

本地開發預設自動登入，首次帳號為 `owner` / `edgeever-local-dev`；測試登入頁可主動登出。

### 目錄結構

```text
apps/web          Vite + React 前端、PWA、離線草稿與同步佇列
apps/extension    Chrome/Edge/Firefox Manifest V3 網頁擷取外掛
apps/api          Cloudflare Worker + Hono API、MCP endpoint
apps/mobile       Expo + React Native Android App
apps/ios          原生 SwiftUI iOS App（TipTap EditorBundle、GRDB）
apps/desktop      Electron 桌面端殼層、preload bridge 與原生打包設定
apps/site         Astro 官方網站，可獨立部署
packages/client   Web 與行動端共享的 API Client
packages/shared   共享型別、Zod schema、TipTap / Markdown 內容轉換
crates/desktop-sidecar
                   Rust sidecar，負責本地 SQLite、離线資料、備份與資源服務
scripts           Wrangler 封裝、密碼 hash、CLI、MCP stdio bridge、Evernote ENEX 匯入
migrations        D1/SQLite 共用、只增不改的資料庫 migration
docs              架構、遷移與部署文件
.github/workflows Web、行動端、iOS、桌面端打包、部署與 Release 的 CI
wrangler.toml     Cloudflare Workers、Assets、D1、R2 設定
```

<details>
<summary>⚙️ 架構設計與同步實現細節（點擊展開）</summary>

#### 內容格式

EdgeEver 同時儲存三種內容型態：

```text
content_json      TipTap/ProseMirror 文件，編輯器權威格式
content_markdown  API、Agent、匯入匯出使用
content_text      搜尋、摘要和索引使用
```

請打開 **我的** -> **匯入與匯出**，匯出或匯入 EdgeEver ZIP。壓縮包中的 `notes/` 目錄可直接作為 Markdown 閱讀和遷移，結構化資料則用於在 EdgeEver 實例之間完整還原；匯入時目標實例中的無關資料會保留，相同 EdgeEver ID 的內容會被覆寫。

#### 圖片壓縮規則

圖片壓縮僅在 Web 端上傳前執行，由設定頁的「壓縮筆記內圖片」開關控制。啟用後，瀏覽器會把 PNG、JPEG、WebP、AVIF 嘗試壓縮為 WebP，並將最長邊限制在 `2560px` 以內；如果壓縮結果不比原圖小，則保留原圖。

Cloudflare Worker 側執行圖片處理會消耗計算/圖片處理額度，因此 EdgeEver 將圖片壓縮放在 Web 用戶端完成；REST API 或 MCP 上傳入口會按用戶端提供的檔案內容直接入庫，不再由伺服端自動壓縮。

#### 同步時序

Web、PWA 與桌面端會在停止編輯 30 秒後上傳筆記，並在頁面可見時每 5 分鐘檢查雲端變更；視窗聚焦與手動重新整理仍會立即拉取。可在 [`apps/web/src/lib/workspace-refresh.ts`](apps/web/src/lib/workspace-refresh.ts) 中調整 `DEFERRED_MEMO_SYNC_DELAY_MS` 和 `BACKGROUND_WORKSPACE_REFRESH_INTERVAL_MS`。

</details>

---

## 社群與反饋

- Bug、功能建議和部署問題請優先提交 [GitHub Issues](https://github.com/tianma-if/edgeever/issues)，方便後續使用者檢索和複用解決方案。
- 貢獻程式碼前請閱讀[貢獻程式碼須知](CONTRIBUTING.zh-CN.md)。如果您的 Fork 同時用於部署 EdgeEver，請將 `main` 分支僅用於部署；從官方 `upstream/main` 新建獨立分支，在該分支中同步上游、開發並提交 Pull Request，不要在部署用的 `main` 上開發或執行 Sync fork。

<hr>

<h3 id="wechat-group">微信交流群</h3>

歡迎加入 EdgeEver AI 交流群，這裡聚集了大量 Vibe Coding 與 AI 玩家。一起交流前沿 AI 生產力與個人知識庫的最佳實踐。

> 掃描下方二維碼或新增微信 `m1245207870`（備註「EdgeEver 進群」），群主將手動邀請入群。

<p align="center">
  <img src="assets/wechat-group-qr.jpg" alt="微信聯絡人二維碼" width="260" />
</p>

## 贊助與支持

EdgeEver 是免費開源專案。保持跨平台用戶端（macOS、Windows、Linux、iOS、Android）的持續演進、真機測試、憑證簽章以及多執行時期生態建設，都需要長期的精力與資源投入。

- [支持 EdgeEver](docs/sponsor.zh-CN.md) —— 透過微信支付或支付寶自願贊助
- [贊助商與合作夥伴](docs/partners.zh-CN.md) —— 支持基礎設施、開發工具、服務或社群合作

## 致謝

- EdgeEver 的筆記產品設計也參考了 [Evernote（印象筆記）](https://evernote.com/)、[Notion](https://www.notion.com/) 等成熟筆記工具的公開產品體驗。相關功能由 EdgeEver 獨立設計與實現。
- 心智圖與視覺化圖表筆記的產品設計參考了 [XMind](https://xmind.com/) 和 [ProcessOn](https://www.processon.com/) 等圖表工具的公開產品體驗。相關功能由 EdgeEver 獨立設計與實現。
- EdgeEver 的海報設計工作台借鑑了向陽喬木（joeseesun）的 [Qiaomu Design](https://github.com/joeseesun/qiaomu-cover-design)，並基於其 MIT 開源許可改編了模板與字型排版引擎。
- EdgeEver 圖片分享卡片的主題視覺與排版參考了 [流光卡片](https://fireflycard.shushiai.com/)，感謝其設計帶來的啟發。

## 商標與品牌使用

EdgeEver 名稱、Logo 及其他品牌標識用於識別官方專案。Fork 或修改版可以說明其「基於 EdgeEver」，但不得暗示官方身分或誤導使用者。開源許可不授予商標權利；其他使用須事先取得專案維護者的書面許可。

## 免責聲明

EdgeEver 是一款完全獨立的開源筆記軟體，由個人和社群自主開發維護。本專案與 Evernote®（印象筆記）及其關聯公司不存在任何商業合作、授權、贊助或隸屬關係。

EdgeEver 是自託管軟體。除官方展示實例外，專案維護者不託管、控制或審核使用者內容。實例中儲存或展示的內容由使用者或實例營運者負責，不代表專案維護者的立場。
