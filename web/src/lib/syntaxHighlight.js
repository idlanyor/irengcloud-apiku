/**
 * Syntax highlight JSON → HTML string dengan token classes.
 * Port verbatim dari syntaxHighlightJSON() di public/js/main.js.
 * Output dipakai via dangerouslySetInnerHTML — tidak double-escape.
 */
export function syntaxHighlightJSON(json) {
  let s = typeof json !== 'string' ? JSON.stringify(json, null, 2) : json;
  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return s.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'token-number';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'token-key' : 'token-string';
      } else if (/true|false/.test(match)) {
        cls = 'token-method';
      } else if (/null/.test(match)) {
        cls = 'token-comment';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}
