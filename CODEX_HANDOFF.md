# Codex Handoff - Building Sales System

Last updated: 2026-07-09

This document is for a future Codex account/assistant to continue the project without needing the prior chat history.

## 1. User Goal

The user originally built a sales/order system on Feishu/Lark Base/Miaoda. The goal is to rebuild it as an independent web system that does not rely on Feishu identity login.

Core goals:

- Public internet access via a shareable link.
- Login by mobile phone number and password.
- Admin can manage user accounts, roles, and permissions based on phone number.
- Sales/finance/other roles should see only permitted pages.
- System is for front-end building-material sales work, not warehouse/inventory management.
- It should work reasonably on desktop and mobile.
- Sales order export must really download as image/document.
- Sales order layout should be simple, clean, and close to the user's original Feishu-generated order image.

The user explicitly said they do not need:

- Inventory overview
- Goods inventory
- Stock-in
- Stock-out
- Warnings
- Statistics

## 2. Current Project

Local project path:

```text
C:\Users\84472\Documents\codex 项目\building-sales-system
```

GitHub repository:

```text
https://github.com/houmingjian5-creator/building-sales-system.git
```

Main files:

- `server.js` - zero-dependency Node.js HTTP server and API.
- `public/index.html` - frontend entry.
- `public/app.js` - frontend logic.
- `public/styles.css` - frontend styles.
- `data/db.json` - current JSON-file data store.
- `package.json` - npm scripts.
- `README.md`
- `Dockerfile`
- `render.yaml`

Important: `data/db.json` is currently modified locally because of a login/test record. Do not commit this data change unless the user explicitly wants to preserve it.

## 3. Current Git State

As of 2026-07-09, local branch is ahead of GitHub by 2 commits:

```text
3a043fb Use Node 12 compatible requires
3a19f38 Support Node 12 server runtime
```

Why these commits matter:

- The Aliyun server only has Node.js `v12.22.9`.
- The original code used APIs/imports not compatible with Node 12:
  - `crypto.randomUUID()`
  - `require("node:http")`, `require("node:fs")`, etc.
- These two commits make local code compatible with Node 12.

GitHub push failed multiple times due to local network errors:

```text
Failed to connect to github.com port 443
Recv failure: Connection was reset
```

Next Codex should first try:

```powershell
git -C "C:\Users\84472\Documents\codex 项目\building-sales-system" push origin main
```

If push succeeds, GitHub will match the local fixed code.

## 4. Production Server

Cloud provider: Alibaba Cloud / Aliyun Lightweight Application Server

Server:

```text
Ubuntu 22.04
Public IP: 47.108.171.221
Private IP: 172.19.52.101
SSH/Web terminal user: admin
Project path: /opt/building-sales-system
Systemd service: building-sales-system
Nginx reverse proxy: enabled
App port: 3000
Public HTTP port: 80
```

Current working public URL:

```text
http://47.108.171.221
```

The site has been confirmed to load through the IP address.

Useful server commands:

```bash
cd /opt/building-sales-system
sudo systemctl status building-sales-system --no-pager
sudo systemctl restart building-sales-system
sudo nginx -t
sudo systemctl reload nginx
curl http://127.0.0.1:3000
```

Nginx config file:

```text
/etc/nginx/sites-available/building-sales-system
```

It proxies:

```text
http://127.0.0.1:3000
```

## 5. Deployment History

The user first tried Render, but Render required adding a credit card. The user did not have/want to use one.

Then the user bought an Aliyun Lightweight Application Server.

Server setup steps already completed:

- Installed `git`, `curl`, `nginx`.
- Tried installing Node 22 via NodeSource, but `deb.nodesource.com` failed due to connection reset.
- Installed Ubuntu default Node.js and npm:

```text
node -v => v12.22.9
npm -v => 8.5.1
```

- Tried installing PM2, but npm registry timed out:

```text
ERR_SOCKET_TIMEOUT while trying to fetch https://registry.npmjs.org/pm2
```

- Switched to `systemd`, which works and is preferred for now.
- Cloned project to `/opt/building-sales-system`.
- Applied server-side compatibility patches for Node 12.
- Created and started `building-sales-system.service`.
- Configured Nginx reverse proxy.
- Opened port 80 in Aliyun firewall.

## 6. Domain Status

Domain bought:

```text
caidajia.top
```

Domain real-name verification:

```text
Completed successfully
```

DNS records already added in Aliyun DNS:

```text
@    A    47.108.171.221
www  A    47.108.171.221
```

Nginx was updated to include:

```text
server_name caidajia.top www.caidajia.top 47.108.171.221;
```

But opening `http://caidajia.top` currently shows Aliyun page:

```text
域名暂时无法访问...
该域名当前备案状态不符合访问要求
```

Meaning:

- DNS is likely correct.
- Nginx is likely fine.
- Aliyun blocks domain access because ICP filing/备案 is not complete.
- IP access still works.

Next required step:

- Complete ICP filing/备案 in Aliyun.
- The user reached the Aliyun ICP page showing no existing filing records.
- The next user action is to click `开始备案`.

Suggested filing information:

```text
Domain: caidajia.top
Website name: 材大家建材销售系统
Website purpose/description: 用于建材销售订单管理、客户信息管理及内部业务协同。
Server: Aliyun lightweight server tied to 47.108.171.221
Filing type: 首次备案 or 新增网站备案 depending on Aliyun prompt
Filing subject: Prefer 企业备案 for long-term company/business use; personal filing only for non-business testing.
```

Important:

- If it is business/commercial company use, enterprise filing is recommended and may require business license.
- HTTPS should wait until domain access is no longer blocked by备案.

## 7. Application Features Implemented

Current system is a clickable/full web prototype with server persistence through a JSON file.

Implemented:

- Phone/password login.
- Session cookie.
- Role-based UI behavior.
- Sales overview.
- Customer management.
- Product management.
- Sales order creation.
- Order management.
- Return order page.
- Personnel management page visible only to admin roles.
- Admin can add/edit login users, phone numbers, passwords, roles, status.
- Sales order export as downloadable image/document.
- Mobile adaptation was considered in frontend styling, but needs more testing and refinement.

API endpoints in `server.js`:

```text
POST /api/login
POST /api/logout
GET  /api/me
GET  /api/bootstrap
GET  /api/users
POST /api/users
PUT  /api/users/:id
GET  /api/orders
POST /api/orders
```

## 8. Built-in/Test Accounts

These are the known accounts originally seeded in `data/db.json`.

```text
超级管理员: 13800000001 / 888888
销售人员:   13800000002 / 888888
管理员:     13800000004 / 888888
财务:       13800000005 / 888888
```

Security note:

- These default passwords are weak.
- Before real business use, require the user to change passwords or implement a password reset/change flow.
- Do not store Aliyun/GitHub passwords or tokens in the repo.

## 9. Current Technical Limitations

The current version is usable for testing and early internal use, but not yet a full production-grade system.

Limitations:

- Data is stored in `data/db.json`, not a real database.
- No automatic backups yet.
- No HTTPS yet because domain is blocked pending ICP filing.
- Authentication uses plain text passwords in JSON. This must be upgraded before serious production use.
- Sessions are memory-only. If the server restarts, users need to log in again.
- Node.js on server is old (`v12.22.9`). Either keep compatibility or later upgrade Node.
- GitHub remote is behind local by 2 commits until network push succeeds.

## 10. Recommended Next Steps

Recommended order agreed with the user:

1. Sync GitHub with local code.
   - Push the 2 local commits.
   - Avoid committing accidental `data/db.json` login/test changes.

2. Complete ICP filing/备案.
   - Domain access is blocked until备案 is approved.
   - Continue using `http://47.108.171.221` during review.

3. Configure HTTPS.
   - After备案 passes, issue certificate for `caidajia.top` and `www.caidajia.top`.
   - Configure Nginx 443 and redirect HTTP to HTTPS.

4. Move data from JSON file to a real database.
   - Suggested: SQLite for simple single-server use, or MySQL/PostgreSQL for longer-term.
   - Include migrations/backups.

5. Add automatic backups.
   - At minimum back up `data/db.json` or DB daily.
   - Keep several restore points.

6. Improve security.
   - Hash passwords.
   - Add password change.
   - Add admin-only user management safeguards.
   - Consider login rate limiting.

7. Continue UI/business improvements.
   - Sales order image design still needs improvement to more closely match original Feishu style.
   - Soften icons/buttons.
   - More mobile testing.
   - Add or refine business fields requested by the user.

## 11. Important User Preferences

Communication:

- User prefers Chinese.
- User needs step-by-step operational guidance with screenshots.
- Avoid assuming they know server/Git/Linux details.
- Give exact copy-paste commands.
- When asking them to use Aliyun UI, tell them exactly which button/menu to click.

Product/design:

- The user disliked an earlier generated sales order image and said it was too ugly.
- They want the sales order to be simple, clean, restrained, and closer to the original Feishu-generated image.
- They do not want a flashy customer-facing sales order.
- Icons should be softer and more polished.
- Mobile opening via shared link matters.

Business scope:

- This is for building-material sales front-end work, not inventory/warehouse.
- Personnel management must be admin-only.

## 12. How A Future Codex Should Resume

First read:

```text
CODEX_HANDOFF.md
README.md
server.js
public/app.js
public/styles.css
data/db.json
```

Then run:

```powershell
git -C "C:\Users\84472\Documents\codex 项目\building-sales-system" status --short --branch
git -C "C:\Users\84472\Documents\codex 项目\building-sales-system" log --oneline -8
```

Before making changes:

- Confirm whether GitHub push has been fixed.
- Do not overwrite user/server data.
- Do not commit `data/db.json` unless intentional.

For future deploy after GitHub is synced:

```bash
cd /opt/building-sales-system
git pull
sudo systemctl restart building-sales-system
```

If service fails:

```bash
sudo systemctl status building-sales-system --no-pager
journalctl -u building-sales-system -n 80 --no-pager
```

