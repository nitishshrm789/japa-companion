/**
 * Photos tab — one box per image with name; tap opens full screen.
 */
window.JapaPhotosPanel = {
  render(rootElement) {
    const data = window.JapaPhotosData;
    rootElement.replaceChildren();

    data.items.forEach(function (photo) {
      const src = data.folder + "/" + encodeURIComponent(photo.file);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "photo-tile";
      btn.setAttribute("aria-label", "Open photo: " + photo.name);

      const frame = document.createElement("div");
      frame.className = "photo-tile__frame";

      const img = document.createElement("img");
      img.className = "photo-tile__img";
      img.src = src;
      img.alt = photo.name;
      img.loading = "lazy";

      frame.append(img);

      const name = document.createElement("span");
      name.className = "photo-tile__name";
      name.textContent = photo.name;

      btn.append(frame, name);
      btn.addEventListener("click", function () {
        window.JapaPhotoViewer.open({
          src: src,
          name: photo.name,
        });
      });

      rootElement.append(btn);
    });
  },
};
