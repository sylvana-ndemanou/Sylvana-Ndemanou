# Signal

Mini-jeux d'œil, de mémoire et de jugement pour l'**intelligence d'affaires**, un socle d'**ingénierie des données**, et une piste **Snowflake** (warehouses, micro-partitions, Time Travel, clone, streams).

Le rythme vient de sites comme [Dialed](https://dialed.gg/games) : une mécanique, cinq manches, un score sur 50, un verdict qui a de la voix. Le son est analogique, synthétisé ici. Dans le cadre sombre, des lucioles de signal suivent le curseur et s'éteignent dès qu'on sort.

**Facile / Costaud / Brutal** : ce ne sont **pas** les mêmes manches. Chaque niveau a son propre jeu de situations. Facile reste large (3 manches). Costaud et Brutal ont chacun cinq manches inédites, plus serrées, et la pression monte encore d'une manche à l'autre.

## Intelligence d'affaires

1. **Anomalie** — trouver la barre qui n'appartient pas à la série
2. **Graphique** — choisir le dessin qui rend la question lisible
3. **Entonnoir** — empiler un parcours, puis verser le trafic
4. **Mémoire** — un tableau de bord pendant cinq secondes, puis le slide se ferme
5. **Bruit** — tendance, saison, rupture, ou simple soubresaut ?

## Ingénierie & architecture

6. **Schéma** — glisser-déposer l'étoile, poser un ticket OLTP, SCD Type 2, arracher des colonnes
7. **Pipeline** — jobs sur un convoyeur, un paquet qui explose au premier quai menteur
8. **Jointure** — INNER, LEFT, FULL ou ANTI selon la question métier
9. **Grain** — quelle clé, quel grain, et quand deux grains collés font exploser un SUM

## Snowflake

Notions tirées de la [documentation officielle](https://docs.snowflake.com/en/user-guide/intro-key-concepts) : architecture trois couches, virtual warehouses, micro-partitions, Time Travel / Fail-safe, zero-copy clone, streams et tasks.

10. **Entrepôt** — fader de taille, crédits qui cliquent, 60 secondes minimum, auto-suspend
11. **Élagage** — toucher les micro-partitions à scanner ; le silence, c'est du pruning
12. **Voyage** — bande Time Travel, AT / UNDROP / Fail-safe
13. **Clone** — glisser une table sur CLONE (pointeurs) ou CTAS (octets)
14. **Flux** — métronome de la task, HAS_DATA, l'offset n'avance que par un DML

Les meilleurs scores restent dans le navigateur, sans compte. Un bouton **Classement** (orbe lumineux, comme sur Dialed) ouvre le tableau Facile / Costaud / Brutal / Aujourd’hui : rang, initiales, score. Un bouton coupe le son.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre [http://127.0.0.1:4567](http://127.0.0.1:4567).

Signal n’est **pas** une carte dans Réalisations : c’est un onglet de la barre du [portfolio](https://sylvanandemanou.vercel.app) (`Accueil / Projets / À propos / Signal`). Les fichiers à copier dans le dépôt du portfolio sont dans `integrations/portfolio/`.

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui. Pas d'API, pas de base : tout le jeu tourne côté client. Le son est synthétisé dans le navigateur (Web Audio).
