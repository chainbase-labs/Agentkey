<p align="center">
<img width="256" alt="AgentKey" src="https://github.com/user-attachments/assets/4c7c78a9-e5d8-45ce-9372-d5bffe8f61c5" />
</p>

<p align="center">
  <strong>コマンド1つで、AIエージェントがインターネット全体にアクセスできるようになります。</strong>
  <br>
  Twitterの閲覧、LinkedInの検索、ソーシャルメディアのスクレイピング、あらゆるWebページの読み取り。設定は不要です。インストールするだけですぐに使えます。
</p>

<p align="center">
  <a href="#インストール">インストール</a> ·
  <a href="#エージェントにできるようになること">プラットフォーム</a> ·
  <a href="#よくある質問">よくある質問</a> ·
  <a href="../README.md">English</a> ·
  <a href="README_zh.md">中文</a>
</p>

<p align="center">
  <a href="https://agentkey.app"><img src="https://img.shields.io/badge/Website-agentkey.app-blue?style=for-the-badge" alt="Webサイト" /></a>
  <a href="https://console.agentkey.app"><img src="https://img.shields.io/badge/Console-console.agentkey.app-7c3aed?style=for-the-badge" alt="コンソール" /></a>
</p>

<p align="center">
  <a href="https://www.producthunt.com/products/agentkey?embed=true&amp;utm_source=badge-top-post-badge&amp;utm_medium=badge&amp;utm_campaign=badge-agentkey" target="_blank" rel="noopener noreferrer"><img alt="AgentKey - エージェントのためのワンストップのライブデータマーケットプレイス | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=1192591&amp;theme=light&amp;period=daily&amp;t=1784013858323"></a>
</p>

---

**AgentKeyをインストールして、AIに超能力を与えましょう。**

AgentKeyは、エージェントエコシステムのためのマスターキーです。ClaudeやManusなどのエージェントを使っていると、ソーシャルメディア、Eコマース、オンチェーンデータ、さまざまなAPIといった外部データが必要になることがよくあります。そのたびにAPIキーを探し回り、サブスクリプションを管理し、あるいは行き詰まることになります。

AgentKeyをインストールすると、エージェントはこれらのデータ機能をすべて自動的に獲得します。プロバイダーごとの登録も、別々のAPI請求のやりくりも不要です。1つのサブスクリプションですぐに使えます。

> ⭐ 新しいプラットフォームへの対応やアップデートのリリースがあるたびに通知を受け取るには、このリポジトリにスターを付けてください。

---

## ユースケース

| エージェントに頼むこと...                               | AgentKeyなし              | AgentKeyあり                                  |
| ------------------------------------------------------ | ----------------------------- | ---------------------------------------------- |
| 🐦 最近MuskはTwitterで何と言っている?        | アクセスできず、ツイートがブロックされる  | 関連するツイートをすべて取得して要約する  |
| 📕 Instagramではこの製品はどう思われている?  | ブロックされ、ログインが必要       | 実際の投稿をスクレイピングし、感情別に整理する     |
| 📺 このYouTube / Bilibiliの動画は何を扱っている?      | 読み取れず、字幕もない      | 動画/文字起こしを読み、要点を抽出する |
| 📖 この悩みについてのRedditスレッドを探して           | 403でブロックされる                   | 関連するスレッドを見つけ、解決策を抽出する  |
| 👔 この競合 / 候補者のLinkedInを確認して        | 403、アクセスの問題            | ページを開き、重要な情報を要約する            |
| 🎵 今Douyin / TikTokで何がトレンドになっている?       | 人気リストをスクレイピングできない     | トレンドのトピックとタグを取得する                 |
| 🌐 このWebページには何と書いてある?                         | 生のHTMLの塊が返ってくる    | 内容を抽出し、わかりやすく説明する      |
| 📦 このGitHubリポジトリは何をするもの?                      | 自分でクリックして回るしかない | READMEとIssuesを読み、1行で要約する       |
| 🧾 このウォレット / ファンドは最近何を買っている?     | ブロックエクスプローラーをクリックして回る | 最近の取引とポジションを要約する  |

AgentKey以前: 10個のタスク → 10個のAPIキー → 10件の別々の請求。

エージェントはよくても半人前で、データを探すために常に人間の助けを必要とし、認証情報をやりくりし、複雑さに溺れていました。

今は: 1つのAgentKeyがすべてを処理します。**AgentKeyは、AIが実際の仕事をこなすために必要なすべての外部アクセスを統合します。**

---

## 初めての方へ: まずはWebから

ターミナルに触れる前に、ブラウザで直接AgentKeyを体験できます。Webサイトとコンソールは、このREADMEよりも視覚的にわかりやすく説明しています。

- 🌐 **[agentkey.app](https://agentkey.app)** — 製品概要、対応プラットフォーム、ライブデモ、料金の詳細
- 🎛️ **[console.agentkey.app](https://console.agentkey.app)** — サインアップ、サブスクリプションの管理、APIキーの管理、使用量の確認

下記の1行インストールは、AgentKeyをAIエージェントに接続するためのものです。まずは見て回りたいだけなら、上の2つのリンクの方が親しみやすい出発点です。

---

## インストール

コマンドは1つだけです。ログイン用のブラウザタブが開き、それで完了です。インストーラーはマシン上のすべてのエージェントを自動検出し([40以上に対応](https://github.com/vercel-labs/skills#available-agents)。代表的な例にはClaude Code、Codex、Gemini CLI、Cursor CLIなどがあります)、それぞれを設定します。

**macOS / Linux**
```bash
curl -fsSL https://agentkey.app/install.sh | bash
```

**Windows** (PowerShell)
```powershell
irm https://agentkey.app/install.ps1 | iex
```

エージェントを再起動し、インターネットが必要なことを聞いてみてください。実行中のDeepSeek HarnessプロファイルはHMRを通じてhome patchを監視しており、停止中のプロファイルは次回の起動時にそれを読み込みます。

> *「最近Muskは何についてツイートしている?」*

以上です。コピーするAPIキーも、編集するJSONもありません。 

<sub>特定のエージェントを対象にしたい、またはCIで実行したいですか? → [よくある質問](#よくある質問)の「高度なインストールオプション」の項目をご覧ください。</sub>

---

### DeepSeek Harness (DSH)

上記の1行インストーラーは、`${DSH_HOME:-~/.dsh}`または`dsh`コマンドを自動的に検出します。AgentKeyスキルを`~/.agents/skills/agentkey`にグローバルにインストールし、AgentKeyで認証を行い、DSHのホームレベルのpatchに管理されたLoaderブロックを1つ追加します:

```text
${DSH_HOME:-~/.dsh}/cordis.patch.yml
```

これは**CLIで管理されるDSH MCP統合**であり、ネイティブにインストール可能なDSHプラグインではありません。home layerはLoader id `agentkey`、モジュール`@deepseek-ai/dsh-mcp-client`、MCP `serverName: agentkey`を使用し、現在および将来のプロファイルに重ねて適用されます。preset、session、subagentがツールを見られるかどうかは、引き続きツールのallow/deny policy(tool policy)によって制御されます。

DSH 0.1.0-rc.7は、そのMCP SDKクライアントにOAuth `authProvider`を提供していません。ヘッダーのないサーバーエントリでは、401/RFC 9728のディスカバリーを完了することも、ブラウザを開くこともできません。DSHでは、CLIがローカルのBearerキーを書き込むように、下記のdevice-codeコマンドを使う必要があります。

DSHのみを手動でインストールする場合は、次の2つの手順をそのまま実行してください:

```bash
npx -y skills add chainbase-labs/agentkey -g -a universal -s agentkey -y
npx -y @agentkey/cli --auth-login --only dsh
```

CLIは実際のAPIキーを単一のローカルのhome patchにのみ保存します。キーをGitに含めてはいけません。コマンドを再実行するとキーがローテーションされ、管理されたブロックが置き換えられます。既存のプロファイルは必要ありません。移行中は、プロファイルごとのpatchからトップレベルかつ1列目にあるAgentKeyの管理ブロックのみを削除し、レガシーの`.agent-presets/agentkey`ディレクトリをタイムスタンプ付きのバックアップに名前変更します。CLIはそのバックアップのパスを表示します。マーカーのない古いAgentKey Loader行を構造的に検出した場合は、どのpatchも変更せずに停止し、そのトップレベルの`insert`の子要素を手動で削除するよう求めます。シンボリックリンク(symlink)されたプロファイルのpatchは読み取り専用で検査されます。クリーンなsymlinkプロファイルは許可されますが、いずれかのレガシーなAgentKey形式が存在する場合はインストールを停止し、手動で削除するためのパスを報告します。

home fileの変更をHMRを通じて即座に検知するのは、現在実行中のプロファイルプロセスのみです。停止中および将来のプロファイルは、起動時にそれを読み込みます。古いpresetがすでにセッションでアクティブだった場合は、移行後にそのセッションを閉じるか、DSHを一度再起動してください。

#### DSHのインストールを確認する方法

1. **DSH → Settings → Plugins → Plugin list**を開き、設定されたid `agentkey`を検索して、`mcp-client`の行を展開します。DSH 0.1では現在、次のように表示されます:
   - Loaderのパス: `include:agentkey`(安定した設定エントリのidは`agentkey`)
   - モジュールのタイトル: `@deepseek-ai/dsh-mcp-client`(カードでは`mcp-client`に短縮されます)
   - Cordisのステータス: `Mounted`(基盤となるfiberのフェーズは`active`)

   `Mounted`/`active`は、Cordisがその行を読み込んだことしか証明しません。`failOnStartupError: false`であるため、MCPが認証または接続したことは**証明しません**。

2. 意図したpreset/sessionで、3つのコアツールが表示されていることを確認します:
   - `mcp__agentkey__find_tools`
   - `mcp__agentkey__describe_tool`
   - `mcp__agentkey__execute_tool`

   `list_tools`は非推奨であり、準備完了の要件ではありません。コアツールが特定のコンテキストでのみ表示されない場合は、そのpreset/session/subagentのtool policyを確認してください。

3. 次のように聞いてみてください: **「AgentKeyを使って、今日の最新のAIニュースを検索してください。」** 成功とみなすには、Mountedのカードだけでなく、実際に`find_tools` → `describe_tool` → `execute_tool`の呼び出しが行われる必要があります。

トラブルシューティング:

- **`agentkey`の行がない:** home patchが書き込まれていないか、`DSH_HOME`が別の場所を指しています。DSHのみのCLIコマンドを再実行し、報告されたパスを確認してください。
- **行はあるがMounted/activeではない:** Loaderのエラーを確認し、DSHのインストールに`@deepseek-ai/dsh-mcp-client`が存在することを確認してください。
- **Mountedだがツールがない:** MCPの接続ログ、ローカルのAuthorizationキー、アクティブなtool policyを確認してください。`tools/list`では、各ツールのルートの`inputSchema.additionalProperties`は存在しないか`true`である必要があり、決して`false`であってはなりません。
- **401:** ローカルのキーが存在しないか無効です。auth-loginを再実行してローテーションしてください。
- **`serverName already in use`:** 現在のCLIを再実行してレガシーのpresetをアーカイブさせ、古いpresetを保持しているセッションを閉じるか、DSHを一度再起動してください。

---

## エージェントにできるようになること

AgentKeyは、オープンWeb全体にわたるクラウド側の統合を維持しています。追加のアカウントも、追加のキーも不要です。

| 機能 | 対象範囲 |
| :--- | :--- |
| **Web検索** | オープンWeb全体にわたる検索エンジン、ニュース、リアルタイムの情報発見 |
| **Webスクレイピング** | あらゆるURLからのクリーンな記事抽出、構造化データ、メタデータ |
| **オンチェーン / 暗号資産** | トークン価格、市場データ、オンチェーンのアクティビティ、プロジェクトのメタデータ |
| **ソーシャルとコンテンツ** | 主要なソーシャル・コンテンツプラットフォームにわたる公開投稿、動画、ディスカッション |
| **金融** | 株式とFXの相場、テクニカル指標、企業の財務情報、決算 |
| **Eコマース** | 主要なマーケットプレイスにわたる商品リスト、価格、レビュー、ベストセラー |
| **ビジネス** | 市場調査や競合調査のための企業、資金調達、投資家、人物のデータ |

基盤となるプロバイダーは自動的にルーティングされ、時間とともに増えていきます。エージェントは`find_tools`を呼び出して、現在利用可能なものを確認できます。

**予定:** 地図と天気

---

## よくある質問

<details>
<summary><b>安全ですか?</b></summary>

はい。AgentKeyはマスターキーです。エージェントのために外部機能を解放する1つのプラットフォームです。設計上、私たちはあなたのローカルファイル、認証情報、エージェントの会話にアクセスできません。AgentKeyが収集するデータは匿名の使用状況テレメトリ(どのエージェントにインストールしたか、スキルのバージョン、アップグレードの結果)のみであり、クエリやレスポンスは決して収集しません。下記の「テレメトリをオプトアウトするには?」をご覧ください。

</details>

<details>
<summary><b>Claude / ChatGPTに組み込まれたWebアクセスとは何が違いますか?</b></summary>

ClaudeやChatGPTのネイティブなWebアクセスは、対応するプラットフォームが限られています。Twitterやオンチェーンデータなどにはアクセスできないことがよくあります。AgentKeyはそうした隙間を埋めます。

</details>

<details>
<summary><b>料金はどうなっていますか?プランのクレジットを使い切ったらどうなりますか?</b></summary>

AgentKeyはサブスクリプション制です。各プランには毎月のクレジット枠が含まれており、それを超えた使用分は超過料金として従量課金されます。プランのアップグレードや請求の管理は、[console.agentkey.app](https://console.agentkey.app)でいつでも行えます。現在のプランと料金については[agentkey.app](https://agentkey.app)をご覧ください。

</details>

<details>
<summary><b>アップデートするには?</b></summary>

構成要素は2つあり、それぞれ更新方法が異なります:

- **MCPサーバー**: 実際のサーバーは`https://api.agentkey.app/v1/mcp`でホストされているため、常に最新です。ローカルでのアップグレード手順はありません。`@agentkey/cli`パッケージ(`npx -y @agentkey/cli --auth-login`として実行)は、各AIクライアントにリモートHTTPのMCP設定を書き込むだけなので、キーをローテーションしたい場合を除いて再実行する必要はありません。

- **スキルファイル**(`SKILL.md` + ヘルパー): 更新方法はクライアントによって異なります。

### Claude Code

アップデートは自動です。セッションの最初の呼び出しで、スキルがサイレントにバージョンチェックを実行します。新しいリリースがあればアップグレードを促し、(同意を得たうえで)`npx skills update -g agentkey`を実行します。

### Claude Desktop、Cursor、およびインラインのBashツールを持たないその他のクライアント

スキル自身はインラインのチェックを実行できませんが、v1.4.0以降は**MCPサーバーが専用のメタデータツール(`agentkey_skill_meta`)を通じて最新のスキルバージョンを公開しています**。エージェントはセッションごとに一度これを呼び出し、このスキル自身のバージョンと比較して、クライアントに合った正確なコマンドでアップグレードを促します。プロトコルの詳細は[protocol/skill-meta-v1.md](../protocol/skill-meta-v1.md)をご覧ください。

**Desktopでの1回限りのブートストラップ:** Claude Desktopで1.4.0より前のスキルのままになっている場合、メタデータツールは存在しますが、スキルのルールがそれを読む方法を知りません。次のコマンドで一度だけ最新の状態にしてください:

```bash
# Replace <UUID1>/<UUID2> with the actual session folder under skills-plugin
# (usually there's just one; pick the one that contains skills/agentkey/SKILL.md)
DESKTOP_BASE="$HOME/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin"
LATEST_REPO_ZIP=$(mktemp -d)/agentkey.tar.gz
curl -fsSL https://github.com/chainbase-labs/agentkey/archive/refs/heads/main.tar.gz -o "$LATEST_REPO_ZIP"
tar -xzf "$LATEST_REPO_ZIP" -C "$(dirname "$LATEST_REPO_ZIP")"
find "$DESKTOP_BASE" -type d -path "*/skills/agentkey" 2>/dev/null | while read -r dst; do
  cp -R "$(dirname "$LATEST_REPO_ZIP")"/agentkey-main/skills/agentkey/. "$dst/"
done
# Then fully quit and restart Claude Desktop.
```

この1回のブートストラップの後は、今後のバージョンはメタデータツールを通じて自動的に検出されます。

### 手動での強制アップデート(すべてのクライアント)

```bash
# Refresh the skill content
npx skills update agentkey

# Pin a specific version
npx skills add chainbase-labs/agentkey@v1.0.0
```

注意: `npx skills update`は`~/.agents/skills/agentkey`と`~/.claude/skills/agentkey`に書き込みます。これはClaude Codeが読み込む場所です。**Claude Desktopは独自のサンドボックスのパスから読み込む**ため、`npx skills update`の影響を受けません。Desktopには上記のDesktop用ブートストラップコマンドを使ってください。

`npx -y @agentkey/cli --auth-login`を再実行するのは、APIキーをローテーションしたい場合だけです。

</details>

<details>
<summary><b>アンインストールするには?</b></summary>

コマンド1つで、すべてのエージェントと設定ファイルをクリーンアップします。

**macOS / Linux**
```bash
curl -fsSL https://agentkey.app/uninstall.sh | bash
```

**Windows** (PowerShell)
```powershell
irm https://agentkey.app/uninstall.ps1 | iex
```

すべてのエージェントからスキルを削除し、すべてのMCPクライアントの設定から`agentkey`のMCPエントリとAPIキーを取り除き、キャッシュ/ログを消去します。Claude Codeのプラグインマーケットプレイスのエントリを残すには、`--keep-marketplace`(bash) / `-KeepMarketplace`(PowerShell)を指定してください。

**手動の2ステップの方がよいですか?**

```bash
# 1. Remove the skill from every agent
npx skills remove chainbase-labs/agentkey

# 2. Delete the "agentkey" entry under mcpServers in each MCP client config:
#    - Claude Code:     ~/.claude.json
#    - Claude Desktop:  ~/Library/Application Support/Claude/claude_desktop_config.json  (macOS)
#                       %APPDATA%\Claude\claude_desktop_config.json                      (Windows)
#    - Cursor:          ~/.cursor/mcp.json
```

コマンド1つのアンインストーラーは、さらにnpm/npxのキャッシュ、レガシーなシェルのrcエントリ、CLAUDE.mdのセクション、MCPのstdioログもクリーンアップします。完全にまっさらな状態にしたい場合はこちらを使ってください。

</details>

<details>
<summary><b>テレメトリをオプトアウトするには?</b></summary>

AgentKeyは匿名の使用状況テレメトリ(使用しているエージェント、スキルのバージョン、アップグレードの結果。クエリやレスポンスは決して含みません)を送信します。オプトアウトする方法は3つあり、どれでも機能します:

```bash
# Persistent opt-out (recommended)
touch ~/.config/agentkey/telemetry-disabled

# One-shot env override (CI / single session)
AGENTKEY_TELEMETRY=0 <your command>

# At install time
curl -fsSL https://agentkey.app/install.sh | bash -s -- --no-telemetry
```

再び有効にするには、`~/.config/agentkey/telemetry-disabled`を削除してください。

</details>

<details>
<summary><b>うまく動かない場合、どう確認すればよいですか?</b></summary>

エージェント内で`/agentkey status`を試してください。MCPの設定、バージョン、接続性を診断します。

利用可能なスラッシュコマンド:

| コマンド | 内容 |
|---------|--------------|
| `/agentkey` | データのクエリ中に自動的にトリガーされます。通常は手動で呼び出す必要はありません |
| `/agentkey setup` | 初回セットアップ: APIキーを設定し、MCPの接続性を確認します |
| `/agentkey status` | 現在の設定を診断します(MCP、バージョン、接続テスト) |

それでも解決しない場合は、下記の「どこでサポートを受けられますか」の項目をご覧ください。

</details>

<details>
<summary><b>高度なインストールオプション(CI / 特定のエージェント / 手動の2ステップ)</b></summary>

インストーラーは、このマシンにあるAIエージェントを自動検出し([vercel-labs/skillsの対応エージェントリスト](https://github.com/vercel-labs/skills)にある既知の設定ディレクトリとバイナリを調べます)、それらを事前に選択します。複数選択のプロンプトはありません。下記のフラグで上書きできます。

**インストーラーのフラグ:**

```bash
# Non-interactive (CI / unattended): install to every detected agent, no prompts
curl -fsSL https://agentkey.app/install.sh | bash -s -- --yes

# See which agents the installer would auto-select on this host (and exit)
curl -fsSL https://agentkey.app/install.sh | bash -s -- --list-agents

# Only install the skill for specific agents (overrides auto-detection)
curl -fsSL https://agentkey.app/install.sh | bash -s -- --only claude-code,cursor

# Skip our agent detection; let `skills` CLI install for every agent it finds
curl -fsSL https://agentkey.app/install.sh | bash -s -- --all-agents

# Only the skill, or only the MCP auth
curl -fsSL https://agentkey.app/install.sh | bash -s -- --skip-mcp
curl -fsSL https://agentkey.app/install.sh | bash -s -- --skip-skill
```

PowerShellでの対応するフラグ: `-Yes`、`-ListAgents`、`-Only`、`-AllAgents`、`-SkipMcp`、`-SkipSkill`。

**手動の2ステップインストール**(基盤となる2つのコマンドを自分で実行したい場合や、1行インストーラーがマシンに届かない場合):

```bash
# 1. Install the skill into every detected agent
npx skills add chainbase-labs/agentkey

# 2. Authenticate and register the MCP server
npx -y @agentkey/cli --auth-login
```

**ヘッドレス / SSH / Docker?** 認証ステップは常にブラウザを開こうとする**と同時に**URLを表示します。そのため、使えるディスプレイがないマシンでは、表示されたURLをブラウザのある任意のデバイスにコピーするだけで認証を完了できます。キーを手動で入力したいですか? `npx -y @agentkey/cli --setup`を実行すると、代わりに対話型のウィザードが開きます。

</details>

<details>
<summary><b>使っているエージェントが自動設定のリストにありません。手動でセットアップするには?</b></summary>

CLIは現在の**Supported agents**リストに表示されているクライアントに対応しており、1行インストーラーは検出した対応クライアント(**DeepSeek Harness**を含む)を対象にします。お使いのクライアントが検出されない場合や自動設定に対応していない場合でも、スキルはグローバルにインストールできますが、このMCPスニペットをそのクライアント自身の設定(パスはクライアントによって異なります)に貼り付ける必要があります:

```json
{
  "mcpServers": {
    "agentkey": {
      "type": "http",
      "url": "https://api.agentkey.app/v1/mcp",
      "headers": { "Authorization": "Bearer ak_..." }
    }
  }
}
```

その後、エージェントを再起動してください。スキルの初回起動時のアクティベーションでも、この手順を案内します。

</details>

<details>
<summary><b>セルフホストしたり、これを使って開発したりできますか?</b></summary>

**ローカルのチェックアウトからインストール:**

```bash
git clone https://github.com/chainbase-labs/agentkey.git
cd agentkey

# 1. Install your working tree into every detected agent
npx skills add .

# 2. Register the MCP server (if you haven't already)
npx -y @agentkey/cli --auth-login
```

`npx skills add .`はローカルのパス(または`file://` URL)を受け付けます。`skills/agentkey/SKILL.md`を編集するたびに再実行してください。MCPのステップはマシンごとに一度実行するだけで済みます。

**MCPサーバー自体を開発していますか?** サーバーは`AgentKey-Server/`(Go)にあり、`/v1/mcp`でMCPエンドポイントを公開しています。ローカルサーバーを実行し(`make run`)、MCPの設定を`http://localhost:8081/v1/mcp`に向けると、変更をエンドツーエンドでテストできます。

**Claude Codeプラグインモード** — マーケットプレイスから直接インストールします。プラグインにはヘッダーのないリモートHTTPエントリが同梱されており、Claude CodeのネイティブなMCP OAuthフローを使用するため、**貼り付けるAPIキーも、2つ目の`@agentkey/cli`ステップもありません**:

```bash
# Public install
claude plugin marketplace add chainbase-labs/agentkey
claude plugin install agentkey@agentkey

# …or from a local checkout, for development
claude plugin marketplace add /absolute/path/to/agentkey
claude plugin install agentkey@agentkey
```

インストール後、`/reload-plugins`を実行し、`/mcp`を開いてAgentKeyのエントリを選択し、**Authenticate**を選んでブラウザでのサインインを完了します。ターミナルからは、`claude mcp login plugin:agentkey:agentkey`で同じOAuthフローを開始できます。プラグインの`.mcp.json`には意図的に`Authorization` headerがありません。これを追加すると、Claude Codeはサーバーをヘッダー認証として扱い、401の後のOAuthフォールバックを抑制してしまいます。編集後は、`claude plugin update agentkey`でローカルのチェックアウトを再読み込みしてください。日々のSkillの反復開発は引き続きSkills CLIの方法が最速です。プラグインの方法は、Claude Codeユーザー向けのOAuthベースの選択肢です。

**Codexプラグインモード** — このリポジトリに同梱されたマーケットプレイスからインストールします。認証はOAuth(インストール時にブラウザでサインイン)なので、**貼り付けるAPIキーも、2つ目の`@agentkey/cli`ステップもありません**:

```bash
# Public install
codex plugin marketplace add chainbase-labs/agentkey
# then run /plugins inside Codex and install AgentKey,
# or: codex plugin install agentkey@agentkey
```

プラグインのマニフェストは`.codex-plugin/plugin.json`にあります。同じスキルに加えて、MCP OAuth(RFC 9728のディスカバリー)を介して`https://api.agentkey.app/v1/mcp`に対して認証するリモートHTTPのMCPエントリ(`.codex-plugin/mcp.json`)が同梱されています。Codexに求められたら、AgentKeyアカウントでサインインしてください。

**Kimi Codeプラグインモード** — Kimi Codeからリポジトリを直接インストールします。マニフェストには、スキルと、クライアントが識別される`https://api.agentkey.app/kimi/v1/mcp`ルートを指すインラインのリモートHTTP MCPエントリが同梱されているため、**貼り付けるAPIキーも、2つ目の`@agentkey/cli`ステップもありません**:

```text
# Public install
/plugins install https://github.com/chainbase-labs/agentkey

# Or install a local checkout for development
/plugins install /absolute/path/to/agentkey
```

インストール後、Kimiは`Run /new or /reload to apply plugin changes.`と表示します。`/reload`を実行し、プラグインのMCPサーバーにOAuthが必要だとKimiが報告したら、`/mcp-config login plugin-agentkey:agentkey`を実行してブラウザでの認可を承認してください。その後、元のAgentKeyへの質問をすることができます。

Kimiはローカルのプラグインを管理されたプラグインディレクトリにコピーします。チェックアウトを編集した後は`/plugins install /absolute/path/to/agentkey`を再実行し、再度`/reload`を実行してください。

以前、古いAgentKeyプラグインの回避策として`/mcp-config`でユーザーグローバルの`agentkey`エントリを追加していた場合は、再読み込みする前に`/mcp-config remove agentkey`でその古いエントリを一度削除してください。現在はプラグインが名前空間付きのMCPエントリを所有しています。両方を残すと、ツールと認証の試行が重複してしまいます。

**Cursorプラグインモード** — リストが公開された後、Cursor MarketplaceからAgentKeyをインストールします。`.cursor-plugin/plugin.json`にあるCursorネイティブのマニフェストには、同じSkillとインラインのリモートHTTP MCPエントリが同梱されているため、**貼り付けるAPIキーも、2つ目の`@agentkey/cli`ステップもありません**。CursorがMCPの認証を求めたら、AgentKeyのブラウザでのサインインを承認してください。

メンテナーの方は、プラグインを公開Gitリポジトリにプッシュし、[cursor.com/marketplace/publish](https://cursor.com/marketplace/publish)でリポジトリのURLを提出してください。提出する前に、現在のCursorのリリースでプラグインをテストし、OAuthの後に`agentkey` SkillとMCPサーバーの両方が正常に読み込まれることを確認してください。マニフェストは[Cursorのプラグインリファレンス](https://cursor.com/docs/reference/plugins)に従っています。コンポーネントのパスはプラグインのルートからの相対パスにしておいてください。

**Gemini CLI拡張機能モード** — リポジトリを拡張機能としてインストールします。ルートの`gemini-extension.json`には、既存のAgentKeyスキルとリモートのStreamable HTTP MCPサーバーが同梱されているため、**貼り付けるAPIキーも、2つ目の`@agentkey/cli`ステップもありません**:

```bash
# Public install
gemini extensions install https://github.com/chainbase-labs/agentkey

# Or link a local checkout for development
gemini extensions link /absolute/path/to/agentkey
```

インストールまたはリンクした後は、Gemini CLIを再起動してください。最初の接続時に、拡張機能の`oauth.enabled`設定によって、Geminiはネイティブのブラウザ認可を自動的に開始します。そのフローを完了してから、`/mcp reload`と`/mcp list`を実行して、`agentkey`が接続されていることを確認してください。Geminiが認証が必要だと報告するだけの場合や、ブラウザのフローが閉じられてしまった場合は、`/mcp auth agentkey`を実行して手動で開始してください。GeminiはOAuthトークンを保存して更新するため、通常は1回のサインインで済みます。拡張機能モードでは、2つ目のユーザーレベルのMCPエントリを追加したり、`@agentkey/cli --auth-login`を実行したりしないでください。

`~/.agents/skills/agentkey`が拡張機能に同梱されたコピーを上書きしているとGeminiが報告した場合、それはOAuthの失敗ではなく、別個のSkillの優先順位に関する警告です。以前にインストールしたユーザーのSkillの方が優先度が高く、同じバージョンであれば、特に他のエージェントがその共有ディレクトリを使っている場合は、安全にそのまま残しておけます。他の場所で不要になった場合にのみ、`gemini skills uninstall agentkey --scope user`で削除し、`/skills reload`を実行してください。

**Antigravity 2.0 / Antigravity CLIプラグインモード** — どちらのランタイムも、ルートの`plugin.json`、`mcp_config.json`、および既存の`skills/`ディレクトリを使用します。MCPエントリはAntigravityの`serverUrl`スキーマと、動的クライアント登録(dynamic client registration)による自動のOAuthディスカバリーを使用するため、**貼り付けるAPIキーも、設定するOAuthクライアントシークレットも、2つ目の`@agentkey/cli`ステップもありません**。

Antigravity 2.0の場合は、リポジトリをワークスペーススコープまたはグローバルスコープに配置してから、Antigravityを再起動してください:

```bash
# Workspace scope
git clone https://github.com/chainbase-labs/agentkey.git /path/to/workspace/.agents/plugins/agentkey

# Or global scope
git clone https://github.com/chainbase-labs/agentkey.git ~/.gemini/config/plugins/agentkey
```

Antigravity CLIの場合は、ローカルのチェックアウトをインストールし、登録されていることを確認してください:

```bash
agy plugin install /absolute/path/to/agentkey
agy plugin list
```

Antigravityがプラグインを検出した後は、重複するエントリを追加するのではなく、同梱されたMCPエントリを認証してください:

- **Antigravity 2.0:** **Settings → Customizations → Installed MCP Servers**を開き、AgentKeyの横にある**Authenticate**をクリックし、ブラウザのフローを完了したら、認可コードを設定パネルにコピーして戻し、送信します。サーバーは自動的に再接続します。ステータスが更新されない場合は**Refresh**をクリックしてください。
- **Antigravity CLI:** `/mcp`を開き、`agentkey`を選択し、**Authenticate**を選んで、ブラウザ/コードのプロンプトに従います。同じパネルでサーバーを再読み込みし、AgentKeyのツールが一覧に表示されることを確認してください。切断されたままの場合は、そこで接続ログを確認してください。

`mcp_config.json`には、静的なヘッダー、アクセストークン、OAuthクライアントの認証情報を含めないでください。AgentKeyは、両方のAntigravityランタイムが検出できるように、dynamic registration endpointを含むprotected-resourceとauthorization-serverのメタデータを公開しています。

**リポジトリの構成:**

```
agentkey/
├── .claude-plugin/plugin.json   # Claude Code plugin manifest
├── .codex-plugin/
│   ├── plugin.json              # Codex plugin manifest
│   └── mcp.json                 # Codex MCP entry (OAuth, no user_config)
├── .cursor-plugin/
│   └── plugin.json              # Cursor manifest with Skill + inline MCP OAuth
├── .kimi-plugin/
│   └── plugin.json              # Kimi manifest with inline MCP OAuth entry
├── .agents/plugins/marketplace.json  # Codex marketplace (this repo is its own marketplace)
├── .mcp.json                    # Claude plugin MCP entry (OAuth discovery, no headers)
├── gemini-extension.json        # Gemini CLI extension manifest (MCP OAuth + skills)
├── plugin.json                  # Antigravity desktop/CLI plugin manifest
├── mcp_config.json              # Antigravity remote MCP entry (serverUrl + OAuth)
├── skills/agentkey/
│   ├── SKILL.md                 # Decision tree + routing rules
│   ├── scripts/                 # check-update helper
│   └── version.txt              # Managed by release-please
└── scripts/
    ├── build-release-assets.sh  # Build Skill + Gemini GitHub Release assets
    ├── install.sh               # One-command installer (mac/linux)
    ├── install.ps1              # Windows PowerShell installer
    ├── uninstall.sh             # One-command uninstaller (mac/linux)
    └── uninstall.ps1            # Windows PowerShell uninstaller
```

**新しいバージョンのリリース(メンテナー向け):** リリースは[release-please](https://github.com/googleapis/release-please)によって自動的に作成されます。`feat:`または`fix:`のタイトルを持つPRをマージすると、`skills/agentkey/version.txt`、バージョン管理された4つのプラグインマニフェストすべて、`gemini-extension.json`、`CHANGELOG.md`のバージョンを上げるRelease PRが作成されます。Antigravityのスキーマには`version`フィールドがないため、そのルートの`plugin.json`はバージョンの同期の対象外です。Release PRをマージすると、タグとGitHub Releaseが作成され、`agentkey.skill`アセットが保持され、ルートに`gemini-extension.json`を含むプラットフォーム名付きのGemini拡張機能アーカイブがアップロードされます。

</details>

<details>
<summary><b>製品はどの段階にありますか?</b></summary>

アーリーアクセスです。粗削りな部分もありますが、ご容赦いただければ幸いです。機能のリクエストやバグ報告は、[GitHub Issues](https://github.com/chainbase-labs/agentkey/issues)またはTelegram(下記参照)で歓迎しています。

</details>

<details>
<summary><b>どこでサポートを受けたり、バグを報告したり、最新情報を追ったりできますか?</b></summary>

- **Telegram:** [t.me/AgentKey_Official](https://t.me/AgentKey_Official) — 一般的な質問、サポート、機能のリクエスト
- **バグ報告:** [GitHub Issues](https://github.com/chainbase-labs/agentkey/issues)
- **リリースのお知らせ:** ⭐ 通知を受け取るにはこのリポジトリにスターを付けてください

</details>

---

## スターの推移

[![Star History Chart](https://api.star-history.com/chart?repos=chainbase-labs/agentkey&type=date&legend=top-left&sealed_token=ZnduG_kCABo_uyUn3A-CRWKj9wC9AMGIDCpvu5PSfSvwKtE9Ab_5PEJNjQoQafwEYOlWr4Ioq_n7wC8vNwlwRMQ-BIz0VmBMNZq0aY-KYlH9S2i_29q9fw)](https://www.star-history.com/?repos=chainbase-labs%2Fagentkey&type=date&legend=top-left)
