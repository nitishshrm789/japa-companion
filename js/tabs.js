/**
 * Hamburger menu + section panels.
 */
window.JapaTabs = {
  LABELS: {
    clock: "Clock",
    extra: "Extra Rounds",
    result: "Result",
    read: "Read this",
    mm: "Hare Krsna MM",
    photos: "Photos",
    books: "Book Reading",
    hearing: "Hearing",
  },

  init(options) {
    const buttons = Array.prototype.slice.call(
      document.querySelectorAll("[data-tab]")
    );
    const panels = {
      clock: document.getElementById("panel-clock"),
      extra: document.getElementById("panel-extra"),
      result: document.getElementById("panel-result"),
      read: document.getElementById("panel-read"),
      mm: document.getElementById("panel-mm"),
      photos: document.getElementById("panel-photos"),
      books: document.getElementById("panel-books"),
      hearing: document.getElementById("panel-hearing"),
    };

    const menu = document.getElementById("app-menu");
    const backdrop = document.getElementById("menu-backdrop");
    const menuToggle = document.getElementById("menu-toggle");
    const menuClose = document.getElementById("menu-close");
    const sectionLabel = document.getElementById("section-label");

    function isMenuOpen() {
      return menu.classList.contains("is-open");
    }

    function openMenu() {
      menu.classList.add("is-open");
      backdrop.classList.add("is-open");
      document.body.classList.add("is-menu-open");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close menu");
    }

    function closeMenu() {
      menu.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      document.body.classList.remove("is-menu-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    }

    function activate(tabName, fromMenu) {
      const name = panels[tabName] ? tabName : "clock";

      buttons.forEach(function (btn) {
        const isActive = btn.getAttribute("data-tab") === name;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      Object.keys(panels).forEach(function (key) {
        const panel = panels[key];
        if (!panel) {
          return;
        }
        const show = key === name;
        panel.classList.toggle("is-active", show);
        panel.hidden = !show;
      });

      if (sectionLabel) {
        sectionLabel.textContent = window.JapaTabs.LABELS[name] || name;
      }

      if (typeof options.onChange === "function") {
        options.onChange(name);
      }

      if (fromMenu !== false) {
        closeMenu();
      }

      window.scrollTo(0, 0);
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        activate(btn.getAttribute("data-tab"), true);
      });
    });

    menuToggle.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (isMenuOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menuClose.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
    });

    backdrop.addEventListener("click", function () {
      closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isMenuOpen()) {
        closeMenu();
      }
    });

    // First load: show Clock, keep menu closed.
    activate(options.initialTab || "clock", false);
    closeMenu();

    return { activate: activate, openMenu: openMenu, closeMenu: closeMenu };
  },
};
