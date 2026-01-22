# Smart Automated Crypto Investment & Risk Management Agent - User Flow

## 🎯 Overview

This app enables non-technical crypto users to automate investment and risk strategies on **Cronos EVM** using:
- **Crypto.com MCP** for real-time market data
- **x402 settlement** for on-chain trades
- **Workflow-based automation** with visual node editor

---

## 📱 User Journey

### 1. **Home / Workflows List** (`/workflows`)
- User sees all their saved workflows
- Each workflow card shows:
  - Name
  - Strategy type (Smart vs Normal)
  - Last updated date
  - Edit/Delete buttons
- **"New Workflow"** button to create a new one

### 2. **Create/Edit Workflow** (`/create-workflow` or `/create-workflow?id=...`)
- **Workflow Configuration:**
  - **Name**: User-friendly name for the workflow
  - **Strategy**: 
    - **Normal**: Direct trigger-based execution (timer or price threshold)
    - **Smart**: AI-powered dip/volatility strategy (30-day MA, drawdown, volatility spikes)
  - **Smart Strategy Settings** (only if Smart selected):
    - **Dip Threshold %**: Buy when price drops X% below 30-day average (default: 7%)
    - **Volatility Threshold %**: Hedge when volatility exceeds X% above average (default: 20%)

- **Visual Flow Builder:**
  - Drag-and-drop node editor (React Flow)
  - **Triggers** (start of workflow):
    - **Timer Trigger**: Runs workflow every X seconds
      - Shows countdown display on node
      - Backend scheduler checks every 5 seconds
    - **Price Trigger**: Executes when asset price crosses threshold
      - Shows live price on dashboard (polls every 10 seconds)
      - Backend checks every 30 seconds
  - **Actions** (what happens when triggered):
    - **Hyperliquid**: Place trade on Hyperliquid exchange
    - **Lighter**: Place trade on Lighter exchange  
    - **Backpack**: Send transaction via Backpack wallet
    - Each action configures: Position (LONG/SHORT), Quantity, Symbol (CRO/USDC)

- **Live Features:**
  - **Real-time Price Display**: Side panel shows current prices for all price triggers
  - **Execution History**: Bottom panel shows last 100 runs with:
    - Decision (BUY/HEDGE/IDLE)
    - Market snapshot (spot, MA30, vol30, drawdown %)
    - Transaction hash (if trade executed)
    - Timestamp

- **Actions:**
  - **Save/Update Workflow**: Stores workflow to MongoDB
  - **Run Now**: Manually triggers workflow execution
  - **Back to Workflows**: Returns to list page

---

## ⚙️ How It Works (Technical Flow)

### **Backend Scheduler** (runs every 5 seconds)

1. **Loads all workflows** from MongoDB
2. **For each workflow:**
   - **Timer Triggers:**
     - Checks if timer interval has elapsed since last execution
     - If yes → executes workflow
   - **Price Triggers:**
     - Fetches current price from MCP
     - Compares with last known price
     - If price crossed threshold → executes workflow
   - **Smart Strategy:**
     - Fetches 30-day market data from MCP
     - Computes moving average, volatility, drawdown
     - Compares against user-defined thresholds
     - Makes BUY/HEDGE/IDLE decision

### **Workflow Execution** (`runWorkflowOnce`)

1. **Creates execution log** (status: PENDING)
2. **Determines decision:**
   - **Price Trigger**: Checks if current price >= threshold → BUY, else IDLE
   - **Smart Strategy**: 
     - Drawdown > threshold → BUY (USDC → CRO)
     - Volatility spike → HEDGE (CRO → USDC)
     - Otherwise → IDLE
   - **Normal Timer**: Always executes actions → BUY
3. **Executes Actions:**
   - Reads first action node metadata (type, qty, symbol)
   - Creates x402 payment header (EIP-3009 signature)
   - Calls facilitator `/verify` endpoint
   - Calls facilitator `/settle` endpoint
   - Receives transaction hash
4. **Updates execution log:**
   - Status: SUCCESS or FAILURE
   - Decision, market snapshot, txHash, error (if any)

### **MCP Integration**

- **Endpoint**: `https://mcp.crypto.com/market-data/mcp`
- **Tools Used:**
  - `market_data.get_candles`: 30-day historical OHLCV
  - `market_data.get_spot`: Current spot price
- **Computed Metrics:**
  - **MA30**: 30-day moving average
  - **Vol30**: 30-day volatility (standard deviation)
  - **Drawdown %**: % below MA30

### **x402 Settlement**

- **Facilitator**: `https://facilitator.cronoslabs.org/v2/x402`
- **Network**: Cronos Testnet (Chain ID: 338)
- **Asset**: devUSDC.e (`0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0`)
- **Flow:**
  1. Backend signs EIP-3009 `transferWithAuthorization` message
  2. Encodes payment header as base64
  3. POST `/verify` → validates signature & requirements
  4. POST `/settle` → executes on-chain swap
  5. Returns transaction hash

---

## 🔄 Supported Assets

- **CRO** (Cronos native token)
- **USDC** (USDC.e bridged token, 6 decimals)

All workflows operate on **CRO/USDC** pairs for Cronos EVM compatibility.

---

## 🎨 UI Features

- **Glassmorphism design**: Frosted glass effects, gradients
- **Real-time updates**: Price polling, execution history
- **Visual flow builder**: Drag nodes, connect triggers to actions
- **Responsive layout**: Works on desktop and tablet

---

## 📊 Example Workflow Scenarios

### Scenario 1: DCA Bot (Normal Strategy + Timer)
- **Trigger**: Timer (3600s = 1 hour)
- **Action**: Hyperliquid LONG 50 CRO
- **Result**: Buys 50 CRO every hour automatically

### Scenario 2: Buy the Dip (Smart Strategy + Timer)
- **Strategy**: Smart
- **Dip Threshold**: 7%
- **Trigger**: Timer (86400s = daily)
- **Action**: Backpack LONG 100 CRO
- **Result**: Checks daily, buys 100 CRO if price dropped >7% below 30-day average

### Scenario 3: Price Alert (Normal Strategy + Price Trigger)
- **Trigger**: Price Trigger (CRO >= $0.10)
- **Action**: Lighter LONG 200 CRO
- **Result**: Executes immediately when CRO hits $0.10

### Scenario 4: Volatility Hedge (Smart Strategy + Timer)
- **Strategy**: Smart
- **Vol Threshold**: 20%
- **Trigger**: Timer (weekly)
- **Action**: Hyperliquid SHORT 50 CRO
- **Result**: Hedges by selling CRO if volatility spikes >20% above average

---

## 🔐 Authentication

- Users sign up/sign in via `/signup` and `/signin`
- JWT token stored in `localStorage`
- All workflow endpoints require authentication
- Each user only sees their own workflows

---

## 🚀 Getting Started

1. **Backend**:
   ```bash
   cd trading-turborepo/apps/backend
   pnpm install
   # Set .env variables (MONGO_URL, JWT_SECRET, X402_*, MCP_*)
   pnpm dev
   ```

2. **Frontend**:
   ```bash
   cd trading-turborepo/apps/frontend
   pnpm install
   pnpm dev
   ```

3. **Access**: `http://localhost:5173` → `/workflows`

---

## ✅ Success Criteria Met

- ✅ User can define workflows
- ✅ Workflows execute periodically without manual intervention
- ✅ MCP data influences decision making
- ✅ Trades settle on Cronos via x402
- ✅ User can view execution history & tx hashes
- ✅ Full pipeline runs autonomously end-to-end
