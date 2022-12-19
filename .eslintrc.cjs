module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	parser: '@typescript-eslint/parser',
	extends: [
		'plugin:react/jsx-runtime',
		'plugin:react/recommended',
		'standard-with-typescript',
		'plugin:prettier/recommended',
		'prettier',
		'plugin:react-hooks/recommended',
		'plugin:import/recommended',
	],
	ignorePatterns: ['vite.config.ts', 'node_modules/', '.yarn/'],
	overrides: [],
	parserOptions: {
		ecmaVersion: 'latest',
		project: ['./tsconfig.json'],
		sourceType: 'module',
	},
	plugins: ['react', '@typescript-eslint', 'react', 'react-hooks', 'import', 'jest', 'prettier'],
	rules: {
		semi: 'off',
		'import/no-unresolved': 'off',
		'import/export': 'error',
		// https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/FAQ.md#eslint-plugin-import
		// We recommend you do not use the following import/* rules, as TypeScript provides the same checks as part of standard type checking:
		'import/named': 'off',
		'import/namespace': 'off',
		'import/default': 'off',
		'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		'react/no-unknown-property': [
			'error',
			{ ignore: ['position', 'args', 'position', 'rotation'] },
		],
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
		],
		'@typescript-eslint/semi': 'off',
		'@typescript-eslint/triple-slash-reference': 'off',
		'@typescript-eslint/no-misused-promises': [
			'error',
			{
				checksVoidReturn: false,
			},
		],
		'@typescript-eslint/explicit-function-return-type': 'off',
	},
	settings: {
		react: {
			version: 'detect',
		},
		'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
		'import/parsers': {
			'@typescript-eslint/parser': ['.js', '.jsx', '.ts', '.tsx'],
		},
		'import/resolver': {
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
				paths: ['src'],
			},
		},
	},
};
