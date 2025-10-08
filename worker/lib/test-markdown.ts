import MarkdownIt from "markdown-it";

// Current configuration
const md = new MarkdownIt({
  html: false,
  linkify: true,
});

// Test cases
const testCases = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror="alert(\'XSS\')">',
  '<a href="javascript:alert(\'XSS\')">Click me</a>',
  '[Click me](javascript:alert("XSS"))',
  '<details><summary>詳細を表示</summary>XSS</details>',
  'HTMLタグも使えます<br><strong>太字（HTML）</strong>',
];

console.log("Testing markdown-it with html:false\n");

testCases.forEach((test, i) => {
  console.log(`Test ${i + 1}: ${test}`);
  console.log(`Output: ${md.render(test)}`);
  console.log('---');
});
