# Human-in-the-loop

## Automated Tests
Automated tests are run by Vercel at build time and code changes are blocked from being integrated, via Pull Request, until the Vercel build passes.

Run automated tests locally with `npm test`.

In unit tests, Storybook stories are reused for test setup.

## Code Quality
Code changes are blocked from being integrated, via Pull Request, until build checks pass. This trades-off some throughput for quality with the goal of maintaining developer efficiency as the application complexity or team size increases.

Code linting and formatting checks (ES Lint with Prettier plugin) make code easier to read by the team (or yourself in a weeks time). Run linting and formatting checks with `npm run lint`. Automatic code formatting is well supported by editors and so friction should be minimal.

TypeScript is used to ensures the correctness of typing in order to catch simple but common mistakes at compile-time, before they reach production. Run TypeScript compilation with `npx tsc`. 

## Development

### System Dependencies
* NPM
* Vercel CLI

### Run locally
* Login to Vercel with `vercel login`
* Start a local development server by running `vercel dev` in the repository root directory. The local server will have access to pre-production environment resources via Vercel OIDC identity.

