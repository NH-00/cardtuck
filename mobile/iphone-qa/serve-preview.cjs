const http = require('node:http');
const { registerHooks } = require('node:module');

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === './vcf' && context.parentURL.endsWith('/vcf-response.ts')) {
      return nextResolve('./vcf.ts', context);
    }
    return nextResolve(specifier, context);
  },
});
const { vCardResponse } = require('../../src/lib/vcf-response.ts');

const sample = {
  name: 'Maya Chen', firstname: 'Maya', lastname: 'Chen', company: 'Studio Tidemark',
  phone: '+16045550142', email: 'maya@tidemark.example', title: 'Design Director',
  website: 'https://tidemark.example', address: '1 Example Street',
};
const page = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CardTuck iPhone check</title><style>body{margin:0;padding:2rem 1.5rem;background:#f8f6ee;color:#112d25;font:16px/1.5 system-ui}
main{max-width:34rem;margin:2rem auto}h1{font:2.5rem/1.05 Georgia,serif;margin:0 0 1rem}a{color:#00624d}
.add{display:inline-block;text-decoration:none;background:#00624d;color:white;border-radius:.6rem;padding:.8rem 1rem;font:600 1rem system-ui}</style>
<main><h1>Test CardTuck on iPhone</h1><p>Maya Chen is a fictional contact.</p>
<p><a class="add" href="/sample-contact.vcf">Add to Contacts</a></p>
<p><a href="/sample-contact.vcf?download=1" download>Download vCard</a></p></main></html>`;

http.createServer(async (incoming, outgoing) => {
  const url = new URL(incoming.url, 'http://localhost');
  if (incoming.method !== 'GET') {
    outgoing.writeHead(405).end();
  } else if (url.pathname === '/') {
    outgoing.writeHead(200, { 'Cache-Control': 'no-store', 'Content-Type': 'text/html; charset=utf-8' }).end(page);
  } else if (url.pathname === '/sample-contact.vcf') {
    const response = vCardResponse(new Request(url), sample);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers)).end(await response.text());
  } else {
    outgoing.writeHead(404).end();
  }
}).listen(8086, '127.0.0.1');
