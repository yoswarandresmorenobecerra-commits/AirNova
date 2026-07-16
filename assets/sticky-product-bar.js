document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-sticky-bar]').forEach((bar) => {
    const sectionId = bar.dataset.sectionId;
    const mainButton = document.getElementById(`ProductSubmitButton-${sectionId}`);
    const mainPrice = document.getElementById(`price-${sectionId}`);
    const stickyButton = document.getElementById(`StickySubmit-${sectionId}`);
    const stickyButtonText = document.getElementById(`StickySubmitText-${sectionId}`);
    const stickyPrice = document.getElementById(`StickyPrice-${sectionId}`);

    function syncFromMain() {
      if (mainButton && stickyButton) {
        stickyButton.disabled = mainButton.disabled;
      }
      if (mainButton && stickyButtonText) {
        const mainText = mainButton.querySelector('span')?.textContent?.trim();
        if (mainText) stickyButtonText.textContent = mainText;
      }
      if (mainPrice && stickyPrice) {
        stickyPrice.innerHTML = mainPrice.innerHTML;
      }
    }

    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
        if (event.data.sectionId !== sectionId) return;
        syncFromMain();
      });
    }

    if (mainButton && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            bar.classList.toggle('product-sticky-bar--visible', !entry.isIntersecting);
          });
        },
        { threshold: 0 }
      );
      observer.observe(mainButton);
    }
  });
});
