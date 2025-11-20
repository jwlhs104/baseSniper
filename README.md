# Base Token 監控工具

監控 Coinbase Smart Wallet (`0x2211d1D0020DAEA8039E46Cf1367962070d77DA9`) 在 Base 鏈上的活動，第一時間獲取新 token 的合約地址。

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 開始監控

**在今晚 1:00 之前啟動監控**：

```bash
npm run monitor
```

程式會：

- ✅ 實時監控錢包的所有交易
- ✅ 自動捕獲新合約創建
- ✅ 提取 token 合約地址
- ✅ 顯示 Basescan 連結

按 `Ctrl + C` 停止監控。

## 手動查詢方法（備用）

如果自動監控失敗，可以手動查看：

### 使用 Basescan

1. **訪問錢包頁面**：

   ```
   https://basescan.org/address/0x2211d1D0020DAEA8039E46Cf1367962070d77DA9
   ```

2. **在發行時間後（1:00 之後）**：

   - 點擊 **"Transactions"** 標籤頁
   - 重新整理頁面（F5）
   - 查看最新的交易

3. **查看交易詳情**：

   - 點擊最新交易的 **交易哈希**
   - 檢查以下區域：
     - **"Logs"** 標籤：查看事件日誌中的地址
     - **"Internal Txns"**：查看內部交易創建的合約
     - **"State"** 變化：新出現的合約地址

4. **確認 Token 地址**：
   - 新 token 地址通常會顯示為 `ERC20 Token Transfer` 事件
   - 或在 "Internal Txns" 中顯示為 `Contract Creation`

## 提升監控速度的建議

### 使用付費 RPC（推薦）

免費的公共 RPC 可能有延遲。為了第一時間獲取資訊，建議使用：

#### 1. Alchemy（推薦）

```javascript
// 在 monitor_wallet.js 中修改：
const BASE_RPC = "https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY";
```

- 註冊：https://www.alchemy.com/
- 免費方案：每月 300M requests

#### 2. QuickNode

```javascript
const BASE_RPC = "YOUR_QUICKNODE_ENDPOINT";
```

- 註冊：https://www.quicknode.com/
- 更快的響應速度

#### 3. Infura

```javascript
const BASE_RPC = "https://base-mainnet.infura.io/v3/YOUR_API_KEY";
```

- 註冊：https://infura.io/
