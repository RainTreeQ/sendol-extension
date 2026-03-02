---
name: planning-risk-guard
description: 在任务规划与执行策略制定中提供结构化风险检查与提醒。Use when users ask for implementation plans, roadmap breakdowns, feasibility decisions, release plans, or automation without manual intervention. Especially use for external website automation, anti-abuse and policy risk, account safety, privacy and security handling, cost and timeline pressure, and irreversible failure modes.
metadata:
  short-description: Add risk checks to key task planning checkpoints
---

# Planning Risk Guard

## Goal

- Insert concise risk reminders at critical planning checkpoints.
- Surface irreversibility, stop conditions, and mitigations before execution commits.

## Critical Checkpoints

Run risk reminders at these moments:

1. Before confirming scope, timeline, or execution plan.
2. Before automating external websites or platform interactions.
3. Before enabling unattended mode, high-frequency actions, or bulk operations.
4. Before touching production data, credentials, billing, or user accounts.
5. Before deploy/release and before any one-way migration or irreversible change.

## Risk Scan Workflow

1. Identify scope, assumptions, and irreversible actions.
2. List top risks across five buckets:
- Platform and policy risk: rate limits, anti-abuse, terms constraints.
- Security and privacy risk: credential handling, token exposure, PII.
- Reliability and maintenance risk: selector drift, brittle automation, hidden coupling.
- Delivery risk: schedule compression, dependency uncertainty, testing gaps.
- Business impact risk: account suspension, downtime, unexpected cost.
3. Score each risk:
- Impact: `low | medium | high`
- Probability: `low | medium | high`
- Reversibility: `reversible | hard-to-reverse | irreversible`
4. Prioritize critical risks:
- Mark as critical when impact is high and probability is medium/high.
- Mark as critical when reversibility is hard-to-reverse or irreversible.
5. Define guardrails for each critical risk:
- Mitigation action.
- Monitoring signal.
- Stop condition.
- Rollback path (if available).

## Response Format

When this skill triggers, add a section titled `Risk Reminder` with:

1. `Critical Risks`
2. `Mitigations`
3. `Stop Conditions`
4. `Decision Needed`

Keep the section short, concrete, and threshold-based.

## Example Output Template

```markdown
Risk Reminder
1. Critical Risks
- [High] Platform anti-abuse trigger due to unattended high-frequency actions; reversibility: hard-to-reverse.

2. Mitigations
- Enforce serial execution, cooldown `>= 3s`, and daily cap.
- Disable unattended mode for login, captcha, or policy-warning paths.

3. Stop Conditions
- Stop immediately on captcha, repeated 429/403, or policy warning UI.
- Require manual confirmation before resuming.

4. Decision Needed
- Accept lower throughput for lower account risk, or switch to official API path.
```

## Non-negotiables

- Do not claim zero risk for external platform automation.
- Explicitly call out when a risk cannot be fully eliminated.
- Prefer safer alternatives when unattended or large-scale execution is requested.
