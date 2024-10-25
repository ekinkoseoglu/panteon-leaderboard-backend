Apologies for the oversight. Here is the updated README file with the installation instructions removed:

---

# Panteon Leaderboard

Bu proje, oyun içi liderlik tablosu (Leaderboard) sistemini yönetmek için geliştirilmiştir. Her hafta, tabloya giren ilk 100 oyuncu, kazanılan sanal para birimlerine göre sıralanır ve bu oyuncular arasındaki ödül havuzu dağıtılır. Liderlik tablosundaki oyuncular, sıralamalarına göre haftalık ödül havuzundan pay alır. İlk 3 oyuncu özel bir yüzdeyle ödüllendirilirken, geri kalan oyuncular sıralamadaki konumlarına göre kalan ödülü paylaşır. Sistem, Redis ile hızlı sıralama işlemleri yapar ve veritabanı yönetimi için MySQL kullanır.

-**Oyuncu Araması**: Bir oyun içinde birden fazla aynı isimde oyuncu olabilme ihtimali olduğu için oyuncu araması ID üzerinden gerçekleşmektedir. Lütfen arayacağınız oyuncunun numarası yerine idsini arayın.

## Gereksinimler

- [Node.js](https://nodejs.org/) (17.x veya üzeri)
- [MySQL](https://www.mysql.com/)
- [Redis](https://redis.io/)

## Kullanım ve APIlar

REST API'leri kullanmak için [Postman](https://www.postman.com/) veya benzeri bir araç kullanabilirsiniz. Postman Koleksiyonu aşağıdaki gibidir:

```json
{
	"info": {
		"_postman_id": "a64a8eda-1f91-4367-9d9e-92f809aa3977",
		"name": "Panteon Case",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
		"_exporter_id": "31888251"
	},
	"item": [
		{
			"name": "Search Player By ID",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "http://localhost:3000/leaderboard?playerId=136",
					"protocol": "http",
					"host": [
						"localhost"
					],
					"port": "3000",
					"path": [
						"leaderboard"
					],
					"query": [
						{
							"key": "playerId",
							"value": "136"
						}
					]
				}
			},
			"response": []
		},
		{
			"name": "Leaderboard",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "http://localhost:3000/leaderboard",
					"protocol": "http",
					"host": [
						"localhost"
					],
					"port": "3000",
					"path": [
						"leaderboard"
					]
				}
			},
			"response": []
		},
		{
			"name": "NextWeek",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "http://localhost:3000/leaderboard/nextWeek",
					"protocol": "http",
					"host": [
						"localhost"
					],
					"port": "3000",
					"path": [
						"leaderboard",
						"nextWeek"
					]
				}
			},
			"response": []
		},
		{
			"name": "Delete Records on Redis",
			"request": {
				"method": "POST",
				"header": [],
				"body": {
					"mode": "raw",
					"raw": "",
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "http://localhost:3000/leaderboard/load-players",
					"protocol": "http",
					"host": [
						"localhost"
					],
					"port": "3000",
					"path": [
						"leaderboard",
						"load-players"
					]
				}
			},
			"response": []
		},
		{
			"name": "Distribute Prize",
			"request": {
				"method": "POST",
				"header": [],
				"body": {
					"mode": "raw",
					"raw": "",
					"options": {
						"raw": {
							"language": "json"
						}
					}
				},
				"url": {
					"raw": "http://localhost:3000/leaderboard/load-players",
					"protocol": "http",
					"host": [
						"localhost"
					],
					"port": "3000",
					"path": [
						"leaderboard",
						"load-players"
					]
				}
			},
			"response": []
		}
	]
}
```

Tarayıcı üzerinden `https://panteon-leaderboard-frontend-production.up.railway.app` adresine giderek uygulamanızı test edebilirsiniz.

## Katkıda Bulunma

Projeye katkıda bulunmak istiyorsanız, bir "issue" açarak tartışmalara katılabilir veya bir "pull request" göndererek önerilerinizi sunabilirsiniz.
