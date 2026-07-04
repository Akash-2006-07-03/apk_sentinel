commands to execute this tool:

cd /home/kali/Desktop/apk-sentinel/backend
python -m uvicorn main:app --reload

and go to: http://localhost:5173/




# install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc   # or source ~/.zshrc if you use zsh

nvm install 22
nvm use 22
node -v   # should show v22.x

cd ~/Desktop/apk-sentinel/frontend
rm -rf node_modules package-lock.json
npm install
npm run dev