import { readFile, access, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const web = await readFile('dist/index.html', 'utf8');
const offline = await readFile('dist-offline/index.html', 'utf8');
const references = [...web.matchAll(/(?:src|href)="(\.\/assets\/[^"#]+)"/g)].map(m => m[1]);
assert.ok(references.length >= 2, 'Entradas relativas JS/CSS do site');
for (const path of references) await access(`dist/${path}`);
assert.doesNotMatch(web, /(?:src|href)="\/assets\//, 'Não depender da raiz do domínio');
assert.doesNotMatch(offline, /<script\b[^>]*\bsrc\s*=/i, 'Scripts embutidos no offline');
assert.doesNotMatch(offline, /<link\b[^>]*\brel="(?:stylesheet|modulepreload)"/i);
assert.ok((offline.match(/data:image\/webp;base64,/g) || []).length >= 7, 'Sete imagens embutidas; referências @img são resolvidas em execução');
assert.doesNotMatch(offline, /<link\b[^>]*href="\.\/favicon/, 'Ícone também embutido');
const css = [...offline.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
for (const match of css.matchAll(/url\(\s*["']?([^\s"')]+)/g)) {
  assert.ok(/^(data:|#)/.test(match[1]), `Recurso CSS externo no offline: ${match[1]}`);
}
assert.deepEqual(await readdir('dist-offline'), ['index.html']);
console.log(`Build web: ${references.length} entradas relativas; offline: HTML único, JS/CSS/fontes embutidos.`);
