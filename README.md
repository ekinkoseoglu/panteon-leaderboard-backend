# Panteon Leaderboard


Bu proje, oyun içi liderlik tablosu (Leaderboard) sistemini yönetmek için geliştirilmiştir. Her hafta, tabloya giren ilk 100 oyuncu, kazanılan sanal para birimlerine göre sıralanır ve bu oyuncular arasındaki ödül havuzu dağıtılır. Liderlik tablosundaki oyuncular, sıralamalarına göre haftalık ödül havuzundan pay alır. İlk 3 oyuncu özel bir yüzdeyle ödüllendirilirken, geri kalan oyuncular sıralamadaki konumlarına göre kalan ödülü paylaşır. Sistem, Redis ile hızlı sıralama işlemleri yapar ve veritabanı yönetimi için MySQL kullanır. 

## Gereksinimler


- [Node.js](https://nodejs.org/) (17.x veya üzeri)
- [MySQL](https://www.mysql.com/)
- [Redis](https://redis.io/)


## Kurulum


### 1. Projeyi Klonlayın


Öncelikle, projeyi GitHub'dan klonlayın:


```bash
git clone https://github.com/yourusername/panteon-leaderboard.git
cd panteon-leaderboard
```


### 2. Gerekli Paketleri Yükleyin


Projenin bağımlılıklarını yüklemek için:


```bash
npm install
```


### 3. Veritabanını Kurun


#### 3.1. MySQL Kurulumu


Veritabanı için MySQL'i kullanacağız.


1. MySQL'i kurun ve çalıştırın.
2. Bir veritabanı oluşturun:


   ```sql
   CREATE DATABASE patreoncase;
   ```


#### 3.2. SQL Dump Dosyasını İçe Aktarın


Veritabanını oluşturduktan sonra, projede verilen SQL dump dosyasını içe aktarın:


```bash
mysql -u root -p patreoncase < patreoncase.sql
```


### 4. Redis'i Çalıştırın


Proje Redis kullanmaktadır. Redis'i sisteminizde çalıştırmak için aşağıdaki adımları izleyin:


#### 4.1. Redis Kurulumu


Redis'i yükleyip başlatın:


Ubuntu:
```bash
sudo apt update
sudo apt install redis-server
sudo service redis start
```


MacOS (Homebrew kullanarak):
```bash
brew install redis
brew services start redis
```


Windows:
Windows için Redis'i [buradan](https://github.com/microsoftarchive/redis/releases) indirebilirsiniz. Redis'i indirin ve başlatın.


#### 4.2. Redis Kontrolü


Redis'in çalıştığını doğrulamak için:


```bash
redis-cli ping
```


`PONG` cevabını almanız gerekmektedir.


### 5. Ortam Değişkenlerini Ayarlayın


Proje kök dizininde `.env` dosyasını oluşturup aşağıdaki gibi ayarlayın:


```env
DATABASE_URL="mysql://root:@localhost:3306/patreoncase"
REDIS_URL="redis://localhost:6379"
```


### 6. Prisma Client'ı Oluşturun


Prisma client'ı oluşturmak için:


```bash
npx prisma generate
```


### 7. Uygulamayı Başlatın


Uygulamayı başlatmak için:


```bash
npm run start
```


Uygulama, `http://localhost:3000` adresinde çalışacaktır.


## Kullanım


- REST API'leri kullanmak için [Postman](https://www.postman.com/) veya benzeri bir araç kullanabilirsiniz.
- Tarayıcı üzerinden `http://localhost:3000` adresine giderek uygulamanızı test edebilirsiniz.


## Katkıda Bulunma


Projeye katkıda bulunmak istiyorsanız, bir "issue" açarak tartışmalara katılabilir veya bir "pull request" göndererek önerilerinizi sunabilirsiniz.
