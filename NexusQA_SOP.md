# NexusQA 软件测试与质量保障作业规范 (SOP)

**版本**: 1.1.0
**生效日期**: 2025-11-24
**适用范围**: NexusQA / Yarbo 全体研发与测试人员

## 1. 总纲 (Executive Summary)

本规范旨在建立一套高成熟度、可规模化、不依赖特定工具的标准化测试业务流程。

**核心原则：**

*   **流程先行 (Process First)**: AI 是加速器，不是规避流程的借口。
*   **准入准出 (Gatekeeping)**: 每个阶段都有严格的入口 (DoR) 和出口 (DoD) 标准。
*   **测试分层 (Test Pyramid)**: 遵循金字塔理论，构建稳固的自动化测试体系。
*   **零容忍 (Zero Tolerance)**: 对违反“红线”的行为零容忍，确保数据的真实性与可追溯性。

## 2. 测试分层标准 (Testing Standards)

遵循 Mike Cohn 的测试金字塔理论，构建分层测试体系。

### 2.1 单元测试 (Unit Tests) - Base Layer (70%)
- **范围**: 函数、类、组件逻辑。
- **责任人**: 开发 (Dev)。
- **标准**:
  - 必须 Mock 外部依赖。
  - 运行速度极快 (毫秒级)。
  - 覆盖所有分支逻辑 (Branch Coverage)。
  - **工具**: Jest, Vitest.

### 2.2 集成测试 (Integration Tests) - Middle Layer (20%)
- **范围**: 模块间接口、API、数据库交互。
- **责任人**: 开发 (Dev) & 自动化 QA (SDET)。
- **标准**:
  - 验证组件间契约 (Contract)。
  - 允许真实数据库/服务依赖（但在 CI 中应使用容器化环境）。
  - **工具**: Supertest, Playwright API Testing.

### 2.3 端到端测试 (E2E Tests) - Top Layer (10%)
- **范围**: 完整用户旅程 (User Journey)。
- **责任人**: QA。
- **标准**:
  - 模拟真实用户行为。
  - 仅覆盖核心业务价值流 (Critical Paths)。
  - 运行成本高，需严格控制数量。
  - **工具**: Playwright.

## 3. Phase 1: 输入准备 (Preparation)

任何测试活动的起点，质量的源头。

### 3.1 用户故事 (User Story) 准入标准

**责任人**: Product Manager (PM)

**标准**:

*   必须包含 **业务价值 (Why)**。
*   必须包含 **用户路径 (What)**。
*   必须包含使用 **GIVEN/WHEN/THEN (BDD)** 格式编写的清晰 **验收标准 (Acceptance Criteria, AC)**。

**🔴 红线**: 验收标准模糊（如“体验良好”、“界面美观”）或未使用 BDD 格式的故事，QA 有权拒绝进入测试流程。

### 3.2 场景定义 (Test Scenario)

**责任人**: QA Lead, PM, Tech Lead

**产出**: Test Scenario List

**标准**:

*   场景必须使用 **GIVEN/WHEN/THEN (BDD)** 格式描述。
*   覆盖 **Happy Path (正向流程)**。
*   覆盖 **Exception Path (异常流程**，如网络断开、数据错误)。
*   覆盖 **Edge Case (边界条件**，如最大值、空值)。

## 4. Phase 2: 测试生命周期 (Lifecycle)

测试执行的核心闭环，必须严丝合缝。

### 4.1 用例设计 (Test Case Design)

**原则**: 每一个 Test Case 必须是一个可独立执行的原子单元。用例描述建议映射 BDD 场景 (GIVEN/WHEN/THEN)。

**必须包含字段**:

*   **Case ID**: 全局唯一标识。
*   **Pre-condition**: 前置条件 (e.g., 已登录，购物车有商品)。
*   **Steps**: 具体操作步骤 (动词 + 名词)。
*   **Expected Result**: 预期结果 (必须可观测)。

### 4.2 用例评审 (Case Review) —— 关键门禁

**参与方**: QA (主讲), Dev, PM

**流程**:

*   QA 讲解测试思路。
*   Dev 确认技术可行性与潜在风险。
*   PM 确认是否符合业务原意。

**🔴 红线**: 未经评审的用例，严禁投入执行。

### 4.3 测试执行 (Execution)

**动作**: 严格按照步骤执行，对比预期结果。

**状态定义**:

*   **Pass**: 实际结果 == 预期结果。
*   **Fail**: 实际结果 != 预期结果 (必须提 Bug)。
*   **Blocked**: 因外部原因（如环境挂了）无法执行。
*   **Skipped**: 经评估本次无需执行。

**🔴 红线**:

*   Fail 必须关联 Bug ID。禁止只有 Fail 状态但没有 Bug 单。
*   禁止“假执行”。未实际运行但标记为 Pass 的行为视为严重违规。

### 4.4 缺陷管理 (Bug Management)

**Bug 单规范**:

*   **标题**: [模块] 简短描述问题。
*   **复现步骤**: 必须能让 Dev 稳定复现。
*   **证据**: 必须包含截图、录屏或 Log。
*   **严重级 (Severity)**: S0 (阻断) / S1 (严重) / S2 (一般) / S3 (轻微)。

### 4.5 提测门禁 (Code Handoff Gate)

**准入标准 (Entry Criteria)**:

*   **单元测试**: 核心模块单元测试覆盖率需达到 **80%** 以上。
*   **静态代码检查**: Lint 检查 (ESLint/Prettier) 必须通过，无 Error 级别报错。
*   **冒烟测试**: 开发人员需在本地完成冒烟测试 (Happy Path)，确保主流程畅通。

**🔴 红线**:

*   未通过 CI 构建 (Build Fail) 或 Lint 检查的代码，QA 有权直接 **Reject**。
*   无单元测试或单元测试大量失败的代码，严禁提测。

## 5. Phase 3: 回溯与优化 (Improvement)

没有回溯的测试只是重复劳动。

### 5.1 质量复盘 (Quality Review)

**周期**: 每个 Sprint 结束或发布后。

**分析维度**:

*   **Bug 根因**: 是需求没说清楚？开发逻辑错？还是旧代码回滚？
*   **漏测分析**: 线上发现的 Bug，为什么测试阶段没测出来？（缺用例？还是测了没发现？）

### 5.2 知识库沉淀 (Knowledge Base)

*   所有新发现的 Edge Case，必须反哺到 Case Library。
*   所有 S0/S1 级事故，必须形成 Case Study 案例。

## 6. 附录：NexusQA 术语表

| 术语 | 全称                | 定义                     |
| :--- | :------------------ | :----------------------- |
| AC   | Acceptance Criteria | 验收标准，需求的完成定义。 |
| BDD  | Behavior-Driven Development | 行为驱动开发，使用 GIVEN/WHEN/THEN 格式定义需求和测试。 |
| DoR  | Definition of Ready | 准入标准，开始测试前必须满足的条件。 |
| DoD  | Definition of Done  | 准出标准，结束测试必须满足的条件。 |
| S0   | Severity 0          | 阻断级缺陷，系统崩溃或主流程不通。 |
| Smoke| Smoke Test        | 冒烟测试，确认主流程可跑通，决定是否接受版本。 |
