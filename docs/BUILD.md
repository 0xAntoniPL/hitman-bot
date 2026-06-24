# Build verification

After forking upstream `defi-cli`, the TypeScript project was verified against the existing `tsconfig.json`.

```shell
npm install
npm run build
```

Notes:
- Output lands in `dist/` (gitignored)
- Node `>=12` per package engines
