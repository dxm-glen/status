# Amazon EC2 배포 가이드

Status RPG AI 애플리케이션을 Amazon Linux 2023 환경에서 실행하기 위한 상세 가이드입니다.

## 목차
1. [EC2 인스턴스 설정](#ec2-인스턴스-설정)
2. [시스템 패키지 설치](#시스템-패키지-설치)
3. [Node.js 설치](#nodejs-설치)
4. [PostgreSQL 설치 및 설정](#postgresql-설치-및-설정)
5. [애플리케이션 배포](#애플리케이션-배포)
6. [환경 변수 설정](#환경-변수-설정)
7. [데이터베이스 초기화](#데이터베이스-초기화)
8. [애플리케이션 실행](#애플리케이션-실행)
9. [프로세스 관리](#프로세스-관리)
10. [보안 설정](#보안-설정)
11. [문제 해결](#문제-해결)

## EC2 인스턴스 설정

### 권장 사양
- **인스턴스 타입**: t3.small 이상 (최소 2GB RAM)
- **운영체제**: Amazon Linux 2023
- **스토리지**: 20GB 이상 gp3 EBS
- **보안 그룹**: HTTP(80), HTTPS(443), SSH(22), Custom(5000) 포트 허용

### 보안 그룹 설정
```
Type        Protocol    Port Range    Source
SSH         TCP         22           Your IP/0.0.0.0/0
HTTP        TCP         80           0.0.0.0/0
HTTPS       TCP         443          0.0.0.0/0
Custom TCP  TCP         5000         0.0.0.0/0
Custom TCP  TCP         5432         10.0.0.0/8 (PostgreSQL, VPC 내부만)
```

## 시스템 패키지 설치

### 시스템 업데이트
```bash
# 시스템 패키지 업데이트
sudo dnf update -y

# 필수 개발 도구 설치
sudo dnf groupinstall -y "Development Tools"

# 추가 필수 패키지 설치
sudo dnf install -y \
    git \
    curl \
    wget \
    vim \
    htop \
    unzip \
    tar \
    gcc \
    gcc-c++ \
    make \
    openssl-devel \
    zlib-devel \
    readline-devel \
    sqlite-devel \
    bzip2-devel \
    libffi-devel
```

## Node.js 설치

### NVM을 통한 Node.js 설치 (권장)
```bash
# NVM 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 셸 재시작 또는 소스 로드
source ~/.bashrc

# Node.js 18 LTS 설치
nvm install 18
nvm use 18
nvm alias default 18

# 설치 확인
node --version
npm --version
```

### 대안: 패키지 매니저로 설치
```bash
# Node.js 18.x 저장소 추가
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Node.js 설치
sudo dnf install -y nodejs

# 설치 확인
node --version
npm --version
```

## PostgreSQL 설치 및 설정

### PostgreSQL 설치
```bash
# PostgreSQL 15 설치
sudo dnf install -y postgresql15-server postgresql15

# PostgreSQL 데이터베이스 초기화
sudo postgresql-setup --initdb

# PostgreSQL 서비스 시작 및 부팅 시 자동 시작 설정
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 서비스 상태 확인
sudo systemctl status postgresql
```

### PostgreSQL 설정

#### 데이터베이스 사용자 생성
```bash
# PostgreSQL 관리자로 전환
sudo -u postgres psql

# PostgreSQL 콘솔에서 실행
CREATE USER statusrpg WITH PASSWORD 'your_secure_password';
CREATE DATABASE statusrpg_db OWNER statusrpg;
GRANT ALL PRIVILEGES ON DATABASE statusrpg_db TO statusrpg;

# 확장 설정 (필요한 경우)
\c statusrpg_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# 종료
\q
```

#### PostgreSQL 접근 설정
```bash
# pg_hba.conf 편집
sudo vim /var/lib/pgsql/data/pg_hba.conf

# 다음 줄 추가 (local 연결 허용)
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   statusrpg_db    statusrpg                               md5
host    statusrpg_db    statusrpg       127.0.0.1/32            md5
host    statusrpg_db    statusrpg       ::1/128                 md5
```

#### PostgreSQL 네트워크 설정
```bash
# postgresql.conf 편집
sudo vim /var/lib/pgsql/data/postgresql.conf

# 다음 줄 수정
listen_addresses = 'localhost'  # 또는 '*' (외부 접근 허용 시)
port = 5432
max_connections = 100
shared_buffers = 128MB
```

#### PostgreSQL 재시작
```bash
sudo systemctl restart postgresql
```

### 연결 테스트
```bash
# 데이터베이스 연결 테스트
psql -h localhost -U statusrpg -d statusrpg_db

# 성공 시 PostgreSQL 프롬프트 표시
statusrpg_db=> \q
```

## 애플리케이션 배포

### Git을 통한 소스 코드 배포
```bash
# 애플리케이션 디렉토리 생성
sudo mkdir -p /opt/statusrpg
sudo chown ec2-user:ec2-user /opt/statusrpg
cd /opt/statusrpg

# Git 저장소 클론 (실제 저장소 URL로 변경)
git clone https://github.com/your-username/status-rpg-ai.git .

# 또는 압축 파일 업로드 후 압축 해제
# scp -i your-key.pem statusrpg.tar.gz ec2-user@your-ec2-ip:/opt/statusrpg/
# tar -xzf statusrpg.tar.gz
```

### 의존성 설치
```bash
# 프로젝트 디렉토리로 이동
cd /opt/statusrpg

# NPM 의존성 설치
npm install

# 프로덕션 빌드
npm run build
```

## 환경 변수 설정

### .env 파일 생성
```bash
# 환경 변수 파일 생성
vim /opt/statusrpg/.env
```

### .env 파일 내용
```env
# 데이터베이스 설정
DATABASE_URL=postgresql://statusrpg:your_secure_password@localhost:5432/statusrpg_db

# AWS Bedrock 설정
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1

# 애플리케이션 설정
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_very_long_random_session_secret_at_least_32_characters

# 보안 설정 (프로덕션 환경)
SECURE_COOKIES=true
TRUST_PROXY=true
```

### 환경 변수 파일 보안
```bash
# 파일 권한 설정 (소유자만 읽기/쓰기)
chmod 600 /opt/statusrpg/.env

# 소유자 확인
chown ec2-user:ec2-user /opt/statusrpg/.env
```

## 데이터베이스 초기화

### 스키마 적용
```bash
cd /opt/statusrpg

# 데이터베이스 스키마 적용
npm run db:push

# 성공 시 다음과 같은 메시지 출력
# "✓ Your database is now in sync with your schema"
```

### 데이터베이스 연결 확인
```bash
# 환경 변수 로드 후 연결 테스트
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('DB 연결 실패:', err);
  else console.log('DB 연결 성공:', res.rows[0]);
  process.exit(0);
});
"
```

## 애플리케이션 실행

### 개발 모드 테스트
```bash
cd /opt/statusrpg

# 개발 모드로 실행 (테스트용)
npm run dev

# 브라우저에서 http://your-ec2-public-ip:5000 접속 테스트
# Ctrl+C로 종료
```

### 프로덕션 모드 실행
```bash
cd /opt/statusrpg

# 프로덕션 빌드
npm run build

# 프로덕션 모드 실행
NODE_ENV=production npm start
```

## 프로세스 관리

### PM2를 이용한 프로세스 관리 (권장)

#### PM2 설치
```bash
# PM2 전역 설치
npm install -g pm2
```

#### PM2 설정 파일 생성
```bash
# ecosystem.config.js 파일 생성
cat > /opt/statusrpg/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'status-rpg-ai',
    script: 'server/index.js',
    cwd: '/opt/statusrpg',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/statusrpg-error.log',
    out_file: '/var/log/pm2/statusrpg-out.log',
    log_file: '/var/log/pm2/statusrpg-combined.log',
    time: true,
    max_memory_restart: '500M',
    restart_delay: 4000,
    watch: false,
    autorestart: true
  }]
};
EOF
```

#### 로그 디렉토리 생성
```bash
sudo mkdir -p /var/log/pm2
sudo chown ec2-user:ec2-user /var/log/pm2
```

#### PM2로 애플리케이션 실행
```bash
cd /opt/statusrpg

# PM2로 애플리케이션 시작
pm2 start ecosystem.config.js --env production

# PM2 프로세스 목록 확인
pm2 list

# 로그 확인
pm2 logs status-rpg-ai

# PM2 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

### systemd 서비스 생성 (대안)
```bash
# systemd 서비스 파일 생성
sudo tee /etc/systemd/system/statusrpg.service > /dev/null << 'EOF'
[Unit]
Description=Status RPG AI Application
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/statusrpg
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000
EnvironmentFile=/opt/statusrpg/.env

# 로그 설정
StandardOutput=journal
StandardError=journal
SyslogIdentifier=statusrpg

[Install]
WantedBy=multi-user.target
EOF

# 서비스 활성화 및 시작
sudo systemctl daemon-reload
sudo systemctl enable statusrpg
sudo systemctl start statusrpg

# 서비스 상태 확인
sudo systemctl status statusrpg

# 로그 확인
sudo journalctl -u statusrpg -f
```

## 보안 설정

### 방화벽 설정
```bash
# firewalld 설치 및 활성화
sudo dnf install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 필요한 포트 허용
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=5000/tcp

# 설정 적용
sudo firewall-cmd --reload

# 설정 확인
sudo firewall-cmd --list-all
```

### Nginx 리버스 프록시 설정 (선택사항)
```bash
# Nginx 설치
sudo dnf install -y nginx

# Nginx 설정 파일 생성
sudo tee /etc/nginx/conf.d/statusrpg.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # 실제 도메인으로 변경

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Nginx 시작 및 활성화
sudo systemctl start nginx
sudo systemctl enable nginx

# 설정 테스트
sudo nginx -t
```

### SSL/TLS 설정 (Let's Encrypt)
```bash
# Certbot 설치
sudo dnf install -y certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo crontab -e
# 다음 줄 추가:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 문제 해결

### 일반적인 문제들

#### 1. 데이터베이스 연결 실패
```bash
# PostgreSQL 서비스 상태 확인
sudo systemctl status postgresql

# 연결 설정 확인
sudo -u postgres psql -c "\du"
sudo -u postgres psql -c "\l"

# 포트 확인
sudo netstat -tlnp | grep 5432

# 로그 확인
sudo tail -f /var/lib/pgsql/data/log/postgresql-*.log
```

#### 2. Node.js 애플리케이션 오류
```bash
# PM2 로그 확인
pm2 logs status-rpg-ai

# 또는 systemd 로그 확인
sudo journalctl -u statusrpg -f

# 애플리케이션 재시작
pm2 restart status-rpg-ai
# 또는
sudo systemctl restart statusrpg
```

#### 3. 포트 충돌
```bash
# 포트 사용 현황 확인
sudo netstat -tlnp | grep :5000
sudo lsof -i :5000

# 프로세스 종료 (필요시)
sudo kill -9 <PID>
```

#### 4. 메모리 부족
```bash
# 메모리 사용량 확인
free -h
htop

# swap 파일 생성 (필요시)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 영구적 swap 설정
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 로그 위치
- **PM2 로그**: `/var/log/pm2/`
- **systemd 로그**: `sudo journalctl -u statusrpg`
- **PostgreSQL 로그**: `/var/lib/pgsql/data/log/`
- **Nginx 로그**: `/var/log/nginx/`

### 유용한 명령어
```bash
# 시스템 리소스 모니터링
htop
iostat -x 1
df -h

# 네트워크 연결 확인
netstat -tlnp
ss -tlnp

# 프로세스 확인
ps aux | grep node
ps aux | grep postgres

# 서비스 상태 확인
sudo systemctl status postgresql
sudo systemctl status statusrpg
sudo systemctl status nginx
```

## 배포 후 체크리스트

1. ✅ 데이터베이스 연결 확인
2. ✅ 애플리케이션 정상 실행 확인
3. ✅ 웹 인터페이스 접속 테스트
4. ✅ 회원가입/로그인 기능 테스트
5. ✅ 캐릭터 생성 기능 테스트
6. ✅ 퀘스트 생성/완료 기능 테스트
7. ✅ AI 분석 기능 테스트 (AWS 자격증명 필요)
8. ✅ PM2/systemd 자동 재시작 테스트
9. ✅ 로그 파일 생성 확인
10. ✅ 보안 설정 점검

이 가이드를 따라 설정하면 Amazon EC2에서 Status RPG AI 애플리케이션을 안정적으로 운영할 수 있습니다.