# Panduan Instalasi
## Install Node Js dan npm

```
sudo apt install nodejs npm
```

## Install yarn
```
npm install --global yarn
```
## Install nest
```
npm i -g @nestjs/cli
```

## Instalasi Aplikasi
### Package
```
yarn install
```

### Running Aplikasi

```
yarn run start:local  // untuk local
yarn run start:dev    // untuk development
yarn run start:prod   // untuk production
```

#### Build Aplikasi
Sebelum melakukan build pada aplikasi set environment, create file .env isi dengan :
```
PORT=3000
CLIENT_ID=fe19c663-241d-4283-bdcb-c1838f9e9578
DARBELINK_URL=https://api-dev.internaldarbegroup.com
```
Lalu lakukan :
```
sudo yarn run build
```

#### Environment

terdapat beberapa file environment, dengan value variable yang berbeda : 
1. .env.development
2. .env.development.local
3. .env.production (di gunakan ketika yarn run start:prod)
4. .env (di gunakan ketika yarn run build)

Running aplikasi setelah build :
```
pm2 start dist\main.js
```