# Macros

Lightweight text macros: provides a React `MacroInput` for inline `@macros`, a core parser to resolve macros into values (with optional formatters). Use it to let users type things like `@name` and render finalized strings from real data.

## Structure

1. `macros` has all the packages
2. `@macros/ui` has the UI for showing the macros in the input field
3. `@macros/core` has the core logic for parsing and resolving the macros
4. `@macros/types` has the type definitions

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
