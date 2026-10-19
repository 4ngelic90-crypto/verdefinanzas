// Pulls the @testing-library/jest-dom matcher augmentation into the frontend
// TypeScript project. The runtime setup lives in vitest.setup.ts, which sits
// outside `include: ["src"]`, so the matcher types must be referenced from a
// file the project actually compiles.
import "@testing-library/jest-dom/vitest";
