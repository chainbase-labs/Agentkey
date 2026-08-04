# Cost-aware batch execution

Load this when the user's request implies **≥3 AgentKey calls** or **≥10 estimated credits**. The SKILL.md "Rules" section points here; you do not need to re-derive when it applies.

The goal: never consume the user's included credit balance silently or start a batch that exceeds it. Every batch run goes cost-estimate → balance-check → user-confirm → execute.

## 1. Pre-batch workflow

```
find_tools(q=<the task>)                    # 1. per-call cost is already in the result
describe_tool(name=<chosen tool>)           # 2. confirm cost + params before committing
execute_tool(name="agentkey_account")       # 3. read remaining balance (free, no charge)
                                            # 4. estimate total = cost × N
                                            # 5. confirm with the user, then execute
```

`find_tools` returns a `cost` field on every match, so you can compare offerings and do the multiplication **before** spending a `describe_tool` round-trip. Use `describe_tool` to confirm the number and get the params for the tool you actually picked.

Skip the workflow only when **all three** are true:
- The request is a single call.
- That call's cost is **≤ 1 credit**.
- The user explicitly asked you to "just run it" / "don't ask".

## 2. Reading the cost fields

`find_tools` — one number per match, in credits per call:

```jsonc
{ "name": "<Provider>/<Operation>", "summary": "…", "cost": 0.2, "score": 0.71 }
```

`describe_tool` — the same figure plus the per-provider breakdown:

```jsonc
"cost": {
  "credits_per_call": 0.2,              // what this tool charges
  "cost_by_provider": { "<vendor>": 0.2 },
  "billing_note": "…"                   // failed calls are not billed
}
```

Two shapes you will see:
- **A number** — the normal case. Multiply `credits_per_call × N` for the batch estimate.
- **`billing_note` only, no number** — cost is route-dependent. Call `describe_tool` on the specific tool (not a category path) to get a deterministic number, then estimate.

`execute_tool(name="agentkey_account")` is free and draws down nothing.

Failed calls (4xx validation errors, 5xx upstream errors) do **not** consume credits. Probing an unfamiliar tool with one test call before a batch is therefore free if it fails — use this to validate parameter shapes safely.

## 3. Confirming with the user

After estimating, present the plan in a single message before executing:

> I'm about to run **`<tool>`** **<N>** times.
> Estimated usage: **<X> credits**.
> Your current balance: **<balance> credits**.
> Should I proceed?

Wait for an explicit yes before calling `execute_tool`. If the user is operating an automated environment (no human in the loop indicated in conversation), proceed if the estimate is **≤ 25% of their remaining balance**; otherwise still pause and surface the numbers.

If the estimate **exceeds** the remaining allowance, do not start the batch. Tell the user how many calls fit within the allowance (`floor(balance / cost_per_call)`) and ask whether to (a) run that subset, (b) stop, or (c) wait until credits become available.

## 4. Credit-saving moves before you ask

Before presenting an estimate, check whether the plan can be cheaper:

- **Switch provider.** The same capability is usually served by several vendors at different prices, and `find_tools` returns all of them with their costs. Pick the cheapest one that still satisfies the task.
- **Probe first**: one call against the chosen tool before the batch confirms the response shape and surfaces parameter errors free-of-charge.
- **Dedupe inputs**: many bulk asks (resolve 150 user IDs → profile) contain duplicates. Run `set(inputs)` first.
- **Cache locally**: when the user re-asks the same query in-session, reuse the prior response rather than re-fetching.
- **Trim N**: many "give me everything about X" requests resolve in 10 calls, not 150. Ask "how many results do you actually want?" if N is huge.

## 5. After execution

Tell the user the actual credit usage, not just success:

> Done. Ran **<N_executed>/<N_planned>** calls, used **<actual> credits** (estimated <X>).
> Remaining balance: **<new_balance> credits**.

Re-read the balance via `execute_tool(name="agentkey_account")` only if the user asks — calling it once before and once after every batch is wasteful for small runs.

## When the balance check itself fails

If `agentkey_account` errors or returns 0 with no clear reason, do not silently proceed. Tell the user:

> I couldn't verify your AgentKey balance before this batch, so I did not start it. Verify your credentials or try again later, then re-ask.

A failed balance read is almost always (a) the API key is missing/expired, or (b) a transient network blip. Both deserve user awareness before consuming credits.
