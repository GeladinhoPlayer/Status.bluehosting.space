# 📋 Tutorial: Instalação do Sistema de Status na VPS

## 🎯 Objetivo
Este tutorial ensina como instalar o sistema de status da BlueHosting em uma VPS que já possui o site principal, configurando o subdomínio `status.bluehosting.space`.

## 📋 Pré-requisitos

- VPS com Ubuntu/Debian
- Site principal já funcionando em `bluehosting.space`
- Acesso root ou sudo
- Node.js 18+ instalado
- Nginx ou Apache configurado
- Certificado SSL configurado

## 🚀 Passo a Passo

### 1. Preparação do Ambiente

\`\`\`bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências necessárias
sudo apt install git curl build-essential -y

# Verificar Node.js (deve ser 18+)
node --version
npm --version

# Se não tiver Node.js 18+, instalar:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
\`\`\`

### 2. Download e Configuração do Projeto

\`\`\`bash
# Navegar para diretório web
cd /var/www/

# Clonar ou fazer upload do projeto
sudo mkdir status.bluehosting.space
sudo chown $USER:$USER status.bluehosting.space
cd status.bluehosting.space

# Fazer upload dos arquivos do projeto aqui
# (via git, scp, ftp, etc.)

# Instalar dependências
npm install

# Build da aplicação
npm run build
\`\`\`

### 3. Configuração do Subdomínio no DNS

No painel do seu provedor de DNS (Cloudflare, etc.):

\`\`\`
Tipo: A
Nome: status
Valor: [IP_DA_SUA_VPS]
TTL: Auto ou 300
\`\`\`

### 4. Configuração do Nginx

Criar arquivo de configuração para o subdomínio:

\`\`\`bash
sudo nano /etc/nginx/sites-available/status.bluehosting.space
\`\`\`

Conteúdo do arquivo:

\`\`\`nginx
server {
    listen 80;
    server_name status.bluehosting.space;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name status.bluehosting.space;
    
    # Configuração SSL (ajustar caminhos conforme sua configuração)
    ssl_certificate /etc/letsencrypt/live/bluehosting.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bluehosting.space/privkey.pem;
    
    # Configurações SSL modernas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Proxy para aplicação Next.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Para Server-Sent Events (tempo real)
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        chunked_transfer_encoding off;
    }
    
    # Logs
    access_log /var/log/nginx/status.bluehosting.space.access.log;
    error_log /var/log/nginx/status.bluehosting.space.error.log;
}
\`\`\`

Ativar o site:

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/status.bluehosting.space /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

### 5. Configuração do SSL (se necessário)

Se ainda não tiver SSL para o subdomínio:

\`\`\`bash
# Instalar Certbot se não tiver
sudo apt install certbot python3-certbot-nginx -y

# Gerar certificado para o subdomínio
sudo certbot --nginx -d status.bluehosting.space

# Verificar renovação automática
sudo certbot renew --dry-run
\`\`\`

### 6. Configuração do PM2 (Gerenciador de Processos)

\`\`\`bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Navegar para o diretório do projeto
cd /var/www/status.bluehosting.space

# Criar arquivo de configuração do PM2
nano ecosystem.config.js
\`\`\`

Conteúdo do `ecosystem.config.js`:

\`\`\`javascript
module.exports = {
  apps: [{
    name: 'status-bluehosting',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/status.bluehosting.space',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
\`\`\`

Iniciar aplicação:

\`\`\`bash
# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Executar o comando que aparecer na tela
\`\`\`

### 7. Configuração do Firewall

\`\`\`bash
# Permitir portas necessárias
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3001

# Verificar status
sudo ufw status
\`\`\`

### 8. Verificação e Testes

\`\`\`bash
# Verificar se a aplicação está rodando
pm2 status

# Verificar logs
pm2 logs status-bluehosting

# Testar nginx
sudo nginx -t

# Verificar se o subdomínio está respondendo
curl -I https://status.bluehosting.space
\`\`\`

## 🔧 Configuração Alternativa com Apache

Se usar Apache em vez de Nginx:

\`\`\`bash
sudo nano /etc/apache2/sites-available/status.bluehosting.space.conf
\`\`\`

```apache
<VirtualHost *:80>
    ServerName status.bluehosting.space
    Redirect permanent / https://status.bluehosting.space/
</VirtualHost>

<VirtualHost *:443>
    ServerName status.bluehosting.space
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/bluehosting.space/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/bluehosting.space/privkey.pem
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3001/
    ProxyPassReverse / http://localhost:3001/
    
    # Para Server-Sent Events
    ProxyPass /api/status-stream http://localhost:3001/api/status-stream
    ProxyPassReverse /api/status-stream http://localhost:3001/api/status-stream
    
    ErrorLog ${APACHE_LOG_DIR}/status.bluehosting.space_error.log
    CustomLog ${APACHE_LOG_DIR}/status.bluehosting.space_access.log combined
</VirtualHost>
