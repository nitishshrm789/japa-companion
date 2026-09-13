/**
 * Result tab — Clock/Extra days + Digital Counting Chanting (independent).
 */
window.JapaResultsPanel = {
  render(rootElement) {
    const clockDays = window.JapaResultsStore.load();
    const digitalDays = window.JapaDigitalResultsStore.load();
    rootElement.replaceChildren();

    if (clockDays.length === 0 && digitalDays.length === 0) {
      const empty = document.createElement("p");
      empty.className = "result-empty box";
      empty.textContent =
        "No saved days yet. Finish rounds on Clock / Extra Rounds or Digital Counter, then tap Save Day.";
      rootElement.append(empty);
      return;
    }

    if (clockDays.length > 0) {
      rootElement.append(
        this.buildSectionTitle("Clock & Extra Rounds"),
        this.buildDayList(clockDays, "clock")
      );
    }

    if (digitalDays.length > 0) {
      rootElement.append(
        this.buildSectionTitle("Digital Counting Chanting"),
        this.buildDayList(digitalDays, "digital")
      );
    }
  },

  buildSectionTitle(text) {
    const title = document.createElement("h2");
    title.className = "result-section-title";
    title.textContent = text;
    return title;
  },

  buildDayList(days, mode) {
    const wrap = document.createElement("div");
    wrap.className = "result-section-list";

    days.forEach(
      function (day) {
        wrap.append(this.buildDayCard(day, mode));
      }.bind(this)
    );

    return wrap;
  },

  buildDayCard(day, mode) {
    const card = document.createElement("article");
    card.className = "result-day box";

    const head = document.createElement("div");
    head.className = "result-day__head";

    const title = document.createElement("h3");
    title.className = "result-day__title";
    title.textContent = window.JapaTime.formatDateLabel(day.dateKey);

    const summary = document.createElement("p");
    summary.className = "result-day__summary";

    if (mode === "digital") {
      const count = day.roundCount || (day.rounds ? day.rounds.length : 0);
      summary.textContent =
        count +
        " rounds · total " +
        window.JapaTime.formatElapsed(day.totalMs) +
        " min";
    } else {
      const extraCount = Array.isArray(day.extraRounds)
        ? day.extraRounds.length
        : day.extraCount || 0;
      const mainCount = day.roundCount || (day.rounds ? day.rounds.length : 0);
      summary.textContent =
        mainCount +
        " rounds" +
        (extraCount > 0 ? " + " + extraCount + " extra" : "") +
        " · total " +
        window.JapaTime.formatElapsed(day.totalMs) +
        " min";
    }

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

    if (mode === "clock") {
      const extraCount = Array.isArray(day.extraRounds)
        ? day.extraRounds.length
        : 0;
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
    }

    card.append(head, list);
    return card;
  },
};
