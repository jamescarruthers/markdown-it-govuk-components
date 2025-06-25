// Type definitions for markdown-it-govuk-components
// Project: https://github.com/yourusername/markdown-it-govuk-components

import MarkdownIt from 'markdown-it';

declare namespace markdownItGovukComponents {
  interface Options {
    // Currently no options, but this allows for future extensibility
  }
}

declare function markdownItGovukComponents(
  md: MarkdownIt,
  options?: markdownItGovukComponents.Options
): void;

export = markdownItGovukComponents;
