# GitHub Release Notification API

Сервіс для підписки на email-сповіщення про нові релізи GitHub репозиторіїв.

---

## Опис

Додаток дозволяє користувачам підписатися на конкретний GitHub репозиторій (`owner/repo`) та отримувати email, коли з’являється новий release.

Реалізовано:
- підписка з підтвердженням через email
- відписка через токен
- отримання списку підписок
- автоматична перевірка нових релізів
- надсилання повідомлень при появі нового релізу

---

## Архітектура

Проєкт побудований як моноліт із розділенням відповідальностей (Clean Architecture light):

- **controllers** — приймають HTTP-запити
- **use-cases** — бізнес-логіка
- **repositories** — робота з базою
- **services** — зовнішні інтеграції (GitHub, email)
- **jobs** — планувальник (scanner)

Структура:


src/
application/
controllers/
use-cases/
domain/
repositories/
infrastructure/
db/
models/
repositories/
services/
presentation/
routes/
middlewares/
jobs/
shared/
app.js
server.js


---

## Як працює

1. Користувач підписується через API
2. Отримує email із токеном підтвердження
3. Після підтвердження підписка стає активною
4. Scheduler регулярно перевіряє нові релізи
5. Якщо з’являється новий release → надсилається email

### Важлива логіка

- зберігається `last_seen_tag` для кожного repo
- якщо тег не змінився → email не надсилається
- якщо це перша перевірка (`last_seen_tag = null`) → просто ініціалізація без email

---

## API

- `POST /api/subscribe`
- `GET /api/confirm/{token}`
- `GET /api/unsubscribe/{token}`
- `GET /api/subscriptions?email=...`

---

## Запуск

### 1. Встановлення залежностей


npm install


### 2. Запуск MongoDB (через Docker)


docker-compose up -d


### 3. Запуск сервера


npm run dev


---

## Environment Variables


PORT=3000
BASE_URL=http://localhost:3000

MONGO_URI=mongodb://localhost:27017/subscription_service

EMAIL_HOST=smtp.mailosaur.net
EMAIL_PORT=465
EMAIL_USER=...
EMAIL_PASS=...

GITHUB_TOKEN=

RELEASE_SCAN_CRON=*/10 * * * *


---

## Mailosaur

Для тестування email використовується Mailosaur.

Це сервіс, який дозволяє отримувати листи без реальної пошти.  
Листи надсилаються на адреси виду:


anything@<server-id>.mailosaur.net


і переглядаються через інтерфейс Mailosaur.

---

## Scanner

Використовується `node-schedule` для періодичної перевірки релізів.


RELEASE_SCAN_CRON=*/10 * * * *


Для тестування можна поставити:


*/1 * * * *


---

## GitHub Releases

Сервіс працює тільки з **GitHub Releases**, а не з tags.

Якщо в репозиторії немає release — повідомлення не надсилаються.

---

## Тести

Покрито unit-тестами бізнес-логіку:


npm test


---

## Особливості

- Express (без heavy framework)
- MongoDB
- Docker
- Scheduler
- Email notifications
- Обробка rate limit GitHub API