(() => {
  const portal = document.querySelector("#portal");
  const stage = document.querySelector("#cashew-stage");
  const glow = document.querySelector("#portal-glow");
  const site = document.querySelector("#site");
  const toast = document.querySelector("#toast");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let progress = 0;
  let entered = false;
  let touchStartY = 0;

  document.body.classList.add("portal-open");

  const renderPortal = () => {
    const eased = progress * progress * (3 - 2 * progress);
    const scale = 1 + eased * 11;
    const rotate = eased * 5;
    const fade = Math.max(0, 1 - Math.max(0, progress - 0.72) / 0.28);

    stage.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
    stage.style.opacity = fade;
    glow.style.opacity = Math.min(1, progress * 2.2);
  };

  const enterSite = () => {
    if (entered) return;
    entered = true;

    progress = 1;
    renderPortal();

    window.setTimeout(() => {
      portal.classList.add("is-gone");
      site.classList.add("is-visible");
      site.setAttribute("aria-hidden", "false");
      document.body.classList.remove("portal-open");
      window.scrollTo({ top: 0, behavior: "auto" });
    }, reduceMotion ? 0 : 330);
  };

  const advance = (amount) => {
    if (entered) return;
    progress = Math.min(1, Math.max(0, progress + amount));
    renderPortal();
    if (progress >= 0.96) enterSite();
  };

  window.addEventListener("wheel", (event) => {
    if (entered) return;
    event.preventDefault();
    const direction = Math.sign(event.deltaY);
    advance(direction > 0 ? 0.075 : -0.045);
  }, { passive: false });

  portal.addEventListener("click", () => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      advance(0.26);
    } else {
      advance(0.17);
    }
  });

  portal.addEventListener("touchstart", (event) => {
    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  portal.addEventListener("touchmove", (event) => {
    const delta = touchStartY - event.touches[0].clientY;
    if (Math.abs(delta) > 8) {
      event.preventDefault();
      advance(delta > 0 ? 0.08 : -0.05);
      touchStartY = event.touches[0].clientY;
    }
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    if (entered) return;
    if (["ArrowDown", "PageDown", " ", "Enter"].includes(event.key)) {
      event.preventDefault();
      advance(0.18);
    }
    if (["ArrowUp", "PageUp", "Escape"].includes(event.key)) {
      event.preventDefault();
      advance(-0.13);
    }
  });

  const showToast = (message = "COPIED") => {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1600);
  };

  const copyContract = async (button) => {
    const ca = button.dataset.ca || "PASTE_CONTRACT_ADDRESS";
    try {
      await navigator.clipboard.writeText(ca);
      showToast("CONTRACT COPIED");
    } catch {
      showToast("COPY FAILED");
    }
  };

  document.querySelectorAll("[data-ca]").forEach((button) => {
    button.addEventListener("click", () => copyContract(button));
  });

  window.addEventListener("mousemove", (event) => {
    if (!entered || window.innerWidth < 900 || reduceMotion) return;
    const object = document.querySelector(".hero-object");
    const x = (event.clientX / window.innerWidth - 0.5) * 14;
    const y = (event.clientY / window.innerHeight - 0.5) * 12;
    object.style.transform = `translateY(calc(-47% + ${y}px)) translateX(${x}px) rotate(-5deg)`;
  });

  renderPortal();
})();
