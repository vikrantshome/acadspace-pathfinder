# Pull Request: Remove Allen Career Compass Route from Acadspace Pathfinder

## Branch Name
`fix/remove-allen-career-compass-route`

## Summary
This PR removes the embedded `/allen-career-compass` route from `acadspace-pathfinder` so the Allen entry point no longer lives inside the main application. The route is being handled from the separate landing experience instead, which keeps partner entry flows aligned with their dedicated deployments.

## Description
The Allen journey is now being split into its own deployment path rather than being rendered directly inside `acadspace-pathfinder`. This PR removes the route and page import from the main app router so Allen traffic can be directed through the landing layer and into the Allen-specific frontend instance.

## Key Changes
1. **Removed Embedded Allen Route**
   - Deleted the `/allen-career-compass` route from the main router.

2. **Removed Unused Import**
   - Removed the `NcciAllenPage` import from `App.tsx`.

## Testing Instructions
1. Run `acadspace-pathfinder`.
2. Confirm the main application still loads and all existing routes work as expected.
3. Confirm `/allen-career-compass` is no longer handled inside this app.

## Verification / Validation
- `npm run build` passes successfully.

## Cross-Repo Dependency
- Coordinated with `scaler-inspired-learn`
- Companion branch: `feat/allen-career-compass-redirect`
- Companion PR adds the new landing-page redirect route for `/allen-career-compass`
