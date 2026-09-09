/**
 * Tab navigation including Extra Rounds.
 */
window.JapaTabs = {
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
    };

    function activate(tabName) {
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

      if (typeof options.onChange === "function") {
        options.onChange(name);
      }

      window.scrollTo(0, 0);
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activate(btn.getAttribute("data-tab"));
      });
    });

    activate(options.initialTab || "clock");

    return { activate: activate };
  },
};
