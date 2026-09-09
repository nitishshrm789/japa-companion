/**
 * Round history list with optional start number and max count.
 * Clock: start 1, max 16. Extra Rounds: start 17, no max.
 */
window.JapaRounds = {
  MAX_ROUNDS: 16,
  EXTRA_START: 17,

  create(listElement, emptyElement, onChange, options) {
    const settings = options || {};
    const startNumber =
      typeof settings.startNumber === "number" ? settings.startNumber : 1;
    const maxRounds =
      typeof settings.maxRounds === "number" ? settings.maxRounds : Infinity;

    /** @type {{ id: string, elapsedMs: number }[]} */
    let rounds = [];

    function createId() {
      return Date.now() + "-" + Math.random().toString(16).slice(2);
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

      rounds.forEach(function (round, index) {
        const roundNumber = startNumber + index;
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
        deleteBtn.setAttribute("aria-label", "Cancel round " + roundNumber);
        deleteBtn.textContent = "X";
        deleteBtn.addEventListener("click", function () {
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
      return rounds.length < maxRounds;
    }

    function addRound(elapsedMs) {
      if (elapsedMs <= 0 || !canAddRound()) {
        return false;
      }

      rounds.push({
        id: createId(),
        elapsedMs: elapsedMs,
      });
      render();
      return true;
    }

    function removeRound(id) {
      rounds = rounds.filter(function (round) {
        return round.id !== id;
      });
      render();
    }

    function setRounds(nextRounds) {
      rounds = Array.isArray(nextRounds) ? nextRounds.slice() : [];
      if (Number.isFinite(maxRounds)) {
        rounds = rounds.slice(0, maxRounds);
      }
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
      addRound: addRound,
      removeRound: removeRound,
      setRounds: setRounds,
      clearRounds: clearRounds,
      getRounds: getRounds,
      getCount: getCount,
      canAddRound: canAddRound,
      startNumber: startNumber,
    };
  },
};
