# Ксюша Mini App Bot

Бот открывает мини-приложение с GitHub Pages через кнопку в чате и кнопку меню. Render и локальный веб-сервер не нужны.

## Настройка

1. Создай бота через `@BotFather` командой `/newbot` и скопируй токен.
2. Установи зависимости из папки проекта:

   ```powershell
   python -m pip install -r requirements.txt
   ```

3. Создай локальный файл `.env` из шаблона и открой его:

   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```

4. Вставь токен вместо `PASTE_TOKEN_FROM_BOTFATHER_HERE`. Ссылка на Mini App уже заполнена. `.env` исключён из Git.

## Запуск

```powershell
python bot.py
```

Открой своего бота в Telegram и отправь `/start`. Команда `/app` и кнопка меню тоже открывают мини-приложение. Оставь окно PowerShell запущенным, пока бот нужен; для остановки нажми `Ctrl+C`.

Для постоянной работы компьютер должен быть включён и подключён к интернету. GitHub Pages уже хостит сайт по адресу `https://sandex1.github.io/sandex_bot/sute.html`.