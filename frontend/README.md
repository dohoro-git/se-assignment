# Frontend Feature Structure

Build the React application inside `frontend/`. Keep feature code under `src/features/<feature-name>/` and use these folders for each feature:

```text
components/  reusable UI for the feature
hooks/       feature data/state and API behavior
tests/       feature tests
routes/      feature pages/screens
interfaces/  feature-specific object contracts
types/       feature-specific aliases and unions
```

The starter provides `vehicles` and `maintenance` feature folders. Follow the standards in the repository root `CODING_STANDARDS.md`. Add the frontend package manifest, Dockerfile, and Compose service as part of the assignment so the complete stack starts with `docker compose up --build`.
