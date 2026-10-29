import logging
import os
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
from telegram import (
	BotCommand,
	InlineKeyboardButton,
	InlineKeyboardMarkup,
	MenuButtonWebApp,
	Update,
	WebAppInfo,
)
from telegram.ext import Application, CommandHandler, ContextTypes


SITE_ROOT = Path(__file__).resolve().parent
load_dotenv(SITE_ROOT / ".env")

logging.basicConfig(
	level=os.getenv("LOG_LEVEL", "INFO"),
	format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("ksusha-mini-app")

DEFAULT_WEB_APP_URL = "https://sandex1.github.io/sandex_bot/sute.html"


async def open_mini_app(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
	message = update.effective_message
	if message is None:
		return

	if update.effective_chat and update.effective_chat.type != "private":
		await message.reply_text("Открой личный чат со мной и отправь /start 🌸")
		return

	web_app_url = context.bot_data["web_app_url"]
	keyboard = InlineKeyboardMarkup(
		[[InlineKeyboardButton(
			text="🌸 Открыть Ксюшу",
			web_app=WebAppInfo(url=web_app_url),
		)]]
	)
	await message.reply_text(
		"Ксюша — топ-1 🌸\nОткрой мини-приложение: там фото, факты и лепестки.",
		reply_markup=keyboard,
	)


async def configure_bot(application: Application) -> None:
	web_app_url = application.bot_data["web_app_url"]
	await application.bot.set_chat_menu_button(
		menu_button=MenuButtonWebApp(
			text="Ксюша",
			web_app=WebAppInfo(url=web_app_url),
		)
	)
	await application.bot.set_my_commands([
		BotCommand("start", "Открыть Ксюшу"),
		BotCommand("app", "Открыть мини-приложение"),
	])
	logger.info("Mini App URL: %s", web_app_url)


def create_telegram_application(token: str, web_app_url: str) -> Application:
	application = Application.builder().token(token).post_init(configure_bot).build()
	application.bot_data["web_app_url"] = web_app_url
	application.add_handler(CommandHandler(["start", "app"], open_mini_app))
	return application


def main() -> None:
	token = os.getenv("BOT_TOKEN", "").strip()
	if not token or token == "PASTE_TOKEN_FROM_BOTFATHER_HERE":
		raise SystemExit("Вставь токен бота в BOT_TOKEN в файле .env")

	web_app_url = os.getenv("WEBAPP_URL", DEFAULT_WEB_APP_URL).strip()
	parsed_url = urlparse(web_app_url)
	if parsed_url.scheme != "https" or not parsed_url.netloc:
		raise SystemExit("WEBAPP_URL должен быть публичным HTTPS-адресом")

	application = create_telegram_application(token, web_app_url)
	logger.info("Запускаю бота. Для остановки нажми Ctrl+C.")
	application.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
	main()