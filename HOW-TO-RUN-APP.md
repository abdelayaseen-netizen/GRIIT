# How to open the GRIT app in your browser

The link **http://localhost:8081** only works when the app server is **running** on your computer. If you see "This site can’t be reached", the server is not running yet.

---

## Step 1: Start the server

Use **one** of these:

### Option A – From Cursor / VS Code (recommended)

1. Open the project in Cursor (or VS Code).
2. Open the **terminal** (Terminal → New Terminal, or `` Ctrl+` ``).
3. Run:
   ```bash
   npm start
   ```
4. Wait until you see something like **"Metro waiting on"** and a QR code.
5. Press **`w`** (for web). The app will build and then open in your browser, or it will print a URL like `http://localhost:8081`.

### Option B – From Command Prompt

1. Press **Win + R**, type **`cmd`**, press Enter.
2. Run:
   ```bash
   cd /d "c:\Users\abdel\OneDrive\Desktop\GRIT-1"
   npm start
   ```
3. Wait for the server to start, then press **`w`** to open in the browser.

### Option C – Double‑click the batch file

1. In File Explorer, go to: `c:\Users\abdel\OneDrive\Desktop\GRIT-1`
2. Double‑click **`Start and open GRIT app.bat`**
3. A black "GRIT Server" window should open and stay open. If you see **"npm is not recognized"**, Node.js is not in your PATH when running from Explorer — use **Option A or B** instead.
4. Wait about 25 seconds; the browser should open automatically. If the page is blank, wait a bit and press **F5** to refresh.

---

## Step 2: Use the link

When the server is running, open:

**http://localhost:8081**

(Paste it in your browser’s address bar or use **Open GRIT in browser.bat**.)

---

## If it still doesn’t work

- **"npm is not recognized"**  
  Install Node.js from https://nodejs.org and make sure to check "Add to PATH". Then close and reopen the terminal (or Cursor) and try again.

- **Different port**  
  After running `npm start` and pressing `w`, check the terminal for a line like `Webpack compiled in ...` or `App running at http://localhost:XXXX`. Use that URL instead of 8081.

- **Firewall**  
  If Windows Firewall asks whether to allow Node, choose "Allow access".
