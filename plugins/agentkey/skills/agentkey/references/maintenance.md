# AgentKey — Maintenance: version check, upgrade flow, telemetry

Load this **only** when Step 0's preflight signals a possible upgrade, or when you
need the full beacon / telemetry contract. SKILL.md keeps just the trigger; all the
detail about interpreting the beacon, prompting the user, running the upgrade, and
emitting upgrade telemetry lives here so it doesn't tax every query.

## Contents

- [Beacon response contract](#beacon-response-contract) — how to read `agentkey_skill_meta`
- [Telemetry forwarding](#telemetry-forwarding) — full `TELEMETRY` line spec
- [Upgrade flow](#upgrade-flow) — Step A (auto-upgrade) · Step B (prompt) · Step C (run)
- [error_class decision rules](#error_class-decision-rules)

---

## Beacon response contract

The `agentkey_skill_meta` response is structured JSON conforming to
[protocol/skill-meta-v1](https://github.com/chainbase-labs/agentkey/blob/main/protocol/skill-meta-v1.md).
Call it **once** with `{}` (never a second time in the same session). Apply these
rules **in order**:

1. Response missing, threw, or not valid JSON → skip silently (fall back to the inline `check-update.sh` path).
2. `response.protocol_version !== 1` → only honor `update_doc_url`; if present, remember it as a fallback for any prompt below.
3. `response.skill_version_latest === ""` → server admitted it can't tell (offline / rate-limited). Skip silently without prompting.
4. `response.skill_version_latest` equals this SKILL.md's frontmatter `version:` field → up to date. Skip silently.
5. Otherwise (versions differ): run the **Upgrade flow** below using `response.update_command` / `response.update_command_kind` / `response.update_doc_url`.

---

## Telemetry forwarding

`check-update.sh` may print a **telemetry line** (zero or one), in any order with its update line:

- `TELEMETRY <event> <key=value> ...` → forward via MCP, silently and best-effort:
  ```
  agentkey_internal({
    path: "telemetry/event",
    params: { event: "<event>", properties: { /* parsed key=value pairs */ } }
  })
  ```
- If the `agentkey_internal` tool does not exist or fails, **ignore completely** — never surface a telemetry error to the user.
- Do not let the telemetry dispatch block the rest of preflight.

---

## Upgrade flow

Triggered by either:

- **(A) Server beacon** — `agentkey_skill_meta` returned a `skill_version_latest` different from this SKILL.md's frontmatter version. Use that response's `update_command` (when present) instead of the default `npx skills update` command below. `<old>` is this SKILL.md's frontmatter version; `<new>` is `response.skill_version_latest`.
- **(B) Inline check** — `check-update.sh` printed `UPGRADE_AVAILABLE <old> <new>`. Use `<old>` and `<new>` from that line.

If 0.A already prompted the user this session, do **not** prompt again from the 0.B path. Below, `<old>` and `<new>` refer to whichever pair was resolved above.

### Step A — Check for auto-upgrade opt-in

```bash
if [ "${AGENTKEY_AUTO_UPGRADE:-0}" = "1" ] || [ -f "${XDG_CONFIG_HOME:-$HOME/.config}/agentkey/auto-upgrade" ]; then echo AUTO=1; fi
```

If the output is `AUTO=1`: tell the user once "Auto-upgrading AgentKey v\<old\> → v\<new\>…", run **Step C**, then continue to the tool-verification step. **Do not** show the AskUserQuestion prompt.

### Step B — Otherwise, prompt the user

If a Bash tool is available (Claude Code etc.), use `AskUserQuestion`. Otherwise (Claude Desktop and any web/sandboxed client without shell access), display the question and four options as a normal chat message and parse the user's natural-language reply.

**Important — persistence caveat for no-Bash clients:** the *Always*, *Not now*, and *Never ask again* options each persist state by writing a file under `~/.config/agentkey/`. Without a Bash tool you **cannot** write those files. Do not pretend you did — follow the no-Bash fallback line in each option below and tell the user exactly what state did or didn't get saved.

- Question: `AgentKey v<new> is available (currently on v<old>). Upgrade now?`
- Options:
  - **`Yes, upgrade now`** → run **Step C**.

    After running **Step C**, dispatch (silently, ignore failures):
    ```
    agentkey_internal({
      path: "telemetry/event",
      params: { event: "upgrade_decision", properties: {
        from_version: "<old>", to_version: "<new>", choice: "accept_once"
      }}
    })
    ```
  - **`Always keep me up to date`** →
    - **With Bash:** run `mkdir -p "${XDG_CONFIG_HOME:-$HOME/.config}/agentkey" && touch "${XDG_CONFIG_HOME:-$HOME/.config}/agentkey/auto-upgrade"`. Tell the user "Auto-upgrade enabled — future AgentKey updates install automatically. Remove `~/.config/agentkey/auto-upgrade` to undo." Then run **Step C**.
    - **No Bash:** tell the user verbatim: "Your current client can't run shell commands, so I can't enable auto-upgrade for you. To turn it on, run this in your terminal once: `mkdir -p ~/.config/agentkey && touch ~/.config/agentkey/auto-upgrade`. For now I'll proceed with this one-time upgrade." Then run **Step C**.

    After the action, dispatch (silently, ignore failures):
    ```
    agentkey_internal({
      path: "telemetry/event",
      params: { event: "upgrade_decision", properties: {
        from_version: "<old>", to_version: "<new>", choice: "accept_always"
      }}
    })
    ```
  - **`Not now`** →
    - **With Bash:** run the snooze script:
      ```bash
      _CFG="${XDG_CONFIG_HOME:-$HOME/.config}/agentkey"
      _SNOOZE="$_CFG/update-snoozed"
      _NEW="<new>"
      _LEVEL=0
      if [ -f "$_SNOOZE" ]; then
        _SVER=$(awk '{print $1}' "$_SNOOZE" 2>/dev/null)
        [ "$_SVER" = "$_NEW" ] && _LEVEL=$(awk '{print $2}' "$_SNOOZE" 2>/dev/null)
        case "$_LEVEL" in *[!0-9]*) _LEVEL=0 ;; esac
      fi
      _LEVEL=$((_LEVEL + 1)); [ "$_LEVEL" -gt 3 ] && _LEVEL=3
      mkdir -p "$_CFG" && echo "$_NEW $_LEVEL $(date +%s)" > "$_SNOOZE"
      echo "SNOOZED_LEVEL=$_LEVEL"
      ```
      Translate the level into a duration for the user — `SNOOZED_LEVEL=1` → "Next reminder in 24h", `2` → "in 48h", `3` → "in 1 week". Continue to tool verification — **do not** upgrade.
    - **No Bash:** tell the user verbatim: "Skipping for now. Your current client can't persist a snooze, so you may be re-prompted next session. To silence prompts for longer, run in a terminal once: `mkdir -p ~/.config/agentkey && touch ~/.config/agentkey/update-disabled` (permanently off — delete that file to re-enable)." Continue to tool verification — **do not** upgrade.

    Map the choice for telemetry: With-Bash uses `SNOOZED_LEVEL` (`1` → `snooze_1d`, `2` → `snooze_2d`, `3` → `snooze_7d`); No-Bash uses `snooze_1d` (no persisted level). Then dispatch (silently, ignore failures):
    ```
    agentkey_internal({
      path: "telemetry/event",
      params: { event: "upgrade_decision", properties: {
        from_version: "<old>", to_version: "<new>", choice: "<mapped choice>"
      }}
    })
    ```
  - **`Never ask again`** →
    - **With Bash:** run `mkdir -p "${XDG_CONFIG_HOME:-$HOME/.config}/agentkey" && touch "${XDG_CONFIG_HOME:-$HOME/.config}/agentkey/update-disabled"`. Tell the user "Update checks disabled. Remove `~/.config/agentkey/update-disabled` to re-enable." Continue to tool verification — **do not** upgrade.
    - **No Bash:** tell the user verbatim: "Your current client can't run shell commands, so I can't persist this. To disable update checks permanently, run in a terminal once: `mkdir -p ~/.config/agentkey && touch ~/.config/agentkey/update-disabled`. I'll skip this prompt for the rest of this session." Continue to tool verification — **do not** upgrade.

    After the action, dispatch (silently, ignore failures):
    ```
    agentkey_internal({
      path: "telemetry/event",
      params: { event: "upgrade_decision", properties: {
        from_version: "<old>", to_version: "<new>", choice: "never_ask"
      }}
    })
    ```

### Step C — Run the upgrade

Branch by trigger:

**(A) Server-beacon trigger** — `response.update_command` decides:
- `update_command_kind === "shell"` → Display the command verbatim. If a Bash tool is available, offer to run it for the user; otherwise instruct them to paste it into their terminal.
- `update_command_kind === "manual_ui"` (or any unrecognized future kind) → Display `response.update_command` as instructions only; do **not** attempt to execute.
- `response.update_command` is absent → No automated path exists for this client. Tell the user verbatim, substituting `<new>` and the actual URL:
  > AgentKey skill v\<new\> is available but your client doesn't have an auto-installer. Download the latest release manually from GitHub: **\<release_notes_url, if response contains one, otherwise https://github.com/chainbase-labs/agentkey/releases/latest\>**. Then replace your skill files with the contents of `skills/agentkey/` from the release archive and restart your client.

**(B) Inline-check trigger (Claude Code with Bash)** — run:
```bash
npx skills update agentkey
```
On success: tell the user "✓ AgentKey updated to v\<new\>." On failure: show the failure verbatim and tell the user "Run `npx skills update agentkey` manually to retry. If that doesn't work for your client, download from https://github.com/chainbase-labs/agentkey/releases/latest instead." Either way, continue to tool verification.

After the `npx` command returns, dispatch (silently, ignore failures):
```
agentkey_internal({
  path: "telemetry/event",
  params: { event: "upgrade_result", properties: {
    from_version: "<old>", to_version: "<new>",
    status: <"ok" if npx succeeded else "fail">,
    error_class: <one of "network" | "npx_failed" | "permission" | "unknown" if status=="fail" else null>
  }}
})
```

---

## error_class decision rules

- npx exit code 0 → `status: "ok"`, `error_class: null`
- npx output contains `ENOTFOUND` / `ETIMEDOUT` / `ECONNREFUSED` → `network`
- npx output contains `EACCES` / `permission denied` → `permission`
- npx ran but reported its own failure → `npx_failed`
- otherwise → `unknown`

Once the upgrade flow (or snooze/disable) completes, return to SKILL.md Step 0's
tool-verification step and then route by intent.
