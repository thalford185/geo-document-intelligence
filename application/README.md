# Application

## Sub-projects

### Artificial Intelligence Backend (AI)
See the [Artificial Intelligence README](ai/README.md) for detailed documentation of the backend AI API.

### Human-in-the-loop Frontend (HitL)
See the [Human-in-the-Loop README](hitl/README.md) for detailed documentation of the HitL Full-Stack application.

### End-to-end (E2E) Testing
Automated end-to-end tests are run after every succesful deployment, in GitHub actions triggered by Vercel.

To run end-to-end tests locally, run `cd e2e-tests && npx run playright` and provide the URL of the deployment that you want to test in the `BASE_URL` environment variable.

## Architecture
The application uses a [Hexagonal Architecture](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/hexagonal-architecture.html).
<p align="center"><img src="https://github.com/user-attachments/assets/7eadf4ed-7c98-4ca5-8be9-aa1a22622f90" height="750px" /></p>

Hexagonal architecture encourages the creation of components called Adapters which connect to the Infrastructure. Adapters communicate with the application Core components through abstract Ports, decoupling the Core of the application from the Infrastructure. The added complexity of this abstraction is traded-off for easier testing of components in isolation. For more details on backend architecture see the [Artificial Intelligence sub-project README](ai/README.md).
