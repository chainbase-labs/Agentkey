# Cost-aware batch execution

Load this when the user's request implies **≥3 AgentKey calls** or **≥10 estimated credits**. The SKILL.md "Rules" section points here; you do not need to re-derive when it applies.

The goal: never burn the user's credit balance silently. Every batch run goes balance-check → cost-estimate → user-confirm → execute.

## 1. Pre-batch workflow

```
agentkey_account()                   # 1. read remaining balance (free, no charge)
describe_tool(name=<target>)         # 2. read cost.credits_per_call
                                     # 3. estimate total = credits_per_call × N
                                     # 4. confirm with user, then execute
```

Skip the workflow only when **all three** are true:
- The request is a single call.
- The single call's `cost.credits_per_call ≤ 1`.
- The user explicitly asked you to "just run it" / "don't ask".

## 2. Reading `describe_tool`'s cost field

```jsonc
// describe_tool(name="agentkey_search")
"cost": {
  "credits_per_call": 0.2,           // default provider (= auto = cheapest)
  "usd_per_call": 0.002,
  "cost_by_provider": {              // pick a cheaper one for bulk work if available
    "brave": 0.5,
    "perplexity": 0.6,
    "serper": 0.2,
    "tavily": 1.0
  },
  "billing_note": "Charged on 2xx success only. Failed calls (4xx / 5xx) are not billed."
}
```

Three shapes you will see:
- **Single number + provider map** — search / scrape. Multiply `credits_per_call × N` for a baseline; switch providers for cheaper bulk runs.
- **`billing_note` only, no number** — `agentkey_social` top-level and `agentkey_crypto`. Cost is path-dependent. Call `describe_tool(name="<endpoint path>")` to get the deterministic per-path number, then estimate.
- **`free: true`** — `agentkey_account` and `*_catalog` tools. Use them freely in discovery; they do not draw down balance.

Failed calls (4xx validation errors, 5xx upstream errors) are **not** billed, per `billing_note`. Probing an unfamiliar endpoint with one test call before a batch is therefore free if it fails — use this to validate parameter shapes safely.

## 3. Confirming with the user

After estimating, present the plan in a single message before executing:

> I'm about to run **`<endpoint>`** **<N>** times.
> Estimated cost: **<X> credits** (≈ $<Y> USD).
> Your current balance: **<balance> credits** (read via `agentkey_account`).
> Should I proceed?

Wait for an explicit yes before calling `execute_tool`. If the user is operating an automated environment (no human in the loop indicated in conversation), proceed if the estimate is **≤ 25% of their remaining balance**; otherwise still pause and surface the numbers.

If the estimate **exceeds** the balance, do not start the batch. Tell the user how many calls fit (`floor(balance / credits_per_call)`) and ask whether to (a) run that subset, (b) stop, or (c) top up at https://console.agentkey.app first.

## 4. Cost-saving moves before you ask

Before presenting an estimate, check whether the plan can be cheaper:

- **Switch provider** when `cost_by_provider` shows a cheaper option that still satisfies the task (e.g. search → serper for bulk; scrape → firecrawl over jina).
- **Probe first**: one call against the chosen endpoint before the batch confirms the response shape and surfaces parameter errors free-of-charge.
- **Dedupe inputs**: many bulk asks (resolve 150 user IDs → profile) contain duplicates. Run `set(inputs)` first.
- **Cache locally**: when the user re-asks the same query in-session, reuse the prior response rather than re-fetching.
- **Trim N**: many "give me everything about X" requests resolve in 10 calls, not 150. Ask "how many results do you actually want?" if N is huge.

## 5. After execution

Tell the user the actual spend, not just success:

> Done. Ran **<N_executed>/<N_planned>** calls, used **<actual> credits** (estimated <X>).
> Remaining balance: **<new_balance> credits**.

Read the new balance via `agentkey_account` again only if the user asks — calling it once before and once after every batch is wasteful for small runs.

## When the balance check itself fails

If `agentkey_account` errors or returns 0 with no clear reason, do not silently proceed. Tell the user:

> I couldn't verify your AgentKey balance before this batch. Top up or check status at https://console.agentkey.app, then re-ask.

A failed balance read is almost always (a) the API key is missing/expired, or (b) a transient network blip. Both deserve user awareness before spending.
