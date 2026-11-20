// Shopify OS 2.0 主题结构校验（无依赖，直接跑 node）
// 校验：
//   1. 每个 section 的 {% schema %} ... {% endschema %} 配对且 schema JSON 可解析
//   2. schema 必含 name / settings；settings 每项有 type + id
//   3. Liquid 标签粗校验：{%/} 配对、{% %} / {{ }} 数量平衡
//   4. 模板引用的 section/snippet 文件确实存在
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SECTIONS = fs.readdirSync(path.join(ROOT, 'theme', 'sections')).filter((f) => f.endsWith('.liquid')).map((f) => f.replace(/\.liquid$/, ''));
const SNIPPETS = fs.readdirSync(path.join(ROOT, 'theme', 'snippets')).filter((f) => f.endsWith('.liquid')).map((f) => f.replace(/\.liquid$/, ''));

let errors = 0;
function fail(msg) { errors++; console.log('  ✗ ' + msg); }
function ok(msg) { console.log('  ✓ ' + msg); }

// 1. schema 块
function extractSchema(liquid) {
  const m = liquid.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
  return m ? m[1] : null;
}

console.log('== 1) section schema 完整性 ==');
for (const s of SECTIONS) {
  const liquid = fs.readFileSync(path.join(ROOT, 'theme', 'sections', s + '.liquid'), 'utf8');
  const raw = extractSchema(liquid);
  if (raw === null) { fail(s + ': 缺 {% schema %} 或标签不配对'); continue; }
  let json;
  try { json = JSON.parse(raw); } catch (e) { fail(s + ': schema JSON 解析失败 ' + e.message); continue; }
  const miss = [];
  if (!json.name) miss.push('name');
  // schema 须至少含 settings / blocks / presets 之一（可编辑面）
  if (!json.settings && !json.blocks && !json.presets) miss.push('settings|blocks|presets');
  if (miss.length) { fail(s + ': schema 缺字段 [' + miss.join(', ') + ']'); continue; }
  for (const set of (json.settings || [])) {
    if (!set.type) fail(s + ': setting 缺 type: ' + JSON.stringify(set.id));
    // type=header 是分组标题，无 id 属合法
    if (set.type !== 'header' && !set.id) fail(s + ': setting 缺 id: ' + JSON.stringify(set));
  }
  for (const blk of (json.blocks || [])) {
    if (!blk.type) fail(s + ': block 缺 type: ' + JSON.stringify(blk.name));
    for (const set of (blk.settings || [])) if (!set.type || !set.id) fail(s + ': block "' + blk.type + '" setting 缺 type/id');
  }
  const parts = [];
  if (json.settings) parts.push(json.settings.length + ' settings');
  if (json.blocks) parts.push(json.blocks.length + ' blocks');
  if (json.presets) parts.push(json.presets.length + ' presets');
  ok(s + ' (' + (parts.length ? parts.join(', ') : 'name only') + ')');
}

// 2. Liquid 标签粗校验
console.log('== 2) Liquid 标签配对 ==');
for (const s of SECTIONS) {
  const liquid = fs.readFileSync(path.join(ROOT, 'theme', 'sections', s + '.liquid'), 'utf8');
  const bo = (liquid.match(/{%/g) || []).length;
  const bc = (liquid.match(/%}/g) || []).length;
  const do2 = (liquid.match(/{{/g) || []).length;
  const dc = (liquid.match(/}}/g) || []).length;
  if (bo !== bc) fail(s + ': {% 与 %} 数量不等 (' + bo + '/' + bc + ')');
  if (do2 !== dc) fail(s + ': {{ 与 }} 数量不等 (' + do2 + '/' + dc + ')');
}
ok('标签配对检查完成');

// 3. 模板引用存在性
console.log('== 3) 模板引用 section/snippet 存在性 ==');
const TPL = ['index.json', 'collection.json', 'product.json', 'page.faq.json', 'page.story.json'];
for (const t of TPL) {
  const p = path.join(ROOT, 'theme', 'templates', t);
  if (!fs.existsSync(p)) { fail(t + ': 文件不存在'); continue; }
  const json = JSON.parse(fs.readFileSync(p, 'utf8'));
  // 三种形状：顶层数组（新式 index/collection/product）；{sections: {named:{type}}}（page 模板）；{sections: []}（旧式）
  let secs;
  if (Array.isArray(json)) secs = json;
  else if (json.sections && Array.isArray(json.sections)) secs = json.sections;
  else if (json.sections && typeof json.sections === 'object') secs = Object.values(json.sections);
  else secs = [];
  const used = secs.map((s) => s.type).filter(Boolean);
  for (const u of used) {
    if (!SECTIONS.includes(u) && !SNIPPETS.includes(u)) fail(t + ': 引用未知 section "' + u + '"');
  }
  ok(t + ' (' + used.length + ' section refs)');
}

// 4. layout / config 存在
console.log('== 4) 必备主题文件 ==');
for (const f of ['layout/theme.liquid', 'config/settings_schema.json', 'config/settings_data.json', 'locales/en.default.json']) {
  if (fs.existsSync(path.join(ROOT, 'theme', f))) ok(f);
  else fail(f + ' 缺失');
}

console.log('');
if (errors) { console.log('RESULT: FAIL (' + errors + ' 个问题)'); process.exit(1); }
console.log('RESULT: PASS — 主题结构完整，可上传 Shopify 编辑器');
