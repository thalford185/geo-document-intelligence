# Document AI

## System Requirements
* See pyproject.toml for Python version
* Pip-tools is used for pinning Python sub-dependencies
* The Poppler system package is required by the pdf2image Python package. See [the pdf2image docs](https://pdf2image.readthedocs.io/en/latest/installation.html) for Poppler installation instructions
* Google Cloud Platform (GCP) credentials with authorization to impersonate the GCP pre-production project's `ai-api-runner` service account.
* These instructions assumes that VirtualEnv is installed for isolating Python environments

## Setup
1.  Create and activate a Python virtual environment isolated from your system with
`python3 -m virtualenv .venv && source .venv/bin/activate`.
2. Optional: to use a non-default compute platform for PyTorch, install PyTorch [according to their docs](https://pytorch.org/get-started/locally/). The required versions for PyTorch dependencies can be found in `requirements.in`.
3. Install Python production and development dependencies with `pip install -r dev-requirements.txt`
4. Make a copy of the local environment variable sample file `.env.local.sample` with `cp .env.local.sample .env.local`
5. Fill in the newly created local environment variable file with the details of your pre-production infrastructure.

## Run locally
1. Source the local environment variable file, created in the setup, with `source .env.local`.
2. Activate the Python virtual environment, created in the setup, with `source .venv/bin/activate`
3. Run the API development server locally with `python -m fastapi dev entrypoints/api/main.py`

## Software Architecture
Testability
Extendability
Separation of core and infrastructure
At cost of complexity, abstraction

## Automated Tests
Run automated tests with `pytest`.

According to the software architecture, the Adapters and Core Services are decoupled and can be unit tested independently by mocking any ports. Entrypoints can be integration tested by instantiating Driving Adapters and Core Services with concrete Port implementations. For determinism, tests should not call the network and clients should be mocked.

Automated tests are frameworked with PyTest and make use of the Parameterize and Fixture features. Fixtures provide a reusable method for adding context to tests (ex. Adapter mocks) and Parameterize provides a method for running the same test on multiple named cases.



## Code Quality
Code changes are blocked from being integrated until build checks pass. This trades-off some throughput for quality with the goal of maintaining developer efficiency as the application complexity or team size increases.

Type checking (PyRight) to ensure the correctness of typing in order to catch simple but common mistakes before they reach production. Run type checks with `pyright`. The type checking mode is set to "standard" and not "strict" which means that not all of the code needs to be typed. This is to enable developers to work efficiently in cases where typing may not be practical (for example not supported by the library).

Code formatting checks (Black & ISort) to make code easier to read by the team (or yourself in a weeks time). Run code formatting checks with `isort --check geo_document_intelligence && black --check  .`. Automatic code formatting is well supported by editors and so friction should be minimal.

Python Linting (PyLint)  to catch further common mistakes. Run linting with `pylint .`. Convention and refactoring messages do not cause the build to fail, so that the team can decide which should be resolved on a per PR basis.

Import Linting checks to enforce the independence of AI sections (Raw Document AI, Geo-spatial AI, etc) and the decoupling of the section's core and it's adapters. See Software Architecture for more information. Run import linting with `lint-imports`.


## Manage Python Dependencies
To update the project Python dependencies, run `pip-compile -o requirements.txt requirements.in`. This will generate a `requirements.txt` with pinned sub-dependencies.

To update development dependencies, use `pip-compile -o dev-requirements.txt requirements.txt dev-requirements.in`.