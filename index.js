#!/usr/bin/env node
const { GitHub } = require('@actions/github');
const eslint = require('eslint');

const {
  GITHUB_SHA: headSha,
  GITHUB_REPOSITORY,
  GITHUB_TOKEN,
  GITHUB_WORKSPACE,
  GITHUB_ACTION: actionName,
  FILE_PATTERN: filePattern,
  EXTENSIONS: extensions,
  DEBUG
} = process.env;

const [ owner, repo ] = GITHUB_REPOSITORY.split('/');

const github = new GitHub(GITHUB_TOKEN);

async function createCheck() {
  const data = {
    started_at: new Date(),
    name: actionName,
    head_sha: headSha,
    status: 'in_progress',
    owner,
    repo
  };
  if (DEBUG) {
    console.log('createCheck: ', data);
    return 1;
  }
  const { data: { id } } = await github.checks.create(data);

  return id;
}

async function updateCheck(id, conclusion, output) {
  const data = {
    name: actionName,
    check_run_id: id,
    completed_at: new Date(),
    conclusion,
    output,
    owner,
    repo,
    status: 'completed'
  };
  if (DEBUG) {
    console.log('updateCheck: ', data);
    return;
  }
  await github.checks.update(data);
}

function runEslint() {
  const cli = new eslint.CLIEngine({ extensions: extensions.split(',').map(e => e.trim()) });
  const report = cli.executeOnFiles(filePattern.split(',').map(e => e.trim()));
  const { results, errorCount, warningCount } = report;

  const levels = ['', 'warning', 'failure'];

  const annotations = [];
  for (const result of results) {
    const { filePath, messages } = result;
    const path = filePath.substring(GITHUB_WORKSPACE.length + 1);
    for (const msg of messages) {
      const { line, severity, ruleId, message } = msg;
      const annotationLevel = levels[severity];
      annotations.push({
        path,
        start_line: line,
        end_line: line,
        annotation_level: annotationLevel,
        message: `[${ruleId}] ${message}`
      });
    }
  }

  return {
    conclusion: errorCount > 0 ? 'failure' : 'success',
    output: {
      title: actionName,
      summary: `${errorCount} error(s), ${warningCount} warning(s) found`,
      annotations
    }
  };
}

function exitWithError(err) {
  console.error('Error', err.stack);
  if (err.data) {
    console.error(err.data);
  }
  process.exit(1);
}

async function run() {
  const id = await createCheck();
  try {
    const { conclusion, output } = runEslint();
    console.log(output.summary);
    await updateCheck(id, conclusion, output);
    if (conclusion === 'failure') {
      process.exit(78);
    }
  } catch (err) {
    await updateCheck(id, 'failure');
    exitWithError(err);
  }
}

run().catch(exitWithError);
