/**
 * Hare Krsna MM tab — two boxes (English / Hindi), open full screen.
 */
window.JapaMantraPanel = {
  render(rootElement) {
    const data = window.JapaMantraData;
    rootElement.replaceChildren();

    [data.english, data.hindi].forEach(function (mantra) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mm-tile";
      btn.setAttribute(
        "aria-label",
        "Open " + mantra.label + " maha-mantra full screen"
      );

      const label = document.createElement("span");
      label.className = "mm-tile__label";
      label.textContent = mantra.label;

      const preview = document.createElement("pre");
      preview.className = "mm-tile__preview";
      preview.textContent = mantra.lines.join("\n");

      const hint = document.createElement("span");
      hint.className = "mm-tile__open";
      hint.textContent = "Tap to open";

      btn.append(label, preview, hint);
      btn.addEventListener("click", function () {
        window.JapaReadViewer.open({
          kind: "mm",
          title: mantra.title,
          body: mantra.lines.join("\n"),
        });
      });

      rootElement.append(btn);
    });
  },
};
