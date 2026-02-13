import baseConfig from '@crystaltides/eslint-config/base';

export default [
  ...baseConfig,
  {
    ignores: ['dist', 'node_modules'],
  }
];
