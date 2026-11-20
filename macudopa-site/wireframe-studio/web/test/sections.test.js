import test from 'node:test';
import assert from 'node:assert/strict';
import { SECTIONS, resolveProps, sectionMeta } from '../src/lib/sections.js';

test('sectionMeta 返回带 fields 的 schema', () => {
  const meta = sectionMeta('hero');
  assert.equal(meta.label, 'Hero');
  assert.ok(Array.isArray(meta.fields));
  assert.ok(meta.fields.length > 0);
});

test('sectionMeta 未知 section 回退为无字段 schema', () => {
  const meta = sectionMeta('does-not-exist');
  assert.equal(meta.label, 'does-not-exist');
  assert.deepEqual(meta.fields, []);
});

test('resolveProps 默认值来自 fields[].def', () => {
  const props = resolveProps('hero', {});
  assert.equal(props.eyebrow, 'Natural Parkinson’s support');
  assert.equal(props.headline, 'Stay on, not off.');
});

test('resolveProps 显式 props 覆盖默认值', () => {
  const merged = resolveProps('hero', { eyebrow: 'CUSTOM', subhead: '' });
  assert.equal(merged.eyebrow, 'CUSTOM');
  assert.equal(merged.subhead, '');
  assert.equal(merged.headline, 'Stay on, not off.');
});

test('resolveProps 未知 section 仅保留传入 props', () => {
  assert.deepEqual(resolveProps('nope', { a: 1 }), { a: 1 });
});

test('所有 17 个 section 都有 label + fields', () => {
  assert.equal(Object.keys(SECTIONS).length, 17);
  for (const k of Object.keys(SECTIONS)) {
    assert.ok(SECTIONS[k].label, `section ${k} 缺 label`);
    assert.ok(Array.isArray(SECTIONS[k].fields), `section ${k} 缺 fields`);
    for (const f of SECTIONS[k].fields) {
      assert.ok(f.key && f.type && f.label, `section ${k} 字段缺 key/type/label`);
    }
  }
});
