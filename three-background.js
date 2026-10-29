(() => {
	if (!window.THREE || !window.WebGLRenderingContext) return;

	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const canvas = document.createElement("canvas");
	canvas.className = "three-background-canvas";
	canvas.setAttribute("aria-hidden", "true");
	document.body.prepend(canvas);

	let renderer;
	try {
		renderer = new THREE.WebGLRenderer({
			canvas,
			alpha: true,
			antialias: false,
			powerPreference: "low-power"
		});
	} catch {
		canvas.remove();
		return;
	}

	renderer.setClearColor(0x000000, 0);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
	renderer.setSize(window.innerWidth, window.innerHeight);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 150);
	camera.position.set(0, 12, 23);
	camera.lookAt(0, 0, -22);
	scene.add(camera);

	const world = new THREE.Group();
	scene.add(world);

	const columns = 58;
	const rows = 54;
	const width = 92;
	const depth = 82;
	const positions = [];
	const colors = [];
	const rose = new THREE.Color(0xff5f9e);
	const blush = new THREE.Color(0xffc6dc);
	const gold = new THREE.Color(0xf4d18a);
	const addVertex = (x, z) => {
		positions.push(x, 0, z);
		const blend = THREE.MathUtils.clamp((x / width + 0.5) * 0.78 + (z / -depth) * 0.22, 0, 1);
		const color = blush.clone().lerp(rose, blend);
		colors.push(color.r, color.g, color.b);
	};

	for (let row = 0; row <= rows; row++) {
		const z = 8 - (row / rows) * depth;
		for (let column = 0; column < columns; column++) {
			const x1 = -width / 2 + (column / columns) * width;
			const x2 = -width / 2 + ((column + 1) / columns) * width;
			addVertex(x1, z);
			addVertex(x2, z);
		}
	}
	for (let column = 0; column <= columns; column++) {
		const x = -width / 2 + (column / columns) * width;
		for (let row = 0; row < rows; row++) {
			const z1 = 8 - (row / rows) * depth;
			const z2 = 8 - ((row + 1) / rows) * depth;
			addVertex(x, z1);
			addVertex(x, z2);
		}
	}

	const gridGeometry = new THREE.BufferGeometry();
	gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	gridGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
	const grid = new THREE.LineSegments(gridGeometry, new THREE.LineBasicMaterial({
		vertexColors: true,
		transparent: true,
		opacity: 0.19,
		depthWrite: false,
		blending: THREE.AdditiveBlending
	}));
	grid.position.y = -4.5;
	world.add(grid);

	const hologram = new THREE.Group();
	hologram.position.set(17, 4, -24);
	world.add(hologram);
	const core = new THREE.Mesh(
		new THREE.IcosahedronGeometry(4.2, 1),
		new THREE.MeshBasicMaterial({ color: rose, wireframe: true, transparent: true, opacity: 0.2 })
	);
	hologram.add(core);
	const ringMaterial = new THREE.MeshBasicMaterial({
		color: blush,
		transparent: true,
		opacity: 0.25,
		side: THREE.DoubleSide,
		blending: THREE.AdditiveBlending,
		depthWrite: false
	});
	const ringOne = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.035, 4, 120), ringMaterial);
	ringOne.rotation.set(0.9, 0.3, 0.15);
	hologram.add(ringOne);
	const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(6.7, 0.025, 4, 120), ringMaterial.clone());
	ringTwo.material.color.set(gold);
	ringTwo.rotation.set(1.15, -0.5, 0.45);
	hologram.add(ringTwo);

	const petalShape = new THREE.Shape();
	petalShape.moveTo(0, 0);
	petalShape.bezierCurveTo(-0.2, 0.12, -0.3, 0.48, 0, 0.82);
	petalShape.bezierCurveTo(0.3, 0.48, 0.2, 0.12, 0, 0);
	const petalGeometry = new THREE.ShapeGeometry(petalShape, 12);
	const petalColors = [0xff77ae, 0xffc1d8, 0xff8fbd, 0xf4d18a];
	const petalMaterials = petalColors.map((color) => new THREE.MeshBasicMaterial({
		color,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.68,
		depthWrite: false
	}));
	const petalField = new THREE.Group();
	petalField.position.z = -13;
	camera.add(petalField);
	const petalHeight = 2 * 13 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
	const petals = [];
	for (let index = 0; index < 30; index++) {
		const petal = new THREE.Mesh(petalGeometry, petalMaterials[index % petalMaterials.length]);
		petal.scale.setScalar(0.45 + Math.random() * 0.8);
		petal.position.set(
			(Math.random() - 0.5) * petalHeight * camera.aspect,
			(Math.random() - 0.5) * petalHeight,
			(Math.random() - 0.5) * 5
		);
		petal.rotation.set(Math.random() * 1.2, Math.random() * 1.2, Math.random() * Math.PI);
		petal.userData = { fall: 0.25 + Math.random() * 0.55, sway: Math.random() * 1.5 + 0.35, phase: Math.random() * Math.PI * 2 };
		petalField.add(petal);
		petals.push(petal);
	}

	let targetX = 0;
	let targetY = 0;
	let pointerX = 0;
	let pointerY = 0;
	let frame = 0;
	let lastFrame = 0;
	const basePositions = gridGeometry.attributes.position.array.slice();

	const movePointer = (event) => {
		targetX = (event.clientX / window.innerWidth - 0.5) * 2;
		targetY = (event.clientY / window.innerHeight - 0.5) * 2;
	};
	window.addEventListener("pointermove", movePointer, { passive: true });
	window.addEventListener("pointerleave", () => {
		targetX = 0;
		targetY = 0;
	}, { passive: true });
	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}, { passive: true });

	const render = (time = 0) => {
		if (document.hidden) {
			frame = 0;
			return;
		}
		if (!reducedMotion && time - lastFrame < 33) {
			frame = requestAnimationFrame(render);
			return;
		}
		lastFrame = time;
		const seconds = time * 0.001;
		pointerX += (targetX - pointerX) * 0.045;
		pointerY += (targetY - pointerY) * 0.045;
		world.rotation.y = pointerX * 0.055;
		world.rotation.x = pointerY * -0.018;
		world.position.x = pointerX * -0.9;
		hologram.rotation.y = seconds * 0.12 + pointerX * 0.16;
		hologram.rotation.x = Math.sin(seconds * 0.3) * 0.08 + pointerY * 0.08;
		ringTwo.rotation.z = seconds * 0.08;
		petalField.rotation.z = pointerX * 0.035;
		const viewWidth = petalHeight * camera.aspect;
		for (const petal of petals) {
			petal.position.y -= petal.userData.fall * 0.018;
			petal.position.x += Math.sin(seconds * petal.userData.sway + petal.userData.phase) * 0.0025 + pointerX * 0.002;
			petal.rotation.z += 0.002 * petal.userData.sway;
			petal.rotation.x += 0.0007 * petal.userData.sway;
			if (petal.position.y < -petalHeight / 2 - 1) {
				petal.position.y = petalHeight / 2 + 1;
				petal.position.x = (Math.random() - 0.5) * viewWidth;
			}
		}

		const positionAttribute = gridGeometry.attributes.position;
		for (let index = 0; index < basePositions.length; index += 3) {
			const x = basePositions[index];
			const z = basePositions[index + 2];
			positionAttribute.array[index + 1] =
				Math.sin(x * 0.16 + seconds * 0.48) * 0.34 +
				Math.cos(z * 0.17 - seconds * 0.38) * 0.42 +
				Math.sin((x + z) * 0.08 + seconds * 0.55) * 0.2;
		}
		positionAttribute.needsUpdate = true;
		renderer.render(scene, camera);
		if (!reducedMotion) frame = requestAnimationFrame(render);
	};

	document.addEventListener("visibilitychange", () => {
		if (!document.hidden && !reducedMotion && !frame) frame = requestAnimationFrame(render);
	});
	if (reducedMotion) render();
	else frame = requestAnimationFrame(render);
})();