import MarkdownIt from "markdown-it";

// Test default behavior
const md1 = new MarkdownIt({
  html: false,
  linkify: true,
});

// Test with proper validation
const md2 = new MarkdownIt({
  html: false,
  linkify: true,
});

// Override validateLink to only allow http and https
const originalValidateLink = md2.validateLink.bind(md2);
md2.validateLink = function(url: string): boolean {
  const trimmedUrl = url.trim().toLowerCase();
  // Only allow http, https, and relative URLs
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./') || trimmedUrl.startsWith('../')) {
    return originalValidateLink(url);
  }
  return false;
};

const testCases = [
  '[Link](javascript:alert("XSS"))',
  '[Link](data:text/html,<script>alert("XSS")</script>)',
  '[Link](http://example.com)',
  '[Link](https://example.com)',
  '[Link](/path/to/page)',
];

console.log("=== Default markdown-it behavior ===\n");
testCases.forEach((test, i) => {
  console.log(`Test ${i + 1}: ${test}`);
  console.log(`Output: ${md1.render(test)}`);
});

console.log("\n=== With validateLink override ===\n");
testCases.forEach((test, i) => {
  console.log(`Test ${i + 1}: ${test}`);
  console.log(`Output: ${md2.render(test)}`);
});
