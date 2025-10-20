# Macros

## Structure
1. `macros` has all the packages
3. `@macros/ui` has the UI for showing the macros in the input field
1. `@macros/core` has the core logic for parsing and resolving the macros
2. `@macros/types` has the type definitions

## Dependency Graph
`@macros/ui` -> `@macros/core` -> `@macros/type`

## Commands

- Build all the packages
```bash
  pnpm turbo run build --filter='macros'
```

- Watch all the packages (dev mode to view the changes live)
```bash
  pnpm turbo run dev --filter='@macros/*'
```

- Run the "macros-example" to view your changes in an app
```bash
  pnpm -C apps/examples/macros-example dev
```