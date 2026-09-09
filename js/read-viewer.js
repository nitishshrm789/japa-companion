/**
 * Full-screen reader for Read this / Hare Krsna MM boxes.
 */
window.JapaReadViewer = {
  init() {
    this.overlay = document.getElementById("read-fullscreen");
    this.titleEl = document.getElementById("read-fullscreen-title");
    this.contentEl = document.getElementById("read-fullscreen-content");
    this.closeBtn = document.getElementById("read-fullscreen-close");
    this.bodyEl = this.overlay.querySelector(".read-fullscreen__body");

    this.closeBtn.addEventListener("click", () => this.close());

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !this.overlay.hidden) {
        this.close();
      }
    });
  },

  open(item) {
    this.titleEl.textContent = item.title;
    this.contentEl.replaceChildren();
    this.bodyEl.classList.toggle("read-fullscreen__body--mm", item.kind === "mm");
    this.overlay.classList.toggle("read-fullscreen--mm", item.kind === "mm");
    this.titleEl.hidden = item.kind === "mm";

    if (item.kind === "mm") {
      const mantra = document.createElement("p");
      mantra.className = "read-fullscreen__mantra read-fullscreen__mantra--mm";
      mantra.textContent = item.body;
      this.contentEl.append(mantra);
    } else if (item.kind === "mantra") {
      const mantra = document.createElement("p");
      mantra.className = "read-fullscreen__mantra";
      mantra.textContent = item.body;
      const note = document.createElement("p");
      note.textContent = item.note;
      this.contentEl.append(mantra, note);
    } else if (item.kind === "list") {
      const list = document.createElement("ol");
      list.className = "read-fullscreen__list";
      item.points.forEach(function (point) {
        const li = document.createElement("li");
        li.textContent = point;
        list.append(li);
      });
      this.contentEl.append(list);
    } else {
      const text = document.createElement("p");
      text.textContent = item.body;
      this.contentEl.append(text);

      if (item.source) {
        const source = document.createElement("cite");
        source.className = "read-fullscreen__source";
        source.textContent = item.source;
        this.contentEl.append(source);
      }
    }

    this.overlay.hidden = false;
    document.body.classList.add("is-reading-fullscreen");
    this.closeBtn.focus();
  },

  close() {
    this.overlay.hidden = true;
    this.titleEl.hidden = false;
    this.bodyEl.classList.remove("read-fullscreen__body--mm");
    this.overlay.classList.remove("read-fullscreen--mm");
    document.body.classList.remove("is-reading-fullscreen");
  },
};
