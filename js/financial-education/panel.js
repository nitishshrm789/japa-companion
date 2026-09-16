(function createFinancialEducationPanel() {
  "use strict";

  const Education = window.JapaFinancialEducation;
  const Store = window.JapaFinancialEducationStore;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text != null) {
      node.textContent = text;
    }
    return node;
  }

  function list(items, className) {
    const listElement = element("ul", className);
    items.forEach(function (item) {
      listElement.append(element("li", "", item));
    });
    return listElement;
  }

  function articleSection(title, icon, content) {
    const section = element("section", "financial-education-section");
    section.append(element("h3", "financial-education-section__title", icon + " " + title));
    if (typeof content === "string") {
      section.append(element("p", "", content));
    } else {
      section.append(content);
    }
    return section;
  }

  window.JapaFinancialEducationPanel = {
    screen: null,
    returnFocus: null,
    activeTopicId: null,

    ensureScreen() {
      if (this.screen && document.body.contains(this.screen)) {
        return;
      }
      this.screen = document.getElementById("financial-education-screen");
      if (!this.screen) {
        this.screen = element("div", "financial-screen financial-education-screen");
        this.screen.id = "financial-education-screen";
        this.screen.hidden = true;
        this.screen.setAttribute("role", "dialog");
        this.screen.setAttribute("aria-modal", "true");
        this.screen.setAttribute("aria-labelledby", "financial-education-title");
        document.body.append(this.screen);
      }
      if (!this.boundEscape) {
        document.addEventListener(
          "keydown",
          function (event) {
            if (event.key !== "Escape" || !this.screen || this.screen.hidden) {
              return;
            }
            if (this.activeTopicId) {
              this.showCatalog();
            } else {
              this.close();
            }
          }.bind(this)
        );
        this.boundEscape = true;
      }
    },

    open(trigger) {
      this.ensureScreen();
      this.returnFocus = trigger || document.activeElement;
      this.screen.hidden = false;
      document.body.classList.add("is-financial-form-open");
      this.showCatalog();
    },

    close() {
      if (!this.screen) {
        return;
      }
      this.activeTopicId = null;
      this.screen.hidden = true;
      document.body.classList.remove("is-financial-form-open");
      if (this.returnFocus && typeof this.returnFocus.focus === "function") {
        this.returnFocus.focus();
      }
    },

    buildBar(backLabel, handler) {
      const bar = element("div", "financial-screen__bar financial-education-bar");
      const button = element("button", "financial-screen__back", backLabel);
      button.type = "button";
      button.addEventListener("click", handler);
      bar.append(button);
      return { bar: bar, button: button };
    },

    showCatalog() {
      this.activeTopicId = null;
      this.screen.replaceChildren();
      const navigation = this.buildBar("Back", this.close.bind(this));
      const content = element("div", "financial-education-catalog");
      const heading = element("h2", "financial-education-title", "Financial Must-Remember Points");
      heading.id = "financial-education-title";
      const subtitle = element("p", "financial-education-subtitle", "Simple financial habits and important points to remember when managing your money.");
      const grid = element("div", "financial-education-grid");
      grid.setAttribute("aria-label", "Financial education topics");

      Education.getTopics().forEach(
        function (topic) {
          const button = element("button", "financial-education-card");
          button.type = "button";
          button.dataset.topicId = topic.id;
          button.append(
            element("span", "financial-education-card__icon", topic.icon),
            element("span", "financial-education-card__title", topic.title),
            element("span", "financial-education-card__description", topic.description)
          );
          button.addEventListener("click", this.showTopic.bind(this, topic.id));
          grid.append(button);
        }.bind(this)
      );

      const disclaimer = element("p", "financial-education-disclaimer", "Educational information only. It is not personalized financial advice and does not guarantee returns or outcomes.");
      content.append(heading, subtitle, grid, disclaimer);
      this.screen.append(navigation.bar, content);
      navigation.button.focus();
    },

    showTopic(topicId) {
      const topic = Education.getTopic(topicId);
      if (!topic) {
        return;
      }
      this.activeTopicId = topicId;
      this.screen.replaceChildren();
      const navigation = this.buildBar("← Back", this.showCatalog.bind(this));
      const article = element("article", "financial-education-article");
      const heading = element("h2", "financial-education-article__title", topic.title);
      heading.id = "financial-education-title";
      article.append(heading, element("p", "financial-education-introduction", topic.introduction));
      article.append(articleSection("Must Remember", "⭐", list(topic.remember, "financial-education-list")));
      article.append(articleSection("Why It Matters", "💡", topic.why));
      article.append(articleSection("Common Mistakes", "⚠️", list(topic.mistakes, "financial-education-list financial-education-list--mistakes")));
      if (topic.extra.length) {
        article.append(articleSection(topic.extraTitle || "Example", "🧮", list(topic.extra, "financial-education-list financial-education-list--plain")));
      }
      article.append(this.buildChecklist(topic));
      article.append(articleSection("Important Note", "ℹ️", topic.note));
      this.screen.append(navigation.bar, article);
      this.screen.scrollTop = 0;
      navigation.button.focus();
    },

    buildChecklist(topic) {
      const saved = Store.load(topic.id);
      const wrap = element("section", "financial-education-section");
      wrap.append(element("h3", "financial-education-section__title", "✅ Quick Checklist"));
      const checklist = element("div", "financial-education-checklist");

      topic.checklist.forEach(function (text, index) {
        const label = element("label", "financial-education-check");
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = saved.indexOf(String(index)) !== -1;
        input.dataset.checklistIndex = String(index);
        input.addEventListener("change", function () {
          Store.setChecked(topic.id, index, input.checked);
          label.classList.toggle("is-checked", input.checked);
        });
        label.classList.toggle("is-checked", input.checked);
        label.append(input, element("span", "", text));
        checklist.append(label);
      });
      wrap.append(checklist);
      return wrap;
    },
  };
})();
