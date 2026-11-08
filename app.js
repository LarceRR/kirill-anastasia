const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Появление контента запускается при входе блока в область просмотра. */
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* Плавная навигация с корректным поведением при reduced motion. */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });
});

/* Демо-ответ: данные используются только для показа результата на текущем экране. */
const replyForm = document.querySelector("#reply-form");
const attendanceDetails = document.querySelector("#attendance-details");
const attendanceInputs = [...document.querySelectorAll('input[name="attendance"]')];
const transportInput = document.querySelector("#transport");
const menuInput = document.querySelector("#menu");
const replyError = document.querySelector("#reply-error");
const replyResult = document.querySelector("#reply-result");
const resultTitle = document.querySelector("#result-title");
const resultMessage = document.querySelector("#result-message");
const resultDetails = document.querySelector("#result-details");
const editReply = document.querySelector("#edit-reply");

function updateAttendanceState() {
  const selected = document.querySelector('input[name="attendance"]:checked');
  const attending = selected?.value === "yes";
  attendanceDetails.hidden = !attending;
  transportInput.disabled = !attending;
  transportInput.required = attending;
  menuInput.disabled = !attending;
}

attendanceInputs.forEach((input) => input.addEventListener("change", updateAttendanceState));

replyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  replyError.hidden = true;
  if (!replyForm.reportValidity()) {
    replyError.textContent = "Пожалуйста, заполните обязательные поля.";
    replyError.hidden = false;
    return;
  }

  const data = new FormData(replyForm);
  const name = String(data.get("name") || "").trim();
  const attending = data.get("attendance") === "yes";

  if (!name) {
    replyError.textContent = "Укажите, пожалуйста, своё имя.";
    replyError.hidden = false;
    replyForm.elements.name.focus();
    return;
  }

  resultTitle.textContent = attending ? "До встречи, " + name + "!" : "Спасибо, " + name + ".";
  resultMessage.textContent = attending
    ? "Мы будем ждать вас 12 июня. Ниже — детали, которые вы выбрали."
    : "Жаль, что не получится встретиться. Будем мысленно с вами.";
  resultDetails.replaceChildren();

  if (attending) {
    const details = [
      ["Как доберётесь", data.get("transport")],
      ["Пожелания по меню", data.get("menu")],
      ["Музыкальное пожелание", String(data.get("song") || "").trim() || "Не указано"]
    ];
    details.forEach(([label, value]) => {
      const wrapper = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = value;
      wrapper.append(term, description);
      resultDetails.append(wrapper);
    });
  }

  replyForm.hidden = true;
  replyResult.hidden = false;
  editReply.focus({ preventScroll: true });
});

editReply.addEventListener("click", () => {
  replyResult.hidden = true;
  replyForm.hidden = false;
  replyForm.elements.name.focus();
});

/* Просмотр галереи: управление стрелками, возврат фокуса и подписи под фото отсутствуют. */
const galleryButtons = [...document.querySelectorAll(".gallery-image")];
const galleryImages = galleryButtons.map((button) => button.querySelector("img"));
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const closeLightbox = document.querySelector(".lightbox-close");
let activeImageIndex = 0;
let lastGalleryButton = null;

function showGalleryImage(index) {
  activeImageIndex = (index + galleryImages.length) % galleryImages.length;
  const selectedImage = galleryImages[activeImageIndex];
  lightboxImage.src = selectedImage.currentSrc || selectedImage.src;
  lightboxImage.alt = selectedImage.alt;
}

galleryButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    lastGalleryButton = button;
    showGalleryImage(index);
    lightbox.showModal();
    closeLightbox.focus();
  });
});

closeLightbox.addEventListener("click", () => lightbox.close());
document.querySelector(".lightbox-prev").addEventListener("click", () => showGalleryImage(activeImageIndex - 1));
document.querySelector(".lightbox-next").addEventListener("click", () => showGalleryImage(activeImageIndex + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener("close", () => lastGalleryButton?.focus());
lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showGalleryImage(activeImageIndex - 1);
  if (event.key === "ArrowRight") showGalleryImage(activeImageIndex + 1);
});
