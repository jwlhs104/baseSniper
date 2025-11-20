const { ethers } = require("ethers");

// Base 鏈的 RPC 端點
const BASE_RPC = "https://mainnet.base.org";
// 建議使用付費 RPC 以獲得更快速度：
// const BASE_RPC = 'https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY';

// 要監控的錢包地址（CoinbaseSmartWallet）
const WALLET_ADDRESS = "0x2211d1D0020DAEA8039E46Cf1367962070d77DA9";

async function monitorWallet() {
  const provider = new ethers.JsonRpcProvider(BASE_RPC);

  console.log("=".repeat(60));
  console.log("🔍 Base Token 監控工具");
  console.log("=".repeat(60));
  console.log(`監控錢包: ${WALLET_ADDRESS}`);
  console.log(
    `當前時間: ${new Date().toLocaleString("zh-TW", {
      timeZone: "Asia/Taipei",
    })}`
  );
  console.log(`\n等待錢包發送交易...\n`);

  let lastCheckedBlock = await provider.getBlockNumber();

  // 監聽每個新區塊
  provider.on("block", async (blockNumber) => {
    try {
      // 顯示心跳，證明程式還在運行
      if (blockNumber % 10 === 0) {
        console.log(
          `⏱️  [${new Date().toLocaleTimeString("zh-TW", {
            timeZone: "Asia/Taipei",
          })}] 監控中... 當前區塊: ${blockNumber}`
        );
      }

      const block = await provider.getBlock(blockNumber, true);
      if (block && block.transactions) {
        for (const txHash of block.transactions) {
          const tx = await block.getTransaction(txHash);
          if (!tx) continue;

          // 檢查是否是從目標錢包發出的交易
          if (
            tx.from &&
            tx.from.toLowerCase() === WALLET_ADDRESS.toLowerCase()
          ) {
            console.log("\n" + "🚀".repeat(30));
            console.log("🎉 偵測到目標錢包發送交易！");
            console.log("🚀".repeat(30));
            console.log(
              `\n時間: ${new Date().toLocaleString("zh-TW", {
                timeZone: "Asia/Taipei",
              })}`
            );
            console.log(`交易哈希: ${tx.hash}`);
            console.log(`區塊號: ${blockNumber}`);
            console.log(`發送者: ${tx.from}`);
            console.log(`接收者: ${tx.to || "(合約創建)"}`);
            console.log(
              `Gas Price: ${ethers.formatUnits(tx.gasPrice || 0n, "gwei")} Gwei`
            );
            console.log(`\n⏳ 等待交易確認...`);

            try {
              // 等待交易被確認並獲取收據
              const receipt = await provider.waitForTransaction(tx.hash, 1);

              console.log(
                `\n✅ 交易已確認！狀態: ${
                  receipt.status === 1 ? "成功" : "失敗"
                }`
              );

              // 檢查是否直接創建了新合約
              if (receipt.contractAddress) {
                console.log("\n" + "💎".repeat(30));
                console.log("🎊 發現新合約部署！");
                console.log("💎".repeat(30));
                console.log(`\n✨ Token 合約地址: ${receipt.contractAddress}`);
                console.log(
                  `🔗 Basescan: https://basescan.org/address/${receipt.contractAddress}`
                );
                console.log(`🔗 交易詳情: https://basescan.org/tx/${tx.hash}`);
              }

              // 分析交易日誌，尋找可能的 token 地址
              if (receipt.logs && receipt.logs.length > 0) {
                console.log(
                  `\n📋 交易產生了 ${receipt.logs.length} 個事件日誌`
                );

                const possibleTokenAddresses = new Set();

                receipt.logs.forEach((log, index) => {
                  console.log(`\n  日誌 #${index + 1}:`);
                  console.log(`    合約地址: ${log.address}`);
                  console.log(`    Topics 數量: ${log.topics.length}`);

                  // Token 創建事件通常會在 topics 中包含地址
                  if (log.topics.length > 1) {
                    // 嘗試從 topics[1] 提取地址（很多 token 工廠會把新 token 地址放這裡）
                    const addr = "0x" + log.topics[1].slice(26);
                    possibleTokenAddresses.add(addr);
                    console.log(`    🔍 可能的 Token 地址: ${addr}`);
                  }

                  // 也檢查日誌的合約地址本身（可能是新創建的 token）
                  possibleTokenAddresses.add(log.address);
                });

                // 總結所有可能的 token 地址
                if (possibleTokenAddresses.size > 0) {
                  console.log("\n" + "=".repeat(60));
                  console.log("💡 所有可能的 Token 合約地址：");
                  console.log("=".repeat(60));
                  let count = 1;
                  for (const addr of possibleTokenAddresses) {
                    console.log(`${count}. ${addr}`);
                    console.log(`   https://basescan.org/address/${addr}`);
                    count++;
                  }
                }
              }

              // 獲取交易的輸入數據
              if (tx.data && tx.data.length > 10) {
                console.log(`\n📝 交易 Data:`);
                console.log(`   函數選擇器: ${tx.data.slice(0, 10)}`);
                console.log(`   Data 長度: ${tx.data.length} 字元`);
              }

              console.log("\n" + "=".repeat(60));
              console.log("繼續監控...\n");
            } catch (error) {
              console.error(`\n❌ 獲取交易收據時出錯: ${error.message}`);
            }
          }
        }
      }
    } catch (error) {
      // 忽略一些常見的網路錯誤
      if (!error.message.includes("could not coalesce error")) {
        console.error(`處理區塊 ${blockNumber} 時出錯: ${error.message}`);
      }
    }
  });

  // 處理中斷信號
  process.on("SIGINT", () => {
    console.log("\n\n👋 監控已停止");
    console.log(
      `停止時間: ${new Date().toLocaleString("zh-TW", {
        timeZone: "Asia/Taipei",
      })}`
    );
    process.exit(0);
  });

  // 錯誤處理
  provider.on("error", (error) => {
    console.error("Provider 錯誤:", error.message);
    console.log("嘗試重新連接...");
  });
}

// 啟動監控
console.log("正在連接到 Base 網路...\n");
monitorWallet().catch((error) => {
  console.error("❌ 監控失敗:", error.message);
  process.exit(1);
});
