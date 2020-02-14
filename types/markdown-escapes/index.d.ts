declare module 'markdown-escapes' {
  export interface EscapesOptions {
    commonmark?: boolean;
    gfm?: boolean;
  }

  function escapes(
    options: EscapesOptions
  ): typeof escapes.default | typeof escapes.gfm | typeof escapes.commonmark;

  escapes.default = [
    '\\',
    '`',
    '*',
    '{',
    '}',
    '[',
    ']',
    '(',
    ')',
    '#',
    '+',
    '-',
    '.',
    '!',
    '_',
    '>',
  ] as const;

  escapes.gfm = [
    '\\',
    '`',
    '*',
    '{',
    '}',
    '[',
    ']',
    '(',
    ')',
    '#',
    '+',
    '-',
    '.',
    '!',
    '_',
    '>',
    '~',
    '|',
  ] as const;

  escapes.commonmark = [
    '\\',
    '`',
    '*',
    '{',
    '}',
    '[',
    ']',
    '(',
    ')',
    '#',
    '+',
    '-',
    '.',
    '!',
    '_',
    '>',
    '~',
    '|',
    '\n',
    '"',
    '$',
    '%',
    '&',
    "'",
    ',',
    '/',
    ':',
    ';',
    '<',
    '=',
    '?',
    '@',
    '^',
  ] as const;

  export = escapes;
}
