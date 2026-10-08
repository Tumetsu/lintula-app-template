import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Module-boundary rules (which folder may import which) live in
// .dependency-cruiser.cjs. This file holds code-level rules.

// Behaviour tests drive a real route through renderApp. Rendering a component
// on its own is the component tier, limited to the directories in
// COMPONENT_TIER: each must have behaviour a route test cannot pin down.
const DIRECT_RENDER = {
  paths: [
    {
      name: 'vitest-browser-react',
      importNames: ['render'],
      message:
        'Behaviour tests drive a real route: use renderApp from @tests/harness/renderApp. ' +
        'Rendering a component on its own is limited to COMPONENT_TIER in eslint.config.js.',
    },
  ],
};

const COMPONENT_TIER = ['src/hooks/**/*.test.tsx'];

// A test that sleeps is slow when the wait is long and flaky when it is short.
const REAL_TIME_WAIT_MESSAGE =
  'Wait on what the test is waiting for, not on the clock: expect.poll or expect.element ' +
  'for a state, vi.useFakeTimers for a timer.';

const REAL_TIME_WAIT = {
  paths: ['timers/promises', 'node:timers/promises'].map((name) => ({
    name,
    message: REAL_TIME_WAIT_MESSAGE,
  })),
};

const TIMER_GLOBALS = ['setTimeout', 'setInterval'];

// testTimeout in vitest.config.ts is the one budget a test gets.
const LONG_TIMEOUT_MESSAGE =
  'Keep timeouts at 10 000 ms or less: testTimeout in vitest.config.ts is the budget. ' +
  'Drive the wait instead: fake the clock or poll for the state.';

const LONG_TIMEOUT = [
  {
    selector: "Property[key.name='timeout'][value.value>10000]",
    message: LONG_TIMEOUT_MESSAGE,
  },
  {
    selector:
      'CallExpression[callee.name=/^(test|it|describe|beforeEach|afterEach|beforeAll|afterAll)$/] > Literal.arguments[value>10000]',
    message: LONG_TIMEOUT_MESSAGE,
  },
];

/**
 * Composes the import restrictions that apply to one set of files. Flat config
 * replaces a rule's options wholesale when a later block names the same rule,
 * so every block below names all the restrictions its files are under.
 */
const restrictImports = (...restrictions) => [
  'error',
  {
    paths: restrictions.flatMap((restriction) => restriction.paths ?? []),
    patterns: restrictions.flatMap((restriction) => restriction.patterns ?? []),
  },
];

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'src/api/generated', 'src/routeTree.gen.ts', 'tests/public'],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true, allowExportNames: ['Route'] },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Config files run in Node and are outside tsconfig.json.
    files: ['*.config.{ts,js}', 'eslint.config.js'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/**/*.test.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...LONG_TIMEOUT],
    },
  },
  {
    // A test with no assertion passes whatever the app does, and a skipped or
    // focused one hides the rest.
    files: ['src/**/*.test.{ts,tsx}'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/expect-expect': ['error', { assertFunctionNames: ['expect', 'expect*', 'assert*'] }],
      'vitest/valid-expect': ['error', { maxArgs: 2 }],
      'vitest/no-conditional-expect': 'error',
      'vitest/no-conditional-in-test': 'error',
      'vitest/no-standalone-expect': 'error',
      'vitest/no-disabled-tests': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-identical-title': 'error',
      'vitest/prefer-to-have-length': 'error',
      'vitest/prefer-to-be': 'error',
      'no-restricted-globals': [
        'error',
        ...TIMER_GLOBALS.map((name) => ({ name, message: REAL_TIME_WAIT_MESSAGE })),
      ],
      '@typescript-eslint/no-restricted-imports': restrictImports(REAL_TIME_WAIT),
    },
  },
  {
    // Outside the component tier, a rendering test renders a route.
    files: ['src/**/*.test.tsx'],
    ignores: COMPONENT_TIER,
    rules: {
      '@typescript-eslint/no-restricted-imports': restrictImports(DIRECT_RENDER, REAL_TIME_WAIT),
    },
  }
);
