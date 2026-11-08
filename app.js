const opening = document.querySelector("#opening");
const openInvitation = () => {
  if (!opening || opening.classList.contains("is-dismissed")) return;
  opening.classList.add("is-dismissed");
  window.setTimeout(() => opening.remove(), 800);
};

if (opening) {
  if (sessionStorage.getItem("after-the-vows-opened") === "yes" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    opening.remove();
  } else {
    document.querySelector("#opening-enter").addEventListener("click", openInvitation);
    sessionStorage.setItem("after-the-vows-opened", "yes");
    window.setTimeout(openInvitation, 1700);
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") openInvitation();
    }, { once: true });
  }
}

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const form = document.querySelector("#rsvp-form");
const guestField = document.querySelector("#guest-field");
const guestSelect = document.querySelector("#guests");
const formError = document.querySelector("#form-error");
const passResult = document.querySelector("#pass-result");
const passName = document.querySelector("#pass-name");
const passStatus = document.querySelector("#pass-status");
const editResponse = document.querySelector("#edit-response");

const attendanceInputs = document.querySelectorAll('input[name="attendance"]');
attendanceInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const attending = document.querySelector('input[name="attendance"]:checked')?.value === "yes";
    guestSelect.disabled = !attending;
    guestField.classList.toggle("is-disabled", !attending);
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formError.hidden = true;
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  if (!name) {
    formError.textContent = "Пожалуйста, укажите имя и фамилию.";
    formError.hidden = false;
    form.elements.name.focus();
    return;
  }

  const attending = data.get("attendance") === "yes";
  passName.textContent = name;
  passStatus.textContent = attending ? "ADMISSION · " + data.get("guests") + (data.get("guests") === "1" ? " GUEST" : " GUESTS") : "REGRETS RECEIVED";
  document.querySelector("#pass-kicker").textContent = attending ? "DEMO ADMISSION PASS · 001" : "DEMO RESPONSE · 001";
  document.querySelector("#pass-ticket").classList.toggle("is-regret", !attending);
  form.hidden = true;
  passResult.hidden = false;
  editResponse.focus({ preventScroll: true });
});

editResponse.addEventListener("click", () => {
  passResult.hidden = true;
  form.hidden = false;
  form.elements.name.focus();
});

const galleryImages = [...document.querySelectorAll(".gallery-frame img")];
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
let activeImage = 0;
let lastGalleryButton;

function showGalleryImage(index) {
  activeImage = (index + galleryImages.length) % galleryImages.length;
  const image = galleryImages[activeImage];
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt.replace(/^Временная заглушка /, "");
  lightboxCaption.textContent = `FRAME 0${activeImage + 1} / 04`;
}

document.querySelectorAll(".gallery-frame").forEach((button) => {
  button.addEventListener("click", () => {
    lastGalleryButton = button;
    showGalleryImage(Number(button.dataset.gallery));
    lightbox.showModal();
    document.querySelector(".lightbox-close").focus();
  });
});

document.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
document.querySelector(".lightbox-prev").addEventListener("click", () => showGalleryImage(activeImage - 1));
document.querySelector(".lightbox-next").addEventListener("click", () => showGalleryImage(activeImage + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener("close", () => lastGalleryButton?.focus());
lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showGalleryImage(activeImage - 1);
  if (event.key === "ArrowRight") showGalleryImage(activeImage + 1);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.open) lightbox.close();
});
