import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
test('29 telas e todas as imagens referenciadas disponíveis',()=>{
  const slides=readdirSync(root+'src/slides').filter(f=>f.endsWith('.html'));
  assert.equal(slides.length,29);
  const all=slides.map(f=>readFileSync(root+'src/slides/'+f,'utf8')).join('\n');
  const images=[...all.matchAll(/@img\/([\w.-]+)/g)].map(m=>m[1]);
  assert.ok(images.length>=7);
  for(const image of images) assert.ok(existsSync(root+'src/assets/images/'+image),image);
  assert.ok(all.includes('João Frederico Musial'));
  assert.ok(all.includes('Campo Real'));
});
test('componentes da aula têm fábricas registradas',()=>{
  const main=readFileSync(root+'src/main.js','utf8');
  const registered=new Set([...main.matchAll(/register\('([^']+)'/g)].map(m=>m[1]));
  for(const file of readdirSync(root+'src/slides').filter(f=>f.endsWith('.html'))){
    const html=readFileSync(root+'src/slides/'+file,'utf8');
    for(const m of html.matchAll(/data-component="([^"]+)"/g)) assert.ok(registered.has(m[1]),m[1]);
  }
});
