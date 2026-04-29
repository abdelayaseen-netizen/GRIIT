# Security Debt Register

Updated: 2026-04-29

Remaining vulnerabilities after `npm audit fix` and targeted non-breaking patching are currently moderate-only.  
High severity has been reduced to 0.

## Deferred Breaking Fixes

| Package Chain | Severity | Advisory / Reference | Deferred Reason |
|---|---|---|---|
| `vite` / `vite-node` / `vitest` / `esbuild` | Moderate | [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) | Requires `vitest@4.x` major upgrade; deferred to dedicated test-infra sprint. |
| `expo` dependency chain (`@expo/config*`, `expo-asset`, `expo-notifications`, `postcss`, `uuid`, `xcode`) | Moderate | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93), [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | Requires major Expo downgrade/shift path from audit recommendation (`expo@49.0.23`) which is incompatible with current Expo 54 stack; deferred to planned Expo dependency review. |

## Closed in Sprint 1

- `@trpc/server` high severity advisory [GHSA-43p4-m455-4f4j](https://github.com/advisories/GHSA-43p4-m455-4f4j) resolved by upgrading to `10.45.4`.
