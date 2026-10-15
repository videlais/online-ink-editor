# Online ink Editor

A web-based editor for creating and testing the narrative scripting language [ink](https://github.com/inkle/ink). This editor provides a split-pane interface with real-time compilation and preview similar to the desktop tool [Inky](https://www.inklestudios.com/ink/) but as a web-based interface.

It can be accessed [directly on GitHub Pages](https://github.com/inkle/ink).

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Testing

Use Node.js 24 or 26, matching the CI matrix. Vitest 5 supports Node.js
`^22.12.0 || ^24.0.0 || >=26.0.0`; Node.js 25 is not supported.

```sh
npm ci
npm run test:coverage
npm run test:e2e
npm run build
```

Install Chromium with `npx playwright install chromium` before the first E2E run.
For the interactive test runner, use `npm run test:ui` and open the authenticated
URL printed by Vitest. In Vitest 5, opening `/__vitest__/` without authenticating
first is not sufficient.

Keep `vitest`, `@vitest/coverage-v8`, and `@vitest/ui` at the same resolved version:
the companion packages require an exact matching Vitest peer version. Update all
three together and commit the regenerated lockfile. Dependabot groups these
packages into a single update.

## Acknowledgments

- [ink](https://www.inklestudios.com/ink/) - The narrative scripting language.
- [inkjs](https://github.com/y-lohse/inkjs) - JavaScript port of ink.
- [CodeMirror](https://codemirror.net/) - Code editor component.
