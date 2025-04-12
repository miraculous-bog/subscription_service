# 🚀 GitHub Release Notification API

Сервіс для підписки на email-сповіщення про нові релізи GitHub репозиторіїв.

---

## 📌 Опис

Додаток дозволяє користувачам підписуватися на GitHub репозиторії (`owner/repo`) та отримувати email-сповіщення при появі нових релізів.

Сервіс спроєктований як production-ready API з підтримкою кешування, метрик та захисту доступу.

---
## 🌐 Live Demo

Сервіс задеплоєний та доступний за адресою:

👉 https://king-prawn-app-i2nsw.ondigitalocean.app/

---

## 📧 Email (SMTP)

Для тестування email використовується SMTP-сервер **Mailosaur**.

> ⚠️ Це тестовий сервіс — листи **не надсилаються на реальні email-адреси**, а доступні лише у веб-інтерфейсі Mailosaur.

Формат email-адрес:


anything@<server-id>.mailosaur.net


Це дозволяє безпечно тестувати:
- підтвердження підписки
- відписку
- повідомлення про релізи

Для продакшену можна підключити будь-який SMTP-провайдер (SendGrid, Gmail, тощо).
## ⚙️ Функціонал

- підписка на репозиторій через email
- підтвердження підписки через email (double opt-in)
- відписка через токен або через API
- отримання списку підписок користувача
- автоматичне сканування нових релізів
- надсилання email-сповіщень
- кешування відповідей GitHub API (Redis, TTL 10 хвилин)
- захист API через API key
- Prometheus-метрики сервісу

---

## 🏗 Архітектура

Проєкт побудований за принципами **Clean Architecture (light)**:

- **controllers** — обробка HTTP-запитів  
- **use-cases** — бізнес-логіка  
- **repositories** — доступ до БД  
- **services** — інтеграції (GitHub, email)  
- **jobs** — фонові задачі  
- **middlewares** — перехресна логіка (auth, metrics)
src/
application/
controllers/
use-cases/
domain/
repositories/
infrastructure/
cache/
db/
models/
repositories/
services/
metrics/
presentation/
routes/
middlewares/
jobs/
shared/
app.js
server.js


---

## 🔄 Як працює система

1. Користувач підписується через API  
2. Отримує email із токеном підтвердження  
3. Після підтвердження підписка стає активною  
4. Scheduler періодично перевіряє нові релізи GitHub  
5. При появі нового релізу:
   - перевіряється `last_seen_tag`
   - якщо тег новий → надсилається email  

---

## 🧠 Основна логіка

- `last_seen_tag` зберігається для кожного репозиторію  
- перший scan (`last_seen_tag = null`) → ініціалізація без email  
- повторні scan-и → email тільки при новому релізі  
- обробка GitHub rate limit  

---

## 🔐 API Authentication

Всі API-ендпоїнти (крім `/metrics`) захищені через API key.

Передача ключа:
x-api-key: your-api-key


---

## 📡 API

- `POST /api/subscribe`
- `GET /api/confirm/{token}`
- `GET /api/unsubscribe/{token}`
- `GET /api/subscriptions?email=...`
- `POST /api/subscriptions/unsubscribe`

### 🔹 UI-friendly unsubscribe

POST /api/subscriptions/unsubscribe


Body:

```json
{
  "email": "user@example.com",
  "repo": "facebook/react"
}
⚡ Redis Cache
кешування GitHub API
TTL: 10 хвилин
зменшує навантаження та rate limit
📊 Метрики (Prometheus)
GET /metrics

Метрики:

http_requests_total
scan_runs_total
releases_detected_total
github_api_rate_limit_total
🧪 Запуск
1. Встановлення залежностей
npm install
2. Запуск інфраструктури
docker-compose up -d

(піднімає MongoDB + Redis)

3. Запуск сервера
npm run dev
🔑 Environment Variables
PORT=3000
BASE_URL=http://localhost:3000

MONGO_URI=mongodb://localhost:27017/subscription_service

EMAIL_HOST=smtp.mailosaur.net
EMAIL_PORT=465
EMAIL_USER=...
EMAIL_PASS=...

GITHUB_TOKEN=

RELEASE_SCAN_CRON=*/10 * * * *

REDIS_URL=redis://localhost:6379

API_KEY=super-secret-key
📧 Email

Підтримуються будь-які SMTP-сервіси:

Mailosaur (для тестування)
Moosend / SendGrid / Gmail (для продакшену)
🔁 Scheduler

Cron:

RELEASE_SCAN_CRON=*/10 * * * *

Для тесту:

*/1 * * * *
🧩 GitHub Releases

Сервіс працює тільки з:

👉 GitHub Releases (не tags)

🧪 Тести
npm test
🚀 Особливості
Express (lightweight)
MongoDB + Mongoose
Redis caching
API Key authentication
Prometheus metrics
Docker
Scheduler (cron jobs)
Clean Architecture
Email notification system
📌 Примітка

Сервіс можна використовувати як:

backend API
основу для React UI клієнта

---