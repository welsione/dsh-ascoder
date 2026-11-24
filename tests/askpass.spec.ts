import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { configureAskpass } from '../src/git.js'

/** askpass 脚本必须原样输出凭据（不带多余字符、以换行结尾），否则 git 认证会失败。 */
describe('askpass script', () => {
  it('prints the username and the password verbatim with a trailing newline', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-askpass-'))
    try {
      await configureAskpass(dir)
      const script = join(dir, 'askpass.sh')
      // 注意：脚本契约是 GIT_ASKPASS 的调用约定，凭据经环境变量传入
      const run = (prompt: string) =>
        execFileSync(script, [prompt], {
          encoding: 'utf8',
          env: { ...process.env, ASC_USER: 'deploy-bot', ASC_PASS: 'p4ssw0rd' },
        })

      expect(run("Username for 'https://example.com': ")).toBe('deploy-bot\n')
      expect(run("Password for 'https://deploy-bot@example.com': ")).toBe('p4ssw0rd\n')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
