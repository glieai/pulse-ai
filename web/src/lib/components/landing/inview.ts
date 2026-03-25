/** Svelte action: adds scroll-reveal animation via IntersectionObserver */
export function inview(
	node: HTMLElement,
	options?: { threshold?: number; once?: boolean; delay?: number },
) {
	const { threshold = 0.15, once = true, delay = 0 } = options ?? {};

	node.classList.add("landing-hidden");

	let timer: ReturnType<typeof setTimeout> | undefined;

	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				const reveal = () => {
					node.classList.remove("landing-hidden");
					node.classList.add("landing-visible");
				};

				if (delay > 0) {
					timer = setTimeout(reveal, delay);
				} else {
					reveal();
				}

				if (once) observer.unobserve(node);
			}
		},
		{ threshold },
	);

	observer.observe(node);

	return {
		destroy() {
			if (timer) clearTimeout(timer);
			observer.disconnect();
		},
	};
}
