// Scroll pe cards smoothly dikhein
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('show');

    // Counter animation (data-count wale element)
    const counter = entry.target.querySelector('[data-count]');
    if (counter) {
      const end = Number(counter.dataset.count);
      let n = 0;
      const timer = setInterval(() => {
        n++;
        counter.textContent = n;
        if (n >= end) clearInterval(timer);
      }, 350);
    }
    observer.unobserve(entry.target);
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));