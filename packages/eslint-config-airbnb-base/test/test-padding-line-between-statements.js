import test from 'tape';
import { CLIEngine } from 'eslint';
import eslintrc from '../';

const cli = new CLIEngine({
  useEslintrc: false,
  baseConfig: eslintrc,

  rules: {
    // It is okay to import devDependencies in tests.
    'import/no-extraneous-dependencies': [2, { devDependencies: true }],
    // this doesn't matter for tests
    'lines-between-class-members': 0,
  },
});

function lint(text) {
  // @see https://eslint.org/docs/developer-guide/nodejs-api.html#executeonfiles
  // @see https://eslint.org/docs/developer-guide/nodejs-api.html#executeontext
  const linter = cli.executeOnText(text);
  return linter.results[0];
}

test('validate padding line between statements', (t) => {
  t.test('passes valid code', (t) => {
    t.plan(3);
    const result = lint(`
function fooBar() {
  const foo = 'foo';
  const bar = 'bar';
  const test = foo + bar;
  let baz = 'baz';
  switch (test) {
    case 1:
      baz = ['some string'];
      if (this.props.inquiryDatesAvailable) {
        this.foo = baz;
      }

      break;
    case 2:
      break;
    default:
      break;
  }

  this.baz = baz;

  return test;
}

fooBar();
`);

    t.notOk(result.warningCount, 'no warnings');
    t.notOk(result.errorCount, 'no errors');
    t.deepEquals(result.messages, [], 'no messages in results');
  });

  t.test('blank lines: when no blank line after if block', (t) => {
    t.plan(3);
    const result = lint(`
function test() {
  const foo = '';
  const bar = '';
  const baz = '';
  if (foo) {
    return bar;
  }
  return baz;
}

test();
`);

    t.ok(result.errorCount, 'fails');
    t.equal(result.messages[0].ruleId, 'padding-line-between-statements', 'fails due to missing blank line');
    t.equal(result.messages[0].line, 9, 'fails due to error on line 9');
  });

  t.test('blank lines: when no blank line after function', (t) => {
    t.plan(3);
    const result = lint(`
function test() {
  const foo = '';
  return foo;
}
test();
`);

    t.ok(result.errorCount, 'fails');
    t.equal(result.messages[0].ruleId, 'padding-line-between-statements', 'fails due to missing blank line');
    t.equal(result.messages[0].line, 6, 'fails due to error on line 6');
  });
});
