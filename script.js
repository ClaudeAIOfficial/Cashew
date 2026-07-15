document.body.classList.add("is-loading");
document.body.classList.add("intro-lock");

const openingIntro = document.querySelector("#openingIntro");
const openingVideo = document.querySelector(".opening-video");
const openingProgress = document.querySelector(".opening-progress i");
const skipIntroButton = document.querySelector("[data-skip-intro]");

let introClosed = false;

function closeIntro() {
  if (introClosed || !openingIntro) return;
  introClosed = true;
  openingIntro.classList.add("done");
  document.body.classList.remove("is-loading");
  document.body.classList.remove("intro-lock");
  setTimeout(() => {
    openingIntro.remove();
  }, 900);
}

window.addEventListener("load", () => {
  if (!openingVideo) {
    closeIntro();
    return;
  }
  openingVideo.play().catch(() => {});
});

openingVideo?.addEventListener("timeupdate", () => {
  if (!openingProgress || !openingVideo.duration) return;
  const ratio = Math.max(0, Math.min(1, openingVideo.currentTime / openingVideo.duration));
  openingProgress.style.transform = `scaleX(${ratio})`;
});

openingVideo?.addEventListener("ended", closeIntro);
openingVideo?.addEventListener("error", closeIntro);
skipIntroButton?.addEventListener("click", closeIntro);

// Safety fallback in case a browser blocks or fails to finish the video.
setTimeout(closeIntro, 20000);

const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  header?.classList.toggle("scrolled", window.scrollY > 32);
}, { passive: true });

const reveals = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .13 });
reveals.forEach((el) => revealObserver.observe(el));

const counters = document.querySelectorAll("[data-counter]");
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const end = Number(el.dataset.counter || 0);
    const start = performance.now();
    const duration = 1300;
    const update = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.floor(end * eased)).padStart(end < 10 ? 2 : 1, "0");
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
    counterObserver.unobserve(el);
  });
}, { threshold: .55 });
counters.forEach((el) => counterObserver.observe(el));

let targetX = 0;
let targetY = 0;
let smoothX = 0;
let smoothY = 0;
const parallax = document.querySelectorAll("[data-parallax]");
const lens = document.querySelector(".cursor-lens");

window.addEventListener("pointermove", (event) => {
  targetX = event.clientX;
  targetY = event.clientY;
});

function pointerLoop() {
  smoothX += (targetX - smoothX) * .12;
  smoothY += (targetY - smoothY) * .12;

  if (lens) {
    lens.style.transform = `translate(${smoothX - 22}px, ${smoothY - 22}px)`;
  }

  const normalizedX = smoothX / innerWidth - .5;
  const normalizedY = smoothY / innerHeight - .5;

  parallax.forEach((el) => {
    const depth = Number(el.dataset.parallax || 0);
    const x = normalizedX * innerWidth * depth;
    const y = normalizedY * innerHeight * depth;
    const scale = el.classList.contains("hero-image") ? "scale(1.035)" :
                  el.classList.contains("community-art") ? "scale(1.05)" : "";
    el.style.transform = `${scale} translate3d(${x}px, ${y}px, 0)`;
  });

  requestAnimationFrame(pointerLoop);
}
pointerLoop();

document.querySelectorAll("a, button, .tilt-card").forEach((el) => {
  el.addEventListener("pointerenter", () => lens?.classList.add("active"));
  el.addEventListener("pointerleave", () => lens?.classList.remove("active"));
});

document.querySelectorAll(".magnetic").forEach((el) => {
  el.addEventListener("pointermove", (event) => {
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * .09}px, ${y * .09}px)`;
  });
  el.addEventListener("pointerleave", () => {
    el.style.transform = "";
  });
});

document.querySelectorAll(".tilt-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = `perspective(1000px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-5px)`;
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

const copyButtons = document.querySelectorAll("[data-copy]");
const toast = document.querySelector(".toast");

copyButtons.forEach((copyButton) => {
  copyButton.addEventListener("click", async () => {
    const value = copyButton.dataset.copy || "";
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = value;
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }

    if (toast) {
      toast.textContent = copyButton.dataset.copyLabel || "Copied";
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 1500);
    }
  });
});

const video = document.querySelector(".cashew-film");
const filmStage = document.querySelector(".film-stage");
const playButton = document.querySelector("[data-film-play]");
const soundButton = document.querySelector("[data-film-sound]");
const filmHit = document.querySelector(".film-hit");

function syncPlayState() {
  if (!video || !playButton || !filmStage) return;
  const paused = video.paused;
  filmStage.classList.toggle("is-paused", paused);
  playButton.querySelector("b").textContent = paused ? "▶" : "Ⅱ";
  playButton.querySelector("span").textContent = paused ? "PLAY" : "PAUSE";
}

function togglePlay() {
  if (!video) return;
  if (video.paused) video.play().catch(() => {});
  else video.pause();
  syncPlayState();
}

playButton?.addEventListener("click", togglePlay);
filmHit?.addEventListener("click", togglePlay);
video?.addEventListener("play", syncPlayState);
video?.addEventListener("pause", syncPlayState);

soundButton?.addEventListener("click", () => {
  if (!video || !soundButton) return;
  video.muted = !video.muted;
  soundButton.querySelector("b").textContent = video.muted ? "⌁" : "◉";
  soundButton.querySelector("span").textContent = video.muted ? "SOUND ON" : "SOUND OFF";
});

syncPlayState();
