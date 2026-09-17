/**
 * Generate SDK snippet 5 bahasa untuk URL relatif tertentu.
 * Port verbatim dari updateSdkSnippet() di public/js/main.js.
 */
export function sdkSnippet(lang, relativeUrl) {
  const fullUrl = `${window.location.origin}${relativeUrl}`;

  switch (lang) {
    case 'curl':
      return `curl -X GET "${fullUrl}" \\\n  -H "Accept: application/json"`;
    case 'js':
      return `// Fetch API (Browser / Node.js 18+)\nconst response = await fetch("${fullUrl}");\nconst data = await response.json();\nconsole.log(data);`;
    case 'python':
      return `# Python (requests library)\nimport requests\n\nresponse = requests.get("${fullUrl}")\ndata = response.json()\nprint(data)`;
    case 'php':
      return `<?php\n// PHP cURL\n$ch = curl_init();\ncurl_setopt($ch, CURLOPT_URL, "${fullUrl}");\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$response = curl_exec($ch);\ncurl_close($ch);\n$data = json_decode($response, true);\nprint_r($data);`;
    case 'go':
      return `// Go HTTP Request\npackage main\n\nimport (\n\t"fmt"\n\t"io/ioutil"\n\t"net/http"\n)\n\nfunc main() {\n\tresp, err := http.Get("${fullUrl}")\n\tif err != nil {\n\t\tfmt.Println(err)\n\t\treturn\n\t}\n\tdefer resp.Body.Close()\n\tbody, _ := ioutil.ReadAll(resp.Body)\n\tfmt.Println(string(body))\n}`;
    default:
      return '';
  }
}
