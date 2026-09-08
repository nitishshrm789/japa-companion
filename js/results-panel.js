/**
 * Result tab — last 7 days of saved daily chanting times.
 */
window.JapaResultsPanel = {
  render(rootElement) {
    const days = window.JapaResultsStore.load();
    rootElement.replaceChildren();

    if (days.length === 0) {
      const empty = document.createElement("p");
      empty.className = "result-empty box";
      empty.textContent =
        "No saved days yet. Finish rounds on Clock, then tap Save Day.";
      rootElement.append(empty);
      return;
    }

    days.forEach(function (day) {
      const card = document.createElement("article");
      card.className = "result-day box";

      const head = document.createElement("div");
      head.className = "result-day__head";

      const title = document.createElement("h3");
      title.className = "result-day__title";
      title.textContent = window.JapaTime.formatDateLabel(day.dateKey);

      const summary = document.createElement("p");
      summary.className = "result-day__summary";
      summary.textContent =
        day.roundCount +
        " rounds · total " +
        window.JapaTime.formatElapsed(day.totalMs) +
        " min";

      head.append(title, summary);

      const list = document.createElement("ul");
      list.className = "result-day__rounds";

      day.rounds.forEach(function (round, index) {
        const item = document.createElement("li");
        item.textContent = window.JapaTime.formatRoundLabel(
          index + 1,
          round.elapsedMs
        );
        list.append(item);
      });

      card.append(head, list);
      rootElement.append(card);
    });
  },
};
