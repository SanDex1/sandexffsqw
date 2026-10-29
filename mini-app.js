(() => {
	const webApp = window.Telegram?.WebApp;
	if (!webApp) return;

	webApp.ready();
	webApp.expand();
	const supportsV61 = typeof webApp.isVersionAtLeast === "function" && webApp.isVersionAtLeast("6.1");
	if (supportsV61) {
		webApp.setHeaderColor("#1b1019");
		webApp.setBackgroundColor("#1b1019");
	}

	const isHome = /(?:^|\/)sute\.html$/.test(window.location.pathname);
	if (supportsV61 && !isHome && webApp.BackButton) {
		webApp.BackButton.show();
		webApp.onEvent("backButtonClicked", () => {
			window.location.href = "sute.html";
		});
	} else if (supportsV61 && webApp.BackButton) {
		webApp.BackButton.hide();
	}

	if (supportsV61 && webApp.HapticFeedback) {
		document.querySelectorAll(".mini-tab").forEach((tab) => {
			tab.addEventListener("click", () => webApp.HapticFeedback.impactOccurred("soft"));
		});
	}
})();