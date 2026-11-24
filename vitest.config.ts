import { defineConfig } from 'vitest/config'

/**
 * 测试配置。
 *
 * 用例大量跑真实 git 操作（克隆、变更、pull），单个用例 1-3 秒。vitest 默认 5 秒超时
 * 在机器同时跑构建时会被挤破，表现为随机的 "Failed Tests"（实测并发 build 时一次挂 6 个，
 * 单独跑则全绿）。这里放宽到 20 秒，让结论只反映代码而不是当时的机器负载。
 */
export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
})
