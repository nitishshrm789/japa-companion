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
        "No saved days yet. Finish rounds on Clock / Extra Rounds, then tap Save Day.";
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

      const extraCount = Array.isArray(day.extraRounds)
        ? day.extraRounds.length
        : day.extraCount || 0;
      const mainCount = day.roundCount || (day.rounds ? day.rounds.length : 0);

      const summary = document.createElement("p");
      summary.className = "result-day__summary";
      summary.textContent =
        mainCount +
        " rounds" +
        (extraCount > 0 ? " + " + extraCount + " extra" : "") +
        " · total " +
        window.JapaTime.formatElapsed(day.totalMs) +
        " min";

      head.append(title, summary);

      const list = document.createElement("ul");
      list.className = "result-day__rounds";

      (day.rounds || []).forEach(function (round, index) {
        const item = document.createElement("li");
        item.textContent = window.JapaTime.formatRoundLabel(
          index + 1,
          round.elapsedMs
        );
        list.append(item);
      });

      if (extraCount > 0) {
        const divider = document.createElement("li");
        divider.className = "result-day__divider";
        divider.textContent = "Extra rounds";
        list.append(divider);

        day.extraRounds.forEach(function (round, index) {
          const item = document.createElement("li");
          item.textContent = window.JapaTime.formatRoundLabel(
            window.JapaRounds.EXTRA_START + index,
            round.elapsedMs
          );
          list.append(item);
        });
      }

      card.append(head, list);
      rootElement.append(card);
    });
  },
};
