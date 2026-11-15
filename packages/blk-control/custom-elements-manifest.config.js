import {cemToMarkdownReadme} from '@blockquote/cem-to-markdown-readme';

export default {
  // Internal helper shared by both controls, not part of the public API.
  exclude: ['src/radioGroup.ts'],
  plugins: [...cemToMarkdownReadme()],
};
