function toggleMenu() {
  const nav = document.getElementById("nav-menu");
  const hamburger = document.querySelector(".hamburger");
  const contentWrapper = document.getElementById("content-wrapper");

  const isOpen = nav.classList.contains("open");

  if (isOpen) {
    nav.classList.remove("open");
    nav.style.opacity = "0";
    nav.style.visibility = "hidden";
    if (window.innerWidth <= 825) { // Only shift content on mobile
      contentWrapper.style.transition = "margin-top 0.3s ease-in-out";
      contentWrapper.style.marginTop = "0";
    }
  } else {
    nav.classList.add("open");
    nav.style.opacity = "1";
    nav.style.visibility = "visible";

    if (window.innerWidth <= 825) { // Only shift content on mobile
      setTimeout(() => {
        let totalHeight = nav.offsetHeight;
        document.querySelectorAll(".submenu").forEach(submenu => {
          if (submenu.classList.contains("active")) {
            totalHeight += submenu.scrollHeight;
          }
        });

        contentWrapper.style.transition = "margin-top 0.3s ease-in-out";
        contentWrapper.style.marginTop = `${totalHeight}px`;
      }, 150);
    }
  }

  const expanded = hamburger.getAttribute("aria-expanded") === "true";
  hamburger.setAttribute("aria-expanded", !expanded);
}

function toggleSubmenu(event) {
  event.preventDefault();

  const button = event.currentTarget;
  const submenu = button.nextElementSibling;
  submenu.classList.toggle("active");
  button.classList.toggle("open");

  const expanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", !expanded);

  if (window.innerWidth <= 825) { // Only shift content on mobile
    setTimeout(() => {
      const nav = document.getElementById("nav-menu");
      let totalHeight = nav.offsetHeight;

      document.querySelectorAll(".submenu").forEach(submenu => {
        if (submenu.classList.contains("active")) {
          totalHeight += submenu.scrollHeight;
        }
      });

      const contentWrapper = document.getElementById("content-wrapper");
      contentWrapper.style.transition = "margin-top 0.3s ease-in-out";
      contentWrapper.style.marginTop = `${totalHeight}px`;
    }, 150);
  }
}

// Ensure correct positioning if menu starts open (only on mobile)
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth <= 825) {
    const nav = document.getElementById("nav-menu");
    const contentWrapper = document.getElementById("content-wrapper");
    let totalHeight = nav.offsetHeight;

    document.querySelectorAll(".submenu").forEach(submenu => {
      if (submenu.classList.contains("active")) {
        totalHeight += submenu.scrollHeight;
      }
    });

    contentWrapper.style.transition = "margin-top 0.3s ease-in-out";
    contentWrapper.style.marginTop = `${totalHeight}px`;
  }
});
