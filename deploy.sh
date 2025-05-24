#!/bin/bash
set -e
echo "Starting deployment..."
cd /home/ubuntu/tictactoe-ollama
git pull origin main
npm install
npm run build
sudo systemctl daemon-reload
sudo systemctl restart nextjs.service
sudo systemctl enable nextjs.service
sudo systemctl status nextjs.service --no-pager
sudo systemctl restart apache2
if ! systemctl is-active --quiet nextjs.service; then
  echo "❌tictactoe is not running."
  sudo systemctl status nextjs.service --no-pager
  exit 1
fi
