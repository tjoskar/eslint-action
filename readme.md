# Eslint github action

This action anotate your code with the output of eslint

## Install

```
npm install tjoskar/eslint-action
```

## Example usage

```
- name: ESLint
  run: npx eslint-action
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    FILE_PATTERN: 'src'
    EXTENSIONS: '.js, .jsx, .ts, .tsx'
```

## TODO:

- Use deno
- Use docker

Is that possible with different eslint configs and plugins?
