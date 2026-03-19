# Pull Request: Frontend Partner Configuration with NLP Override

## Branch Name
`feat/frontend-partner-config`

## Summary
This PR makes partner selection deployment-driven from the frontend by introducing `VITE_PARTNER` as the normal-flow source of truth. It keeps the NLP path authoritative, so any session created through the NLP SSO route continues to force `partner = nlp` regardless of the configured deployment partner.

This change is coordinated with the `report-pdf` PR on branch `feat/report-pdf-partner-branding`.

## Description
Different frontend deployments need to behave as different partner experiences without changing backend code per deployment. This PR wires partner selection through frontend environment configuration and propagates that partner value across report creation and report PDF retrieval flows.

The backend still retains a fallback resolver so report generation does not break if partner is absent or older records need backfilling.

## Key Changes
1. **Frontend Deployment Partner Config**
   - Added `VITE_PARTNER` handling in frontend config.
   - Supported deployment values are `naviksha` and `allen`.
   - Defaults safely to `naviksha` when the env is unset or invalid.

2. **Assessment Submission Partner Propagation**
   - Normal assessment submissions now stamp `partner` from `VITE_PARTNER`.
   - NLP flow still overrides this and stamps `partner = nlp`.

3. **Report Download / Share Propagation**
   - Report viewer now passes the deployment-configured partner while requesting the report PDF link.
   - NLP sessions still explicitly pass `nlp`.

4. **Backend Fallback Support**
   - Added a backend `PartnerResolver` service to normalize and backfill partner values.
   - Existing report-link generation logic remains compatible with older reports that do not yet have a stored partner.

5. **Environment / Deployment Documentation**
   - Added `VITE_PARTNER` to `.env.example`.
   - Existing backend-side fallback documentation remains in place for operational safety.

## Behavior Notes
- `VITE_PARTNER=naviksha` -> normal flows produce/report `partner = naviksha`
- `VITE_PARTNER=allen` -> normal flows produce/report `partner = allen`
- NLP login via `/nlp?nlp_sso_token=...` -> report partner is always `nlp`

## Testing Instructions
1. Set `VITE_PARTNER=naviksha` and run the frontend.
2. Complete a normal assessment flow and confirm the generated report uses `partner = naviksha`.
3. Set `VITE_PARTNER=allen` and repeat; confirm the generated report uses `partner = allen`.
4. With either env value still set, access the NLP flow using `/nlp?nlp_sso_token=TEST_TOKEN`.
5. Complete the NLP flow and confirm the generated report still uses `partner = nlp`.
6. Download/share the report from the report viewer and verify the same partner precedence is preserved.

## Verification / Validation
- `npm run build` passes successfully.
- Backend compile passes with `mvn -DskipTests compile`.
- Existing partner fallback logic remains available for missing or legacy records.

## Cross-Repo Dependency
- Coordinated with `report-pdf`
- Companion branch: `feat/report-pdf-partner-branding`
- Companion PR title: `feat: add request-driven partner branding for report pdf`
