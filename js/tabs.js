/**
 * Hamburger menu + section panels.
 */
window.JapaTabs = {
  LABELS: {
    digital: "Digital Counter",
    clock: "Clock",
    extra: "Extra Rounds",
    photos: "Photos",
    mm: "Hare Krsna MM",
    read: "Read this",
    result: "Result",
    books: "Book Reading",
    hearing: "Hearing",
    todo: "To Do List",
    progress: "My Progress",
    personalities: "Personalities",
    expense: "Expense Manager",
    financial: "Financial",
    health: "Health",
    skills: "Skills",
    gift: "Gift",
    slokas: "Slokas",
    prayer: "Prayer",
  },

  STAR_SCHEDULES: [
    {
      startMinutes: 4 * 60,
      endMinutes: 10 * 60 + 30,
      tabs: ["clock", "photos", "mm", "result"],
    },
    {
      startMinutes: 10 * 60,
      endMinutes: 22 * 60,
      tabs: ["clock", "hearing", "todo", "progress", "health"],
    },
  ],

  getStarredTabs(date) {
    const now = date || new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const starredTabs = {};

    this.STAR_SCHEDULES.forEach(function (schedule) {
      if (
        currentMinutes >= schedule.startMinutes &&
        currentMinutes < schedule.endMinutes
      ) {
        schedule.tabs.forEach(function (tabName) {
          starredTabs[tabName] = true;
        });
      }
    });

    return starredTabs;
  },

  updateMenuStars(buttons, date) {
    const starredTabs = this.getStarredTabs(date);

    buttons.forEach(
      function (button) {
        const tabName = button.getAttribute("data-tab");
        const label = this.LABELS[tabName] || tabName;
        button.textContent = label + (starredTabs[tabName] ? " ⭐" : "");
      }.bind(this)
    );
  },

  init(options) {
    const buttons = Array.prototype.slice.call(
      document.querySelectorAll("[data-tab]")
    );
    const panels = {
      digital: document.getElementById("panel-digital"),
      clock: document.getElementById("panel-clock"),
      extra: document.getElementById("panel-extra"),
      result: document.getElementById("panel-result"),
      todo: document.getElementById("panel-todo"),
      progress: document.getElementById("panel-progress"),
      read: document.getElementById("panel-read"),
      mm: document.getElementById("panel-mm"),
      photos: document.getElementById("panel-photos"),
      books: document.getElementById("panel-books"),
      hearing: document.getElementById("panel-hearing"),
      expense: document.getElementById("panel-expense"),
      personalities: document.getElementById("panel-personalities"),
      health: document.getElementById("panel-health"),
      skills: document.getElementById("panel-skills"),
      gift: document.getElementById("panel-gift"),
      slokas: document.getElementById("panel-slokas"),
      prayer: document.getElementById("panel-prayer"),
      financial: document.getElementById("panel-financial"),
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

    this.updateMenuStars(buttons);
    window.setInterval(
      function () {
        this.updateMenuStars(buttons);
      }.bind(this),
      60000
    );
    document.addEventListener(
      "visibilitychange",
      function () {
        if (!document.hidden) {
          this.updateMenuStars(buttons);
        }
      }.bind(this)
    );

    // First load: show Clock, keep menu closed.
    activate(options.initialTab || "clock", false);
    closeMenu();

    return { activate: activate, openMenu: openMenu, closeMenu: closeMenu };
  },
};
