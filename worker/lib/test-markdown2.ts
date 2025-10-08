import MarkdownIt from "markdown-it";

// Current configuration
const md = new MarkdownIt({
  html: false,
  linkify: true,
});

// Test cases for links that could be XSS vectors
const testCases = [
  '[Link](javascript:alert("XSS"))',
  '[Link](data:text/html,<script>alert("XSS")</script>)',
  '[Link](vbscript:msgbox("XSS"))',
  '[Link](file:///etc/passwd)',
  '[Link](//evil.com/xss)',
  'https://evil.com?redirect=javascript:alert("XSS")',
];

console.log("Testing markdown-it link XSS vectors with html:false\n");

testCases.forEach((test, i) => {
  console.log(`Test ${i + 1}: ${test}`);
  const output = md.render(test);
  console.log(`Output: ${output}`);
  console.log('---');
});
