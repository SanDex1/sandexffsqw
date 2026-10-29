(() => {
	const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (!finePointer || reducedMotion) return;

	const follower = document.createElement("div");
	follower.className = "cursor-follower";
	follower.setAttribute("aria-hidden", "true");
	document.body.append(follower);

	let targetX = 0;
	let targetY = 0;
	let currentX = 0;
	let currentY = 0;
	let animationFrame = 0;
	let hasPointerPosition = false;

	const animateFollower = () => {
		currentX += (targetX - currentX) * 0.2;
		currentY += (targetY - currentY) * 0.2;
		follower.style.left = `${currentX}px`;
		follower.style.top = `${currentY}px`;

		if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
			animationFrame = requestAnimationFrame(animateFollower);
		} else {
			animationFrame = 0;
		}
	};

	window.addEventListener("pointermove", (event) => {
		targetX = event.clientX;
		targetY = event.clientY;
		if (!hasPointerPosition) {
			currentX = targetX;
			currentY = targetY;
			hasPointerPosition = true;
			follower.classList.add("is-visible");
		}
		if (!animationFrame) animationFrame = requestAnimationFrame(animateFollower);

		const target = event.target instanceof Element ? event.target.closest("a, button, [role='button']") : null;
		follower.classList.toggle("is-hovering", Boolean(target));
	}, { passive: true });

	window.addEventListener("pointerout", (event) => {
		if (!event.relatedTarget) follower.classList.remove("is-visible");
	}, { passive: true });

	const hero = document.querySelector(".hero-visual");
	if (hero) {
		hero.addEventListener("pointermove", (event) => {
			const bounds = hero.getBoundingClientRect();
			const x = (event.clientX - bounds.left) / bounds.width;
			const y = (event.clientY - bounds.top) / bounds.height;
			hero.style.setProperty("--tilt-x", `${((0.5 - x) * 4).toFixed(2)}deg`);
			hero.style.setProperty("--tilt-y", `${((y - 0.5) * 3).toFixed(2)}deg`);
		}, { passive: true });
		hero.addEventListener("pointerleave", () => {
			hero.style.setProperty("--tilt-x", "0deg");
			hero.style.setProperty("--tilt-y", "0deg");
		});
	}
})();