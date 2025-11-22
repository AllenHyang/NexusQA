import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 正在启动智能日志监控器...');
  console.log('📡 正在监听 http://localhost:3000 的 Gemini 事件...');
  console.log('---------------------------------------------------');

  const browser = await puppeteer.launch({
    headless: "new",
  });

  const page = await browser.newPage();

  // 设置控制台监听器
  page.on('console', msg => {
    const text = msg.text();
    
    // 检查是否是我们的特定事件
    if (text.startsWith('[GEMINI_COMPLETE]')) {
        try {
            // 提取 JSON 部分（去掉前缀）
            const jsonStr = text.replace('[GEMINI_COMPLETE]', '').trim();
            const data = JSON.parse(jsonStr); // 解析为对象，但如果它是已经在浏览器中被序列化过的字符串，可能需要处理

            // 在控制台输出漂亮的格式
            console.log('\n✨ ✨ ✨ GEMINI AI 任务完成 ✨ ✨ ✨');
            console.log(`📅 时间: ${data.timestamp}`);
            console.log(`🎬 动作: \x1b[36m${data.action}\x1b[0m`); // 青色动作名
            
            console.log('📥 输入数据:');
            console.dir(data.input, { depth: null, colors: true });
            
            console.log('📤 输出结果:');
            console.dir(data.output, { depth: null, colors: true });
            console.log('---------------------------------------------------\n');

        } catch (e) {
            console.log('⚠️ 无法解析 Gemini 日志:', text);
        }
    } else {
        // 普通日志，可以选择显示或忽略，这里我们淡化显示
        // console.log(`[LOG] ${text}`); 
    }
  });

  page.on('pageerror', err => {
    console.error(`\x1b[31m[ERROR] ${err.toString()}\x1b[0m`);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('✅ 监控已就绪。请在浏览器中操作应用触发 AI 功能...');
  } catch (error) {
    console.error('❌ 连接失败。请确保 "npm run dev" 正在运行。');
    process.exit(1);
  }
})();