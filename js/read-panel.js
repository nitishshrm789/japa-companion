/**
 * Read this tab: filter by section, each teaching in its own box; tap opens full screen.
 */
window.JapaReadPanel = {
  render(rootElement) {
    this.root = rootElement;
    this.filter = this.filter || "all";
    this.draw();
  },

  buildTiles(data) {
    /** @type {{ sectionId: string, title: string, preview: string, eyebrow: string, open: function }[]} */
    const tiles = [];

    tiles.push({
      sectionId: "all",
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
      sectionId: "all",
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
      section.quotes.forEach(function (quote) {
        tiles.push({
          sectionId: section.id,
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
      sectionId: "all",
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

    return tiles;
  },

  filteredTiles(tiles) {
    if (this.filter === "all") {
      return tiles;
    }
    return tiles.filter(
      function (tile) {
        return tile.sectionId === this.filter;
      }.bind(this)
    );
  },

  drawFilters(data) {
    const filters = document.createElement("div");
    filters.className = "read-filters";
    filters.setAttribute("role", "tablist");
    filters.setAttribute("aria-label", "Filter readings by section");

    const options = [{ id: "all", label: "All" }].concat(
      data.sections.map(function (section) {
        return { id: section.id, label: section.heading };
      })
    );

    options.forEach(
      function (option) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "read-filter-btn" + (this.filter === option.id ? " is-active" : "");
        btn.setAttribute("role", "tab");
        btn.setAttribute(
          "aria-selected",
          this.filter === option.id ? "true" : "false"
        );
        btn.textContent = option.label;
        btn.addEventListener(
          "click",
          function () {
            this.filter = option.id;
            this.draw();
          }.bind(this)
        );
        filters.append(btn);
      }.bind(this)
    );

    return filters;
  },

  drawTile(tile) {
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
    return btn;
  },

  draw() {
    const data = window.JapaQuotes;
    const root = this.root;
    root.replaceChildren();

    root.append(this.drawFilters(data));

    const grid = document.createElement("div");
    grid.className = "boxes-grid";

    const tiles = this.filteredTiles(this.buildTiles(data));
    if (tiles.length === 0) {
      const empty = document.createElement("p");
      empty.className = "read-empty box";
      empty.textContent = "No readings in this section yet.";
      grid.append(empty);
    } else {
      tiles.forEach(
        function (tile) {
          grid.append(this.drawTile(tile));
        }.bind(this)
      );
    }

    root.append(grid);
  },
};
