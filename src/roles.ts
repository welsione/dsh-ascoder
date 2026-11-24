/**
 * Ascoder 角色化回答风格，逐条移植自 legacy prompts/answer-style-*.md。
 */

/** 一种角色的完整回答要求。 */
export interface RoleStyle {
  /** 角色展示名。 */
  label: string
  /** 风格一句话描述。 */
  description: string
  /** 回答结构（结论、证据、代码的位置关系）。 */
  structure: string
  /** 回答要求（逐条，源自 legacy 模板）。 */
  rules: string[]
}

/** legacy prompts/answer-style-developer.md 的原文移植。 */
const DEVELOPER_RULES = [
  '结论必须在最前面，一句话回答用户问题',
  '只有当问题涉及多步骤流程且流程图能比文字更清楚地展示时，才在结论之后用 Mermaid 流程图；问代码位置、单个方法功能、谁改的等简单问题直接跳过',
  '先给出分析和结论，证据（文件路径、代码片段、符号名）放到回答最后',
  '如果检索结果不足以支撑确定性结论，明确说明证据不足',
  '代码展示：完整展示关键代码片段，包含文件路径、类名、方法名、调用链',
]

/** legacy prompts/answer-style-product_manager.md 的原文移植。 */
const PRODUCT_MANAGER_RULES = [
  '结论必须在最前面，用业务语言一句话回答用户问题',
  '只有当问题涉及多步骤流程且流程图能比文字更清楚地展示时，才在结论之后用 Mermaid 流程图；单步或简单问题直接跳过',
  '侧重功能描述和业务流程，避免技术术语',
  '如果检索结果不足以支撑确定性结论，明确说明需要确认的问题',
  '先给出分析和结论，证据（文件路径、符号名）放到回答最后',
  '禁止展示代码片段：仅在最后的证据引用部分列出文件路径和符号名，不展示任何代码内容',
]

/** legacy prompts/answer-style-tester.md 的原文移植。 */
const TESTER_RULES = [
  '结论必须在最前面，一句话说明可测试点或风险点',
  '只有当问题涉及多步骤流程且流程图能帮助识别测试路径时，才在结论之后用 Mermaid 流程图；单步或简单问题直接跳过',
  '先给出分析和结论，证据（文件路径、符号名）放到回答最后',
  '侧重边界条件、异常路径和可验证的行为',
  '如果检索结果不足以支撑确定性结论，明确说明需要补充的测试场景',
  '禁止展示代码片段：仅在最后的证据引用部分列出文件路径和符号名，不展示任何代码内容',
]

/** 全部角色风格。 */
export const ROLE_STYLES: Record<'developer' | 'product_manager' | 'tester', RoleStyle> = {
  developer: {
    label: '开发者',
    description: '面向开发者的实现级回答：讲清代码位置、机制和调用链。',
    structure: '结论（一句话）→ 必要的流程图 → 分析与证据 → 关键代码片段',
    rules: DEVELOPER_RULES,
  },
  product_manager: {
    label: '产品经理',
    description: '面向业务的功能级回答：用业务语言说明能力与流程。',
    structure: '结论（业务语言）→ 流程 → 证据（只给文件与符号，不给代码）',
    rules: PRODUCT_MANAGER_RULES,
  },
  tester: {
    label: '测试工程师',
    description: '面向测试的风险与可测点：强调边界、异常路径。',
    structure: '结论（可测点/风险）→ 覆盖路径 → 证据（只给文件与符号，不给代码）',
    rules: TESTER_RULES,
  },
}

/** 渲染一个角色的 system prompt 片段（风格 + 结构 + 要求）。 */
export function renderRoleSection(style: RoleStyle): string {
  const lines = style.rules.map((rule, index) => `${index + 1}. ${rule}`)
  return [
    `## 回答视角：${style.label}`,
    style.description,
    `回答结构：${style.structure}`,
    '',
    '要求：',
    ...lines,
  ].join('\n')
}

/** 渲染自定义视角的 system prompt 片段。 */
export function renderCustomSection(input: {
  name: string
  description?: string
  instruction: string
  structure?: string
}): string {
  return [
    `## 回答视角：${input.name}`,
    ...(input.description ? [input.description] : []),
    ...(input.structure ? [`回答结构：${input.structure}`] : []),
    '',
    '要求：',
    input.instruction,
  ].join('\n')
}
