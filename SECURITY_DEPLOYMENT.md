# Security deployment

Run these steps on the Alibaba Cloud server after the security commit has been pulled.

## 1. Protect the current business data

```bash
cd /opt/building-sales-system
node scripts/backup-db.js
```

The command validates `data/db.json`, creates a compressed backup under
`data/backups/`, and writes a SHA-256 checksum beside it.

## 2. Migrate existing passwords

```bash
cd /opt/building-sales-system
node scripts/migrate-passwords.js
```

The migration creates another backup before replacing plaintext passwords with
scrypt hashes. It is safe to run more than once.

## 3. Enable the daily backup timer

```bash
sudo cp deploy/systemd/building-sales-system-backup.service /etc/systemd/system/
sudo cp deploy/systemd/building-sales-system-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now building-sales-system-backup.timer
sudo systemctl list-timers building-sales-system-backup.timer --no-pager
```

Local backups are retained for 30 days. For an additional private OSS copy,
configure `OSS_BACKUP_URI` and the OSS credentials in
`/etc/building-sales-system-backup.env`; never commit that file.

## 4. Enable HTTPS

First verify that both domains resolve to this server and that the existing
Nginx HTTP site works. Then install Certbot and let it update the active Nginx
site:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d caidajia.top -d www.caidajia.top --redirect
sudo certbot renew --dry-run
```

After HTTPS works, add this line to the existing systemd override:

```ini
Environment=COOKIE_SECURE=true
```

Then reload and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart building-sales-system
```

## 5. Rotate the exposed DeepSeek key

Revoke the previously exposed key in the DeepSeek console, create a new key,
and replace only the server-side `DEEPSEEK_API_KEY` environment value. Do not
paste the new key into source code, screenshots, chat, or Git.

## 6. Verify

```bash
cd /opt/building-sales-system
node --check server.js
sudo systemctl status building-sales-system --no-pager -l
curl -I http://127.0.0.1:3000/
curl -I https://www.caidajia.top/
sudo systemctl start building-sales-system-backup.service
sudo journalctl -u building-sales-system-backup.service -n 30 --no-pager
```

To restore a verified backup manually:

```bash
node scripts/restore-db.js --from data/backups/db-YYYYMMDD-HHMMSS.json.gz
```

The restore command creates a fresh safety backup before replacing the live
database.
