// 压力测试：对指定 base URL 发并发请求，统计吞吐、p50/p95/p99 延迟、错误率。
// 用法：node test/load.js <baseUrl> [durationSec] [concurrency]
// 示例：node test/load.js http://localhost:3999 5 50
const BASE = process.argv[2] || 'http://localhost:3999';
const DUR = Number(process.argv[3] || 5);
const CONC = Number(process.argv[4] || 40);

// 预热登录拿 token，避免压测期间鉴权失败干扰
async function warmup() {
  const r = await fetch(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'design@macudopa.com', password: 'design123' })
  });
  if (!r.ok) throw new Error('warmup login failed: ' + r.status);
  const j = await r.json();
  return j.accessToken;
}

async function worker(token, until, latencies, results) {
  while (Date.now() < until) {
    const t0 = process.hrtime.bigint();
    try {
      const r = await fetch(BASE + '/api/products', { headers: { Authorization: 'Bearer ' + token } });
      if (r.status >= 500) results.errors++;
      else results.ok++;
      r.body && (await r.arrayBuffer());
      latencies.push(Number(process.hrtime.bigint() - t0) / 1e6);
    } catch (e) {
      results.errors++;
      latencies.push(0);
    }
  }
}

(async () => {
  const token = await warmup();
  const until = Date.now() + DUR * 1000;
  const latencies = [];
  const results = { ok: 0, errors: 0 };
  const pool = Array.from({ length: CONC }, () => worker(token, until, latencies, results));
  const start = Date.now();
  await Promise.all(pool);
  const totalMs = Date.now() - start;

  latencies.sort((a, b) => a - b);
  const p = (q) => latencies.length ? latencies[Math.min(latencies.length - 1, Math.floor(q * latencies.length))] : 0;
  const total = results.ok + results.errors;
  const rps = total / (totalMs / 1000);
  console.log('=== 压力测试 ' + BASE + ' ===');
  console.log('duration=' + (totalMs / 1000).toFixed(1) + 's concurrency=' + CONC);
  console.log('requests=' + total + ' (ok=' + results.ok + ', err=' + results.errors + ')');
  console.log('throughput=' + rps.toFixed(1) + ' req/s');
  console.log('latency p50=' + p(0.5).toFixed(1) + 'ms p95=' + p(0.95).toFixed(1) + 'ms p99=' + p(0.99).toFixed(1) + 'ms');
  console.log('errorRate=' + (total ? (results.errors / total * 100).toFixed(2) : '0') + '%');
  const fail = total > 0 && results.errors / total > 0.01;
  console.log(fail ? 'RESULT: FAIL (错误率 >1%)' : 'RESULT: PASS');
  process.exit(fail ? 1 : 0);
})();
