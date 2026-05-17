Contributing to Intelligent Testing Toolkit

Thank you for considering contributing! This project welcomes contributors at all levels.

How to contribute

- Fork the repository and create a feature branch: `git checkout -b feature/your-feature`.
- Keep changes small and focused; open multiple PRs if needed.
- Write clear commit messages and include tests or examples when applicable.
- Fill the PR description with rationale and usage steps.

PR checklist

- [ ] Code follows existing style
- [ ] Added or updated examples / tests
- [ ] Updated `README.md` or `docs/USAGE.md` if behavior changed
- [ ] Updated `CHANGELOG.md` if this adds a feature/fix
- [ ] CI passes (when configured)

Release process

- Bump `package.json` version following semver.
- Add a short summary to `CHANGELOG.md` under the appropriate version heading.
- Ensure `npm test` and `npm run typecheck` both pass.
- Open a PR describing the release scope and notable changes.

Code of conduct

Be respectful and constructive. This project follows a standard open-source code of conduct.
