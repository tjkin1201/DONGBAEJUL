import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactNative from 'eslint-plugin-react-native';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-native': reactNative,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        FormData: 'readonly',
        fetch: 'readonly',
        XMLHttpRequest: 'readonly',
        __DEV__: 'readonly',
      },
    },
    rules: {
      'react/prop-types': 'off',
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true 
      }],
      'no-console': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // 웹 호환 파일 전용 설정
  {
    files: ['**/webCompatibleBandAPI.js'],
    languageOptions: {
      globals: {
        localStorage: 'readonly',
        window: 'readonly',
        alert: 'readonly',
        document: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off', // 브라우저 API 사용 허용
    },
  },
  // 테스트 파일 전용 설정
  {
    files: ['**/__tests__/**/*.{js,jsx}', '**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off', // 테스트 파일에서는 더 관대하게
    },
  },
  {
    ignores: [
      'node_modules/',
      '.expo/',
      'dist/',
      'web-build/',
      '__tests__/', // 테스트 파일 무시 (임시)
      'DONGBAEJUL/', // 별도 Expo 프로젝트 제외
      'android/',  // Android 빌드 파일 제외
      'playwright-report/',
      'test-results/',
    ],
  },
];