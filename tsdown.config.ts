import { defineConfig } from 'tsdown'
export default defineConfig({
  outDir: 'lib',
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: false,
  sourcemap: false,
  // peer 依赖（cordis / dsh-*）必须 external，运行时由 DSH 宿主解析。
  // schemastery 是 peerDependencies 里的库依赖，同样保持 external。
  deps: { onlyBundle: false },
  dts: true,
})
