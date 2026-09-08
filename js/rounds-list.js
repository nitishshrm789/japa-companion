/**
 * Manages round history: add, remove, and renumber after cancel.
 * Hard cap: 16 rounds (one full set of japa rounds).
 */
window.JapaRounds = {
  MAX_ROUNDS: 16,

  create(listElement, emptyElement, onChange) {
    /** @type {{ id: string, elapsedMs: number }[]} */
    let rounds = [];

    function createId() {
      return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function notify() {
      if (typeof onChange === "function") {
        onChange(getCount());
      }
    }

    function syncEmptyState() {
      emptyElement.hidden = rounds.length > 0;
    }

    function render() {
      listElement.replaceChildren();

      rounds.forEach((round, index) => {
        const roundNumber = index + 1;
        const item = document.createElement("li");
        item.className = "round-item";
        item.dataset.roundId = round.id;

        const text = document.createElement("span");
        text.className = "round-item__text";
        text.textContent = window.JapaTime.formatRoundLabel(
          roundNumber,
          round.elapsedMs
        );

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "round-item__delete";
        deleteBtn.setAttribute("aria-label", `Cancel round ${roundNumber}`);
        deleteBtn.textContent = "X";
        deleteBtn.addEventListener("click", () => {
          removeRound(round.id);
        });

        item.append(text, deleteBtn);
        listElement.append(item);
      });

      syncEmptyState();
      notify();
    }

    function getCount() {
      return rounds.length;
    }

    function canAddRound() {
      return rounds.length < window.JapaRounds.MAX_ROUNDS;
    }

    function addRound(elapsedMs) {
      if (elapsedMs <= 0 || !canAddRound()) {
        return false;
      }

      rounds.push({
        id: createId(),
        elapsedMs,
      });
      render();
      return true;
    }

    function removeRound(id) {
      rounds = rounds.filter((round) => round.id !== id);
      render();
    }

    function setRounds(nextRounds) {
      rounds = Array.isArray(nextRounds) ? nextRounds.slice() : [];
      render();
    }

    function clearRounds() {
      rounds = [];
      render();
    }

    function getRounds() {
      return rounds.slice();
    }

    syncEmptyState();
    notify();

    return {
      addRound,
      removeRound,
      setRounds,
      clearRounds,
      getRounds,
      getCount,
      canAddRound,
    };
  },
};
