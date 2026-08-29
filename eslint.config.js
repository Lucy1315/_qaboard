import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'dist-types', 'coverage', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // T003 — FR-028: 사용자 입력이 코드로 실행되지 않게 한다
      'react/no-danger': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'FR-028: dangerouslySetInnerHTML 금지 — 사용자 입력은 문자 그대로 표시한다.',
        },
      ],
      // T036 — components 는 pages / supabase 에 의존하지 않는다 (원칙 XI)
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/pages/*'], message: '컴포넌트는 페이지에 의존하지 않는다.' },
            { group: ['**/supabase*'], message: '컴포넌트는 데이터 구현에 의존하지 않는다.' },
          ],
        },
      ],
    },
  },
);
