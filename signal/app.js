(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const locale = params.get("locale") === "fr" ? "fr" : "en";
  const theme = params.get("theme") === "light" ? "light" : "dark";
  document.documentElement.lang = locale;
  document.documentElement.dataset.theme = theme;

  const COPY = {
    en: {
      kicker: "BI mini-games",
      title: "Train the instincts behind reliable models.",
      lede: "Short drills on grain, star schemas, SCD2, and join traps — the mistakes that quietly break dashboards.",
      back: "All games",
      next: "Next",
      submit: "Check",
      again: "Play again",
      hub: "Back to games",
      progress: "{n} / {total}",
      score: "Score",
      clickRole: "Tap a table to cycle: unused → fact → dimension.",
      roles: { unused: "Unused", fact: "Fact", dim: "Dimension" },
      games: {
        grain: {
          title: "Grain",
          blurb: "Name the exact thing one row represents.",
        },
        star: {
          title: "Star schema",
          blurb: "Place facts and dimensions. Leave staging out.",
        },
        scd2: {
          title: "SCD2",
          blurb: "Keep history when a dimension attribute changes.",
        },
        trap: {
          title: "Join traps",
          blurb: "Spot the join that inflates or drops measures.",
        },
      },
    },
    fr: {
      kicker: "Mini-jeux BI",
      title: "Entraîner l’instinct derrière des modèles fiables.",
      lede: "Exercices courts sur le grain, le schéma en étoile, SCD2 et les pièges de jointure — les erreurs qui cassent les tableaux de bord en silence.",
      back: "Tous les jeux",
      next: "Suivant",
      submit: "Vérifier",
      again: "Rejouer",
      hub: "Retour aux jeux",
      progress: "{n} / {total}",
      score: "Score",
      clickRole: "Touchez une table pour cycler : hors modèle → fait → dimension.",
      roles: { unused: "Hors modèle", fact: "Fait", dim: "Dimension" },
      games: {
        grain: {
          title: "Grain",
          blurb: "Nommer exactement ce qu’une ligne représente.",
        },
        star: {
          title: "Schéma en étoile",
          blurb: "Placer faits et dimensions. Laisser le staging dehors.",
        },
        scd2: {
          title: "SCD2",
          blurb: "Conserver l’historique quand un attribut de dimension change.",
        },
        trap: {
          title: "Pièges de jointure",
          blurb: "Repérer la jointure qui gonfle ou perd des mesures.",
        },
      },
    },
  };

  const GAMES = {
    grain: {
      type: "mcq",
      rounds: [
        {
          en: {
            context:
              "Retail orders. The business wants line-level margin, discounts, and units.",
            prompt: "What is the grain of the sales fact?",
            options: [
              { id: "a", label: "One row per order" },
              { id: "b", label: "One row per order line" },
              { id: "c", label: "One row per customer per day" },
              { id: "d", label: "One row per product" },
            ],
            answer: "b",
            explain:
              "Margin and units live on the line. An order-level fact would force you to allocate discounts and hide mix.",
          },
          fr: {
            context:
              "Commandes retail. Le métier veut marge, remises et unités au niveau ligne.",
            prompt: "Quel est le grain de la table de faits ventes ?",
            options: [
              { id: "a", label: "Une ligne par commande" },
              { id: "b", label: "Une ligne par ligne de commande" },
              { id: "c", label: "Une ligne par client et par jour" },
              { id: "d", label: "Une ligne par produit" },
            ],
            answer: "b",
            explain:
              "La marge et les unités vivent sur la ligne. Un fait au niveau commande imposerait d’allouer les remises et masquerait le mix.",
          },
        },
        {
          en: {
            context:
              "A weekly executive pack: revenue, orders, and active customers for the week.",
            prompt: "Which grain belongs in a weekly snapshot mart — not the atomic fact?",
            options: [
              { id: "a", label: "One row per order line" },
              { id: "b", label: "One row per customer" },
              { id: "c", label: "One row per week per region" },
              { id: "d", label: "One row per click" },
            ],
            answer: "c",
            explain:
              "The pack is already aggregated. Keep the atomic fact elsewhere; the mart can sit at week × region.",
          },
          fr: {
            context:
              "Un pack exécutif hebdo : CA, commandes et clients actifs de la semaine.",
            prompt:
              "Quel grain appartient à un mart snapshot hebdo — pas au fait atomique ?",
            options: [
              { id: "a", label: "Une ligne par ligne de commande" },
              { id: "b", label: "Une ligne par client" },
              { id: "c", label: "Une ligne par semaine et par région" },
              { id: "d", label: "Une ligne par clic" },
            ],
            answer: "c",
            explain:
              "Le pack est déjà agrégé. Le fait atomique reste ailleurs ; le mart peut vivre à semaine × région.",
          },
        },
        {
          en: {
            context:
              "Inventory balances are taken every night. Stakeholders ask “how much stock did we have on Tuesday?”",
            prompt: "Correct grain for a stock snapshot fact?",
            options: [
              { id: "a", label: "One row per movement" },
              { id: "b", label: "One row per SKU per warehouse per day" },
              { id: "c", label: "One row per warehouse" },
              { id: "d", label: "One row per SKU (current only)" },
            ],
            answer: "b",
            explain:
              "A balance is a snapshot. Movements are a different process. Current-only SKU rows cannot answer Tuesday.",
          },
          fr: {
            context:
              "Les stocks sont photographiés chaque nuit. On demande « combien de stock mardi ? »",
            prompt: "Bon grain pour un fait snapshot de stock ?",
            options: [
              { id: "a", label: "Une ligne par mouvement" },
              { id: "b", label: "Une ligne par SKU, entrepôt et jour" },
              { id: "c", label: "Une ligne par entrepôt" },
              { id: "d", label: "Une ligne par SKU (actuel seulement)" },
            ],
            answer: "b",
            explain:
              "Un solde est un snapshot. Les mouvements sont un autre processus. Une ligne SKU « actuelle » ne répond pas à mardi.",
          },
        },
      ],
    },
    star: {
      type: "star",
      rounds: [
        {
          en: {
            prompt: "Build the sales star. Leave the staging table out.",
            explain:
              "ORDER_LINES is the fact (numeric measures at line grain). Customers, products, and dates are dimensions. STG_ORDERS_RAW stays in staging.",
          },
          fr: {
            prompt: "Construire l’étoile ventes. Laisser le staging dehors.",
            explain:
              "ORDER_LINES est le fait (mesures numériques au grain ligne). Clients, produits et dates sont des dimensions. STG_ORDERS_RAW reste en staging.",
          },
          tables: [
            { id: "ORDER_LINES", role: "fact" },
            { id: "CUSTOMERS", role: "dim" },
            { id: "PRODUCTS", role: "dim" },
            { id: "DATES", role: "dim" },
            { id: "STG_ORDERS_RAW", role: "unused" },
          ],
        },
        {
          en: {
            prompt: "Support tickets. Which tables belong in the star?",
            explain:
              "TICKET_EVENTS is the fact if you analyze events. Agents and queues are dimensions. The raw Zendesk dump is not modeled yet.",
          },
          fr: {
            prompt: "Tickets support. Quelles tables dans l’étoile ?",
            explain:
              "TICKET_EVENTS est le fait si on analyse des événements. Agents et files sont des dimensions. Le dump Zendesk brut n’est pas encore modélisé.",
          },
          tables: [
            { id: "TICKET_EVENTS", role: "fact" },
            { id: "AGENTS", role: "dim" },
            { id: "QUEUES", role: "dim" },
            { id: "DATES", role: "dim" },
            { id: "RAW_ZENDESK_JSON", role: "unused" },
          ],
        },
        {
          en: {
            prompt: "Campaign performance. Watch for a second fact.",
            explain:
              "IMPRESSIONS and CLICKS can both be facts (different grains). CAMPAIGNS and DATES are dimensions. The export file is not a model object.",
          },
          fr: {
            prompt: "Performance campagnes. Attention au second fait.",
            explain:
              "IMPRESSIONS et CLICKS peuvent tous deux être des faits (grains différents). CAMPAIGNS et DATES sont des dimensions. Le fichier d’export n’est pas un objet de modèle.",
          },
          tables: [
            { id: "IMPRESSIONS", role: "fact" },
            { id: "CLICKS", role: "fact" },
            { id: "CAMPAIGNS", role: "dim" },
            { id: "DATES", role: "dim" },
            { id: "ADS_CSV_EXPORT", role: "unused" },
          ],
        },
      ],
    },
    scd2: {
      type: "mcq",
      rounds: [
        {
          en: {
            context:
              "A customer moves from Lyon to Sherbrooke. Finance still needs last year’s region.",
            prompt: "How should DIM_CUSTOMER store the city change?",
            options: [
              { id: "a", label: "Overwrite city (SCD1)" },
              {
                id: "b",
                label: "Close the old row, insert a new one with valid_from / valid_to (SCD2)",
              },
              { id: "c", label: "Add a city_previous column (SCD3)" },
              { id: "d", label: "Delete and recreate the customer" },
            ],
            answer: "b",
            explain:
              "Point-in-time region needs a new versioned row. SCD1 loses history; SCD3 only keeps one previous value.",
          },
          fr: {
            context:
              "Un client déménage de Lyon à Sherbrooke. La finance a encore besoin de la région de l’an dernier.",
            prompt: "Comment DIM_CUSTOMER doit-elle stocker le changement de ville ?",
            options: [
              { id: "a", label: "Écraser la ville (SCD1)" },
              {
                id: "b",
                label:
                  "Fermer l’ancienne ligne, en insérer une nouvelle avec valid_from / valid_to (SCD2)",
              },
              { id: "c", label: "Ajouter une colonne city_previous (SCD3)" },
              { id: "d", label: "Supprimer et recréer le client" },
            ],
            answer: "b",
            explain:
              "La région à une date donnée exige une ligne versionnée. Le SCD1 perd l’historique ; le SCD3 ne garde qu’une valeur précédente.",
          },
        },
        {
          en: {
            context: "Email typos are corrected daily. Nobody reports on old emails.",
            prompt: "Best treatment for email?",
            options: [
              { id: "a", label: "SCD2 — version every correction" },
              { id: "b", label: "SCD1 — overwrite in place" },
              { id: "c", label: "Put email on the fact table" },
              { id: "d", label: "New customer key for each typo" },
            ],
            answer: "b",
            explain:
              "If history is noise, overwrite. Versioning typos explodes the dimension and helps no report.",
          },
          fr: {
            context:
              "Les fautes d’email sont corrigées chaque jour. Personne ne pilote sur les anciens emails.",
            prompt: "Meilleur traitement pour l’email ?",
            options: [
              { id: "a", label: "SCD2 — versionner chaque correction" },
              { id: "b", label: "SCD1 — écraser sur place" },
              { id: "c", label: "Mettre l’email sur la table de faits" },
              { id: "d", label: "Nouvelle clé client à chaque faute" },
            ],
            answer: "b",
            explain:
              "Si l’historique est du bruit, on écrase. Versionner les fautes explose la dimension sans servir aucun rapport.",
          },
        },
        {
          en: {
            context:
              "You already have SCD2 customers. A fact row from 2024 must show the 2024 city.",
            prompt: "What must the fact store?",
            options: [
              { id: "a", label: "Only the natural customer_id" },
              { id: "b", label: "The surrogate customer_sk of the version valid on the event date" },
              { id: "c", label: "The latest customer_sk, always" },
              { id: "d", label: "Nothing — join on name" },
            ],
            answer: "b",
            explain:
              "Facts point at a version. Joining only on natural keys and “current” flags restates history.",
          },
          fr: {
            context:
              "Les clients sont déjà en SCD2. Une ligne de fait 2024 doit montrer la ville 2024.",
            prompt: "Que doit stocker le fait ?",
            options: [
              { id: "a", label: "Seulement le customer_id naturel" },
              {
                id: "b",
                label:
                  "Le customer_sk de la version valide à la date de l’événement",
              },
              { id: "c", label: "Toujours le dernier customer_sk" },
              { id: "d", label: "Rien — jointure sur le nom" },
            ],
            answer: "b",
            explain:
              "Le fait pointe vers une version. Joindre uniquement sur la clé naturelle et le flag « current » réécrit l’histoire.",
          },
        },
      ],
    },
    trap: {
      type: "mcq",
      rounds: [
        {
          en: {
            context:
              "You join fact_sales to fact_budget on customer_id only, then SUM(sales) and SUM(budget).",
            prompt: "What happens?",
            options: [
              { id: "a", label: "Both measures stay correct" },
              { id: "b", label: "A fan trap — sales (or budget) inflate" },
              { id: "c", label: "A chasm trap — rows disappear" },
              { id: "d", label: "SCD2 versions collide" },
            ],
            answer: "b",
            explain:
              "Two facts at different grains joined on a shared dimension without a bridge duplicate rows. Aggregate separately, then combine.",
          },
          fr: {
            context:
              "Vous joignez fact_sales à fact_budget seulement sur customer_id, puis SUM(sales) et SUM(budget).",
            prompt: "Que se passe-t-il ?",
            options: [
              { id: "a", label: "Les deux mesures restent justes" },
              { id: "b", label: "Un fan trap — ventes ou budget gonflent" },
              { id: "c", label: "Un chasm trap — des lignes disparaissent" },
              { id: "d", label: "Les versions SCD2 s’entrechoquent" },
            ],
            answer: "b",
            explain:
              "Deux faits à grains différents joints sur une dimension partagée sans pont dupliquent les lignes. Agréger séparément, puis combiner.",
          },
        },
        {
          en: {
            context:
              "Customers 1—N accounts 1—N invoices. You inner-join customers to invoices through accounts, but some customers have no account yet.",
            prompt: "The customer count from that join is too low. Why?",
            options: [
              { id: "a", label: "Fan trap" },
              { id: "b", label: "Chasm trap — inner join across a missing one-to-many" },
              { id: "c", label: "Wrong SCD type" },
              { id: "d", label: "Double-counting dates" },
            ],
            answer: "b",
            explain:
              "A chasm trap drops parents that have no children. Use a bridge or start from the customer dimension with outer joins.",
          },
          fr: {
            context:
              "Clients 1—N comptes 1—N factures. Jointure inner clients → factures via comptes, mais certains clients n’ont pas encore de compte.",
            prompt: "Le nombre de clients issu de cette jointure est trop bas. Pourquoi ?",
            options: [
              { id: "a", label: "Fan trap" },
              {
                id: "b",
                label: "Chasm trap — inner join sur une relation 1-N absente",
              },
              { id: "c", label: "Mauvais type de SCD" },
              { id: "d", label: "Double comptage des dates" },
            ],
            answer: "b",
            explain:
              "Un chasm trap perd les parents sans enfants. Pont, ou partir de la dimension client avec des jointures externes.",
          },
        },
        {
          en: {
            context:
              "Revenue looks 4× too high after adding a product-category hierarchy table that has four rows per product.",
            prompt: "First check?",
            options: [
              { id: "a", label: "Filter to one category before joining, or join to a unique product key" },
              { id: "b", label: "Switch the fact to SCD2" },
              { id: "c", label: "Delete the date dimension" },
              { id: "d", label: "Average the revenue instead of summing" },
            ],
            answer: "a",
            explain:
              "A snowflake/hierarchy that is not unique on the join key fans the fact. Fix uniqueness or pre-filter; don’t “fix” it with AVG.",
          },
          fr: {
            context:
              "Le CA est ~4× trop haut après ajout d’une hiérarchie catégorie (4 lignes par produit).",
            prompt: "Premier contrôle ?",
            options: [
              {
                id: "a",
                label:
                  "Filtrer une catégorie avant de joindre, ou joindre sur une clé produit unique",
              },
              { id: "b", label: "Passer le fait en SCD2" },
              { id: "c", label: "Supprimer la dimension date" },
              { id: "d", label: "Remplacer SUM par AVG" },
            ],
            answer: "a",
            explain:
              "Une hiérarchie non unique sur la clé de jointure ventile le fait. Corriger l’unicité ou pré-filtrer — pas « corriger » avec AVG.",
          },
        },
      ],
    },
  };

  const GAME_IDS = ["grain", "star", "scd2", "trap"];
  const t = COPY[locale];
  const root = document.getElementById("app");

  const state = {
    view: "hub",
    gameId: null,
    index: 0,
    score: 0,
    picked: null,
    revealed: false,
    roles: {},
  };

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    const props = attrs || {};
    const kids = children == null ? [] : Array.isArray(children) ? children : [children];
    Object.keys(props).forEach(function (key) {
      const value = props[key];
      if (value == null || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.slice(0, 2) === "on" && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "disabled" || key === "checked") node[key] = value;
      else node.setAttribute(key, String(value));
    });
    kids.forEach(function (child) {
      if (child == null || child === false) return;
      node.appendChild(
        child.nodeType ? child : document.createTextNode(String(child))
      );
    });
    return node;
  }

  function pulse() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 12");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 0 6 L 4.5 6 L 6 10 L 9 2 L 10.5 6 L 16 6");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    return svg;
  }

  function brand() {
    return el("div", { class: "brand" }, [
      pulse(),
      el("span", { class: "brand-name" }, "Signal"),
      el("span", { class: "brand-kicker" }, t.kicker),
    ]);
  }

  function roundCopy() {
    const game = GAMES[state.gameId];
    const round = game.rounds[state.index];
    if (game.type === "star") {
      return { prompt: round[locale].prompt, explain: round[locale].explain };
    }
    return round[locale];
  }

  function start(gameId) {
    const game = GAMES[gameId];
    const roles = {};
    if (game.type === "star") {
      game.rounds[0].tables.forEach(function (table) {
        roles[table.id] = "unused";
      });
    }
    state.view = "play";
    state.gameId = gameId;
    state.index = 0;
    state.score = 0;
    state.picked = null;
    state.revealed = false;
    state.roles = roles;
    render();
  }

  function goHub() {
    state.view = "hub";
    state.gameId = null;
    render();
  }

  function cycleRole(id) {
    if (state.revealed) return;
    const order = ["unused", "fact", "dim"];
    const current = state.roles[id] || "unused";
    state.roles[id] = order[(order.indexOf(current) + 1) % order.length];
    render();
  }

  function checkMcq() {
    const copy = roundCopy();
    state.revealed = true;
    if (state.picked === copy.answer) state.score += 1;
    render();
  }

  function checkStar() {
    const round = GAMES[state.gameId].rounds[state.index];
    const ok = round.tables.every(function (table) {
      return (state.roles[table.id] || "unused") === table.role;
    });
    state.revealed = true;
    if (ok) state.score += 1;
    render();
  }

  function advance() {
    const game = GAMES[state.gameId];
    if (state.index + 1 >= game.rounds.length) {
      state.view = "result";
      render();
      return;
    }
    state.index += 1;
    state.picked = null;
    state.revealed = false;
    state.roles = {};
    if (game.type === "star") {
      game.rounds[state.index].tables.forEach(function (table) {
        state.roles[table.id] = "unused";
      });
    }
    render();
  }

  function renderHub() {
    return el("div", { class: "wrap" }, [
      brand(),
      el("h1", null, t.title),
      el("p", { class: "lede" }, t.lede),
      el(
        "div",
        { class: "grid" },
        GAME_IDS.map(function (id, index) {
          const meta = t.games[id];
          return el(
            "button",
            { class: "card", type: "button", onClick: function () { start(id); } },
            [
              el("span", { class: "card-index" }, String(index + 1).padStart(2, "0")),
              el("h2", null, meta.title),
              el("p", null, meta.blurb),
            ]
          );
        })
      ),
    ]);
  }

  function renderPlay() {
    const game = GAMES[state.gameId];
    const total = game.rounds.length;
    const copy = roundCopy();
    const body =
      game.type === "star" ? renderStar(copy) : renderMcq(copy);

    return el("div", { class: "wrap" }, [
      brand(),
      el("div", { class: "toolbar" }, [
        el("button", { class: "back", type: "button", onClick: goHub }, t.back),
        el(
          "span",
          { class: "progress" },
          t.progress.replace("{n}", String(state.index + 1)).replace("{total}", String(total))
        ),
      ]),
      el("div", { class: "panel" }, body),
    ]);
  }

  function renderMcq(copy) {
    const kids = [
      copy.context ? el("p", { class: "context" }, copy.context) : null,
      el("p", { class: "prompt" }, copy.prompt),
      el(
        "div",
        { class: "options" },
        copy.options.map(function (option) {
          let dataState = "";
          if (state.picked === option.id) dataState = "picked";
          if (state.revealed && option.id === copy.answer) dataState = "ok";
          else if (state.revealed && state.picked === option.id) dataState = "bad";
          return el(
            "button",
            {
              class: "option",
              type: "button",
              dataset: { state: dataState },
              disabled: state.revealed,
              onClick: function () {
                if (state.revealed) return;
                state.picked = option.id;
                render();
              },
            },
            option.label
          );
        })
      ),
    ];
    if (state.revealed) kids.push(el("p", { class: "explain" }, copy.explain));
    kids.push(
      el("div", { class: "actions" }, [
        state.revealed
          ? el("button", { class: "primary", type: "button", onClick: advance }, t.next)
          : el(
              "button",
              {
                class: "primary",
                type: "button",
                disabled: !state.picked,
                onClick: checkMcq,
              },
              t.submit
            ),
      ])
    );
    return kids;
  }

  function renderStar(copy) {
    const round = GAMES[state.gameId].rounds[state.index];
    const kids = [
      el("p", { class: "prompt" }, copy.prompt),
      el("p", { class: "context" }, t.clickRole),
      el(
        "div",
        { class: "tables" },
        round.tables.map(function (table) {
          const role = state.roles[table.id] || "unused";
          const chipState = state.revealed
            ? role === table.role
              ? "ok"
              : "bad"
            : role;
          return el(
            "button",
            {
              class: "chip",
              type: "button",
              dataset: { role: chipState },
              disabled: state.revealed,
              onClick: function () {
                cycleRole(table.id);
              },
            },
            [
              el("strong", null, table.id),
              el(
                "span",
                null,
                state.revealed
                  ? t.roles[table.role] +
                      (role === table.role ? "" : " ← " + t.roles[role])
                  : t.roles[role]
              ),
            ]
          );
        })
      ),
    ];
    if (state.revealed) kids.push(el("p", { class: "explain" }, copy.explain));
    kids.push(
      el("div", { class: "actions" }, [
        state.revealed
          ? el("button", { class: "primary", type: "button", onClick: advance }, t.next)
          : el("button", { class: "primary", type: "button", onClick: checkStar }, t.submit),
      ])
    );
    return kids;
  }

  function renderResult() {
    const total = GAMES[state.gameId].rounds.length;
    return el("div", { class: "wrap" }, [
      brand(),
      el("div", { class: "panel" }, [
        el("p", { class: "context" }, t.score),
        el("p", { class: "score" }, state.score + " / " + total),
        el("div", { class: "actions" }, [
          el(
            "button",
            {
              class: "primary",
              type: "button",
              onClick: function () {
                start(state.gameId);
              },
            },
            t.again
          ),
          el("button", { class: "ghost", type: "button", onClick: goHub }, t.hub),
        ]),
      ]),
    ]);
  }

  function render() {
    root.replaceChildren(
      state.view === "hub"
        ? renderHub()
        : state.view === "result"
          ? renderResult()
          : renderPlay()
    );
  }

  render();
})();
