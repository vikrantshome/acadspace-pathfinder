# Pull Request: Allow Allen Frontend Origins in Backend CORS

## Branch Name
`fix/allen-frontend-cors`

## Summary
This PR updates backend CORS handling so the newly created Allen frontend deployment can successfully call backend lookup and authentication endpoints. It adds the Allen Vercel deployment origin and the planned Allen custom domain to the backend allow list, and documents the `CORS_ALLOWED_ORIGINS` override used in deployed environments.

## Description
The Allen frontend is now deployed as its own Vercel instance, but backend requests from that origin were blocked by the Spring Security CORS configuration. This PR expands the default allowed origin list to include the Allen deployment and future custom domain so the frontend can complete login and report-related flows without browser CORS failures.

Because deployed environments may override the default list through `CORS_ALLOWED_ORIGINS`, the PR also documents that variable so operations can keep runtime configuration aligned with code.

## Key Changes
1. **Backend Default CORS Allow List**
   - Added `https://acadspace-pathfinder-allen.vercel.app`.
   - Added `https://allen.naviksha.co.in`.
   - Added `http://allen.naviksha.co.in` as an HTTP fallback for edge cases.

2. **Deployment Configuration Documentation**
   - Added `CORS_ALLOWED_ORIGINS` to `.env.example`.
   - Documented the Allen Vercel origin and planned Allen custom domain in the example value.

3. **Local Vercel Metadata Hygiene**
   - Added `.vercel` to `.gitignore` so local project-link metadata is not accidentally committed.

## Testing Instructions
1. Start the backend with the updated CORS configuration.
2. Open the Allen frontend deployment at `https://acadspace-pathfinder-allen.vercel.app`.
3. Attempt the login lookup flow and confirm the browser no longer reports a CORS error.
4. If the backend uses `CORS_ALLOWED_ORIGINS` at runtime, update that deployed env value to include the Allen origin and redeploy the backend.
5. After the custom domain is attached, verify the same flow from `https://allen.naviksha.co.in`.

## Verification / Validation
- `mvn -DskipTests compile` passes successfully.

## Deployment Notes
- The code change updates the backend default allow list.
- If a deployed backend sets `CORS_ALLOWED_ORIGINS`, that env var takes precedence and must also include the Allen origin(s).
