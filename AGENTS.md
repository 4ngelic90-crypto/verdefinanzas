# Project Guidance

## User Preferences

- Interfaz en modo oscuro con tonos verdes y grises
- Categorías de gasto: comida, transporte, entretenimiento
- Gráfico visual o barra de progreso de la categoría con mayor gasto
- Optimizado para dispositivos móviles (Android 14 a 16)
- Icono decorado para la pantalla de inicio

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Dark-first token apps with darkMode:['class'] need class="dark" on <html> in index.html; a ThemeProvider is not required.
- Backend amounts are stored as integer cents; the frontend multiplies/divides by 100 (parseAmountToCents / formatCurrency).
- CategoryTotal.percentage is a bigint 0-100; convert with Number() before using it as a CSS width.
- Enhanced Migration is active: [canisters.backend.migrations] chain=src/backend/migrations check-limit=1; fold a pending init migration into the latest pending file.
- OQL over Map<Principal, Map<Nat, T>> needs OQL.Entity.manual with a flattener; .toEntity fails on the nested Map value.
- mops.toml is edit-denied; bump dependency pins with edit_protected_template, not edit.
- Biome flags role=progressbar on a non-focusable div (add tabIndex={0}) and SVG without title (add role=presentation).
- The root test script runs pnpm --dir src/frontend test && pnpm run test:backend; vitest exits 1 when no test files exist, so a new app needs at least one test file.
