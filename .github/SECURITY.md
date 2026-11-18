# CardTuck security

We review security reports for the current `main` branch. Keep your deployment on a reviewed release and install dependency updates.

## Report a vulnerability privately

Use [GitHub’s private vulnerability reporting](https://github.com/NH-00/cardtuck/security/advisories/new). Include the affected revision, the behavior you observed, and the impact. Use a local test instance and fictional data. Keep sign-in URLs, API keys, contact details, and card images out of the report.

For concerns about a specific self-hosted installation, contact its operator.

## Deploying safely

Use HTTPS, a persistent `APP_SECRET`, and an explicit sign-in allowlist. Keep `.env`, backups, and database files private. Registration on production instances is opt-in. CardDAV requests require an operator-approved origin. Review the [deployment and privacy notes](../README.md#deploy-on-a-server) before exposing an instance to the internet.
