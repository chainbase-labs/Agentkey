# AgentKey QA Checklist

> Run this from the **user's perspective** — don't peek at the filesystem or MCP config internals. The only things that matter are: "does it work?", "is the answer correct?", and "is the experience OK when things break?"
>
> 中文版本：[QA-CHECKLIST_zh.md](QA-CHECKLIST_zh.md)

---

## 0. Prerequisites

- [ ] An IDE with AgentKey installed (Claude Code is the simplest)
- [ ] A valid API key

---

## 1. Real-Time Data Queries (Core Value)

Say these prompts to the AI and check whether the answer is correct. **The key thing is that the content must be real and current — not hallucinated.**

### 1.1 Crypto

| Prompt | Correct | Wrong (bug) |
|---|---|---|
| "What's BTC's price right now?" | Returns the real current price (matches exchanges) | Says "I don't know" / gives a stale 2023 price / makes one up |
| "How much has ETH moved today?" | Returns the % change | Says "I can't query real-time data" |
| "What's USDT's market cap?" | Returns the current market cap | Off by an order of magnitude |
| "What are the top 10 coins by market cap right now?" | Lists BTC, ETH, USDT… ordering and numbers are sensible | Missing entries / clearly wrong order |
| "How much ETH is in Vitalik's wallet?" (public wallet) | Returns the real balance | Makes up a number |

### 1.2 Social Media

| Prompt | Correct | Wrong (bug) |
|---|---|---|
| "What has Trump been posting on X/Twitter lately?" | Returns real recent tweets with sensible timestamps | Returns tweets from years ago / fabricated content |
| "Popular Xiaohongshu posts about iPhone 16 recently" | Returns real post titles and authors | Says "not supported" / returns empty |
| "MrBeast's latest YouTube video" | Returns the real video title and date | Returns a video from the wrong creator |
| "Top post in Reddit r/programming today" | Returns a real post | Says "I can't access Reddit" |
| "Recent Douyin/TikTok videos of a specific dance" | Returns relevant results | Empty results (when there clearly are some) |
| "Trending Weibo topics about a specific celebrity" | Returns real trending terms | Claims Chinese platforms aren't supported |

**覆盖平台核对单**（每个至少试一次，带推荐端点，方便冒烟时直接拿来用）：

| 平台 | 推荐冒烟端点 | 典型问法 |
|---|---|---|
| [ ] Twitter/X | `twitter/web/fetch_search_timeline` | "X 上关于 OpenAI 的热帖" |
| [ ] TikTok | `tiktok/web/fetch_trending_searchwords` | "TikTok 今天的热搜词" |
| [ ] Instagram | `instagram/v3/search_hashtags` | "Instagram 上 #travel 有多少帖子" |
| [ ] YouTube | `youtube/web_v2/get_general_search_v2` | "MrBeast 最新视频" |
| [ ] Reddit | `reddit/app/fetch_popular_feed` 或 `fetch_subreddit_feed` | "Reddit 今天最热的帖子" |
| [ ] 小红书 | `xiaohongshu/app_v2/search_notes` 或 `web_v3/fetch_search_notes` | "小红书 iPhone 16 热门笔记" |
| [ ] 微博 | `weibo/app/fetch_hot_search` | "微博热搜" |
| [ ] 抖音 | `douyin/app/v3/fetch_hot_search_list` | "抖音热榜" |
| [ ] 知乎 | `zhihu/web/fetch_hot_list` | "知乎热榜" |
| [ ] B 站 | `bilibili/app/fetch_popular_feed` | "B 站综合热门" |
| [ ] Threads | `threads/web/fetch_user_info` | "Threads 上 @zuck 的资料" |
| [ ] LinkedIn | `linkedin/get_company_profile` | "OpenAI 公司 LinkedIn 主页" |
| [ ] 快手 | `kuaishou/fetch_hot_board_detail` | "快手热榜" |
| [ ] 微信公众号 | `wechat_mp/fetch_mp_article_detail_json` | "解读这篇公众号文章 {URL}" |
| [ ] 视频号 | `wechat_channels/fetch_hot_words` | "视频号热词" |
| [ ] 头条 | `toutiao/get_article_info` | "看看这篇头条 {URL}" |
| [ ] 西瓜视频 | `xigua/fetch_user_post_list` | "西瓜某 UP 主作品" |
| [ ] 皮皮虾 | `pipixia/fetch_hot_search_board_detail` | "皮皮虾热搜" |
| [ ] Lemon8 | `lemon8/fetch_discover_tab` | "Lemon8 发现页" |
| [ ] Sora 2 | `sora2/get_feed` | "Sora 2 推荐视频" |

**端点路径自查命令**：若某次调用返回 `unknown social endpoint`，用 `find_tools(q=<平台>)` 拿正确路径，不要盲试。

**期望覆盖**：AgentKey 共 21 个社交平台、~800 个端点。单次测试跑完上表 ≈ 20 条即可证明 MCP 路由/计费/数据管线在所有主流平台上均通。

### 1.3 Search / Scrape

| Prompt | Correct | Wrong |
|---|---|---|
| "What's the latest OpenAI news?" | Returns real news from the past few days | Returns news from a year ago |
| "Summarize this page: https://xxx.com" (real URL) | Summarizes the page content | Says it can't open the page |
| "Who won the 2024 Nobel Prize in Physics?" | Gives the real winner | Says "I don't know". (If the date is before the AI's knowledge cutoff the model could answer from memory — the point is that **real-time questions should prefer AgentKey**.) |

---

## 2. Non-Queries / False Triggers

These are cases where AgentKey **should not** be used. Check that the AI isn't abusing the tools:

| Prompt | Correct | Wrong |
|---|---|---|
| "What is blockchain?" (conceptual) | Answers from existing knowledge, doesn't call AgentKey | Calls `agentkey_search` and wastes credits |
| "Write me a Python sort function" | Writes the code directly | Calls AgentKey to search for code |
| "What's 1 + 1?" | Answers 2 | Runs a search |
| "Hi" | Returns a greeting | Triggers the setup flow |

---

## 3. Phrasing Variations (Chinese / abbreviations / aliases)

The same intent phrased differently should all work:

| Phrasing A | Phrasing B | Should produce equivalent results |
|---|---|---|
| "比特币价格" | "BTC price" / "what's BTC worth" | ✅ |
| "推特" | "Twitter" / "X" | ✅ |
| "小红书" | "RED" / "xiaohongshu" | ✅ |
| "以太坊" | "ETH" | ✅ |

---

## 4. Error Experience

Deliberately create failure scenarios and check that the AI responds like **a PM wrote the message** — not raw error codes:

| Manufactured failure | Expected AI response | Should NOT |
|---|---|---|
| Remove the API key, then ask for BTC price | "Your AgentKey isn't configured — grab a key at console.agentkey.app" | Dump `{"error": "ECONNREFUSED"}` |
| Use an expired / wrong key | "API key is invalid — replace it with a new one" | Surface a raw HTTP 401 |
| Ask for a nonexistent Twitter user: "look up @definitely_not_a_real_user_xyz_123" | "User not found" | Fabricate a profile |
| Fire 20 queries in a row (trip rate limits) | "Rate limited — hold on", recovers automatically | Hang / drop later queries |
| Query while offline | "Network is down — check your connection" | Spin for 2 minutes before timing out |

---

## 5. Data Authenticity (anti-hallucination)

This is the most important category. **Cross-check against independent sources.**

- [ ] BTC price → compare with [CoinMarketCap](https://coinmarketcap.com), delta <1%
- [ ] Engagement numbers on a specific tweet → match the Twitter web UI
- [ ] View count of a specific YouTube video → match the YouTube web UI
- [ ] "What's the big AI news today?" → compare against [TechCrunch AI](https://techcrunch.com/category/artificial-intelligence/); headline events should appear in the response

**Red flags:**
- 🚩 Prices always round integers ("BTC = $70,000") → likely hallucinated
- 🚩 Timestamps are always "a few days ago" instead of specific dates → likely no real call was made
- 🚩 Asking the same question repeatedly produces wildly different answers (price swings 10%+) → cached / fake data
- 🚩 Author names are random letters → fabricated

---

## 6. Multi-Turn Coherence

真实用户很少一句话解决问题，要测多轮。**重点考察的是 AI（Claude/Cursor 等宿主）对 AgentKey 返回结果的复用，而非 AgentKey 本身（AgentKey 是无状态的）**：

| 对话序列 | 期望 | 不应该 |
|---|---|---|
| [ ] "BTC 现在多少钱？" → "那 ETH 呢？" | 识别"ETH"为新 symbol，复用 `cmc_quotes` 工具，保留币价语境 | 重新理解为"ETH 是什么"走概念路径 |
| [ ] "查 GIGGLE 行情" → "它涨了多少？" | 从上轮返回里读 `percent_change_24h`，**不再重复调用** | 再次调用 MCP 浪费 credits |
| [ ] "微博今天热搜" → "第 3 条详细讲讲" | 基于上轮 `items[2]` 的标题继续（可能再调 `fetch_search_all`） | 跳去搜全网 |
| [ ] "查 @zuck 的 Threads" → "他粉丝比 X 上多吗？" | 复用已有 follower_count，再调 Twitter API 对比 | 把 follower_count 瞎编 |
| [ ] "查苹果股价" → "画个过去一周的走势" | 如无历史数据端点，**明确说不支持**，并给出替代方案 | 编一条趋势 |
| [ ] "搜 OpenAI 新闻" → "第 1 条打开看看" | 用 `agentkey_scrape` 拉第 1 条 URL | 重搜 |

**红旗**：
- 🚩 追问"它"/"那个"/"第 N 个"时，AI 重新搜索 → 上下文未保留
- 🚩 追问无关问题时，AI 仍用旧上下文答 → 过度粘滞
- 🚩 复用上轮数据但数字"漂移"（小数点不同）→ 编造

---

## 7. Install Experience (non-developer perspective)

For a first-time user, from the moment they run the command to the moment they get their first real answer — is the flow smooth?

| Step | Expected | Unacceptable |
|---|---|---|
| Run `npx @agentkey-cli/cli install` | First screen clearly tells me what to pick | Red errors / hangs / tells me to read docs |
| Pick an IDE host | My IDE is auto-detected and pre-selected | Didn't detect my IDE (even though it's installed) |
| Enter API key | A link tells me where to get one | Leaves me to find it myself |
| Finish install | Tells me the next step (restart IDE) | Exits silently |
| Restart IDE, ask first question | Just works | Requires additional setup |
| Claude Desktop / Manus users | Clearly tells me which file I need to paste config into | Pretends it finished installing when it didn't |

---

## 8. 2-Minute Smoke Test

When there's no time to run the full checklist, at minimum verify these 5:

1. [ ] **Installs cleanly** — `npx @agentkey-cli/cli install` walks through interactively and installs Claude Code
2. [ ] **Crypto price works** — "What's BTC's price right now?" → sensible number
3. [ ] **Social works** — "Hot posts on X about OpenAI" → real results
4. [ ] **No false triggers** — "What is machine learning?" → answered directly, no MCP call
5. [ ] **Graceful errors** — break the key, then ask → human-readable error message

---

## Bug Report Template

```
Title: <one-line summary of the symptom>

Environment:
- IDE: Cursor 0.x / Claude Code / ...
- OS: macOS 15
- AgentKey version: v0.4.0

Repro steps:
1. I asked "xxx"
2. AI replied "yyy"

Expected: <what should have happened>
Actual: <what actually happened>
Screenshot: [attach]

Severity:
  🔴 P0 — core functionality broken (can't fetch real-time data)
  🟡 P1 — bad UX but there's a workaround (confusing error)
  🟢 P2 — minor (awkward copy)
```
