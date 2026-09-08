/**
 * Read this tab: each teaching in its own box; tap opens full screen.
 */
window.JapaReadPanel = {
  render(rootElement) {
    const data = window.JapaQuotes;
    rootElement.replaceChildren();

    /** @type {{ title: string, preview: string, eyebrow: string, open: function }[]} */
    const tiles = [];

    tiles.push({
      eyebrow: "Begin here",
      title: data.intro.title,
      preview: data.intro.body,
      open: function () {
        window.JapaReadViewer.open({
          kind: "text",
          title: data.intro.title,
          body: data.intro.body,
        });
      },
    });

    tiles.push({
      eyebrow: "Maha-mantra",
      title: data.mantra.title,
      preview: data.mantra.lines.join(" "),
      open: function () {
        window.JapaReadViewer.open({
          kind: "mantra",
          title: data.mantra.title,
          body: data.mantra.lines.join("\n"),
          note: data.mantra.note,
        });
      },
    });

    data.sections.forEach(function (section) {
      section.quotes.forEach(function (quote, index) {
        tiles.push({
          eyebrow: section.heading,
          title: quote.source,
          preview: quote.text,
          open: function () {
            window.JapaReadViewer.open({
              kind: "text",
              title: section.heading,
              body: quote.text,
              source: quote.source,
            });
          },
        });
      });
    });

    tiles.push({
      eyebrow: "Practice",
      title: data.practice.heading,
      preview: data.practice.points[0],
      open: function () {
        window.JapaReadViewer.open({
          kind: "list",
          title: data.practice.heading,
          points: data.practice.points,
        });
      },
    });

    tiles.forEach(function (tile) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "read-tile";
      btn.setAttribute("aria-label", "Open reading: " + tile.title);

      const eyebrow = document.createElement("span");
      eyebrow.className = "read-tile__eyebrow";
      eyebrow.textContent = tile.eyebrow;

      const title = document.createElement("span");
      title.className = "read-tile__title";
      title.textContent = tile.title;

      const preview = document.createElement("span");
      preview.className = "read-tile__preview";
      preview.textContent = tile.preview;

      const openHint = document.createElement("span");
      openHint.className = "read-tile__open";
      openHint.textContent = "Tap to read";

      btn.append(eyebrow, title, preview, openHint);
      btn.addEventListener("click", tile.open);
      rootElement.append(btn);
    });
  },
};
