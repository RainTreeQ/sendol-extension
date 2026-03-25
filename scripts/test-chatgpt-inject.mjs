#!/usr/bin/env node
/**
 * ChatGPT 注入逻辑单元测试
 * 验证防御性等待逻辑的正确性
 */

import { sleep, normalizeText } from '../src/content/core/utils.js';

// 模拟测试数据
const testCases = [
  {
    name: '初次加载 - 内容为空需要等待',
    input: {
      expected: 'Hello world',
      initialContent: '',
      delayedContent: 'Hello world', // 100ms后才有内容
      delay: 100
    },
    expected: {
      shouldWait: true,
      finalContent: 'Hello world'
    }
  },
  {
    name: '正常情况 - 内容已同步',
    input: {
      expected: 'Test message',
      initialContent: 'Test message',
      delayedContent: 'Test message',
      delay: 0
    },
    expected: {
      shouldWait: false,
      finalContent: 'Test message'
    }
  },
  {
    name: '空预期 - 不触发等待',
    input: {
      expected: '',
      initialContent: '',
      delayedContent: '',
      delay: 0
    },
    expected: {
      shouldWait: false,
      finalContent: ''
    }
  },
  {
    name: '内容始终为空 - 最多等待3次',
    input: {
      expected: 'Some text',
      initialContent: '',
      delayedContent: '', // 始终为空
      delay: 999999 // 永远不会变
    },
    expected: {
      shouldWait: true,
      finalContent: '', // 最终还是空
      maxWaits: 3
    }
  }
];

async function runTestCase(testCase) {
  console.log(`  测试: ${testCase.name}`);
  
  const { expected, initialContent, delayedContent, delay } = testCase.input;
  let currentContent = initialContent;
  let syncChecks = 0;
  
  // 模拟延迟更新内容
  if (delay > 0) {
    setTimeout(() => {
      currentContent = delayedContent;
    }, delay);
  }
  
  // 复制 chatgpt.js 的防御性等待逻辑
  let before = normalizeText(currentContent);
  if (expected && expected.length > 0) {
    // 如果内容为空，短暂等待让Lexical完成同步（最多等300ms）
    while (syncChecks < 3 && before.length === 0) {
      await sleep(100);
      before = normalizeText(currentContent);
      syncChecks++;
    }
  }
  
  // 验证结果
  const passed = before === testCase.expected.finalContent;
  const shouldHaveWaited = syncChecks > 0;
  const waitCorrect = shouldHaveWaited === testCase.expected.shouldWait;
  
  if (testCase.expected.maxWaits !== undefined) {
    const maxWaitsCorrect = syncChecks === testCase.expected.maxWaits;
    console.log(`    ${passed && maxWaitsCorrect ? '✓' : '✗'} 等待次数: ${syncChecks}, 预期: ${testCase.expected.maxWaits}`);
    return passed && maxWaitsCorrect;
  }
  
  console.log(`    ${passed ? '✓' : '✗'} 内容: "${before}", 预期: "${testCase.expected.finalContent}"`);
  console.log(`    ${waitCorrect ? '✓' : '✗'} 等待: ${shouldHaveWaited}, 预期: ${testCase.expected.shouldWait}`);
  
  return passed && waitCorrect;
}

async function main() {
  console.log('========== ChatGPT 注入逻辑单元测试 ==========\n');
  console.log('测试防御性等待逻辑的正确性...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const result = await runTestCase(testCase);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    console.log('');
  }
  
  console.log(`========== 测试结果 ==========`);
  console.log(`通过: ${passed}/${testCases.length}`);
  console.log(`失败: ${failed}/${testCases.length}`);
  
  if (failed > 0) {
    console.log('\n❌ 测试未通过，请检查修改');
    process.exit(1);
  } else {
    console.log('\n✅ 所有测试通过');
    process.exit(0);
  }
}

main().catch(console.error);
