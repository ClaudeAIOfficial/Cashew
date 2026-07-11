document.body.classList.add("is-loading");

const loader = document.querySelector(".loader");
window.addEventListener("load", () => {
  setTimeout(() => {
    loader.classList.add("done");
    document.body.classList.remove("is-loading");
  }, 1250);
});

const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
}, { passive: true });

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
reveals.forEach((el) => observer.observe(el));

const counters = document.querySelectorAll("[data-counter]");
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const end = Number(el.dataset.counter || 0);
    const start = performance.now();
    const duration = 1200;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(end * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: .6 });
counters.forEach((el) => counterObserver.observe(el));

const parallaxEls = document.querySelectorAll("[data-parallax]");
let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;

window.addEventListener("pointermove", (e) => {
  mouseX = (e.clientX / innerWidth - .5) * 2;
  mouseY = (e.clientY / innerHeight - .5) * 2;
});

function animateParallax() {
  currentX += (mouseX - currentX) * .06;
  currentY += (mouseY - currentY) * .06;
  parallaxEls.forEach((el) => {
    const depth = Number(el.dataset.parallax);
    const x = currentX * innerWidth * depth;
    const y = currentY * innerHeight * depth;
    const base = el.classList.contains("hero-backdrop") ? "scale(1.045)" : "";
    el.style.transform = `${base} translate3d(${x}px, ${y}px, 0)`;
  });
  requestAnimationFrame(animateParallax);
}
animateParallax();

document.querySelectorAll(".magnetic").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * .12}px, ${y * .12}px)`;
  });
  el.addEventListener("pointerleave", () => {
    el.style.transform = "";
  });
});

const tiltCard = document.querySelector("#tilt-card");
if (tiltCard) {
  tiltCard.addEventListener("pointermove", (e) => {
    const r = tiltCard.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    tiltCard.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 13}deg) translateY(-8px)`;
  });
  tiltCard.addEventListener("pointerleave", () => {
    tiltCard.style.transform = "";
  });
}

const copyButton = document.querySelector(".copy-button");
const toast = document.querySelector(".toast");
copyButton?.addEventListener("click", async () => {
  const value = copyButton.dataset.copy || "CASHEW";
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const input = document.createElement("textarea");
    input.value = value;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1500);
});

const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");
let ringX = 0, ringY = 0, pointerX = 0, pointerY = 0;
window.addEventListener("pointermove", (e) => {
  pointerX = e.clientX; pointerY = e.clientY;
  dot.style.transform = `translate(${pointerX - 3}px, ${pointerY - 3}px)`;
});
function cursorLoop() {
  ringX += (pointerX - ringX) * .16;
  ringY += (pointerY - ringY) * .16;
  ring.style.transform = `translate(${ringX - 17}px, ${ringY - 17}px)`;
  requestAnimationFrame(cursorLoop);
}
cursorLoop();
document.querySelectorAll("a,button").forEach((el) => {
  el.addEventListener("pointerenter", () => ring.classList.add("active"));
  el.addEventListener("pointerleave", () => ring.classList.remove("active"));
});

window.addEventListener("scroll", () => {
  const bg = document.querySelector(".community-bg");
  if (!bg) return;
  const rect = bg.parentElement.getBoundingClientRect();
  if (rect.top < innerHeight && rect.bottom > 0) {
    const shift = (rect.top / innerHeight) * 18;
    bg.style.transform = `scale(1.07) translateY(${shift}px)`;
  }
}, { passive: true });


// Cinematic film controls
const film = document.querySelector('.cashew-film');
const filmStage = document.querySelector('.film-stage');
const filmPlay = document.querySelector('[data-film-play]');
const filmSound = document.querySelector('[data-film-sound]');
const filmHitArea = document.querySelector('.film-hit-area');

function syncFilmPlayUI() {
  if (!film || !filmPlay || !filmStage) return;
  const paused = film.paused;
  filmStage.classList.toggle('is-paused', paused);
  filmPlay.querySelector('.control-icon').textContent = paused ? '▶' : 'Ⅱ';
  filmPlay.querySelector('.control-label').textContent = paused ? 'PLAY' : 'PAUSE';
  filmPlay.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
}

function toggleFilmPlayback() {
  if (!film) return;
  if (film.paused) film.play().catch(() => {});
  else film.pause();
  setTimeout(syncFilmPlayUI, 0);
}

filmPlay?.addEventListener('click', toggleFilmPlayback);
filmHitArea?.addEventListener('click', toggleFilmPlayback);
film?.addEventListener('play', syncFilmPlayUI);
film?.addEventListener('pause', syncFilmPlayUI);

filmSound?.addEventListener('click', () => {
  if (!film) return;
  film.muted = !film.muted;
  filmSound.querySelector('.control-icon').textContent = film.muted ? '⌁' : '◖';
  filmSound.querySelector('.control-label').textContent = film.muted ? 'SOUND ON' : 'SOUND OFF';
  filmSound.setAttribute('aria-label', film.muted ? 'Turn sound on' : 'Turn sound off');
  if (film.paused) film.play().catch(() => {});
});

// Pause the film when it is far off-screen and resume muted when it returns.
const filmVisibility = film && new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      film.play().catch(() => {});
    } else {
      film.pause();
    }
  });
}, { threshold: .18 });
if (film && filmVisibility) filmVisibility.observe(film);
