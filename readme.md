# Eslint github action

This action anotate your code with the output of eslint

## Install

```
npm install tjoskar/eslint-action
```

## Example usage

```yml
- name: 🚥 ESLint
  run: npx eslint-action
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    FILE_PATTERN: '.' # Default value
    EXTENSIONS: '.js, .jsx, .ts, .tsx' # Default value
```

## TODO:

- Use deno
- Use docker

Is that possible with different eslint configs and plugins?
