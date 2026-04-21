# Ubuntu 构建机（网页 + APK）部署指南

本项目前端为 Next.js（`output: 'export'` 静态导出）+ Capacitor Android。

你希望 Ubuntu 同时作为：
- 构建机：生成网页端静态产物 `out/`、生成 Android APK
- 部署机：用 Nginx 托管 `out/`（可选）

---

## 1. 传输/拉取代码（推荐方式）

### 方式 A（推荐）：Ubuntu 直接 git clone（最省流）
```bash
git clone <你的仓库地址>
cd ogbo-web3-app-master/frontend
```

### 方式 B：从本地传 zip/tar（不要带缓存）
只需要传源码与 Android 工程，不需要传下面这些目录：
- `frontend/node_modules/`
- `frontend/.next/`
- `frontend/out/`
- `frontend/android/.gradle/`
- `frontend/android/app/build/`
- `frontend/android/app/src/main/assets/public/`
- `frontend/.env`

---

## 2. Ubuntu 安装依赖（Node + JDK + Android SDK）

### 2.1 Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

### 2.2 JDK 17（用于 Android 构建）
```bash
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk
java -version
```

### 2.3 Android SDK Command Line Tools（必要）
建议安装到 `/opt/android-sdk`：
```bash
sudo mkdir -p /opt/android-sdk
sudo chown -R $USER:$USER /opt/android-sdk
export ANDROID_SDK_ROOT=/opt/android-sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools
```

下载 Command-line Tools（在浏览器/命令行均可），解压到：
`$ANDROID_SDK_ROOT/cmdline-tools/latest/`

然后安装平台与构建工具（按项目配置 compileSdk 35）：
```bash
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
```

---

## 3. 构建网页端（静态 out/）
```bash
cd ogbo-web3-app-master/frontend
npm install

unset BUILD_TARGET
npm run build

# 产物：frontend/out/
ls -la out
```

---

## 4. 构建 Android APK（debug）
```bash
cd ogbo-web3-app-master/frontend
npm install

export BUILD_TARGET=capacitor
npm run build
npx cap sync android

cd android
./gradlew :app:assembleDebug

# 产物：
ls -la app/build/outputs/apk/debug/app-debug.apk
```

说明：
- `npm install` 时会执行 `postinstall`，自动修复 `@capgo/capacitor-updater` 在某些 JDK 下的 Java 枚举 switch 写法，以保证可重复构建。

---

## 5. 部署网页端到 Nginx（可选）

把 `frontend/out/` 复制到 `/var/www/ogbox/`：
```bash
sudo mkdir -p /var/www/ogbox
sudo rsync -av --delete out/ /var/www/ogbox/
```

Nginx 配置示例（SPA fallback）：
```nginx
server {
  listen 80;
  server_name your-domain.com;

  root /var/www/ogbox;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

