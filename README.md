# Tab Mover

Chrome rozsirenie (MV3), ktore presunie aktivny tab, alebo vsetky oznacene
taby v danom okne, do vybranej grupy tabov - naprieč vsetkymi otvorenymi
oknami.

## Instalacia

1. `chrome://extensions`
2. zapnut "Rezim pre vyvojarov" / "Developer mode"
3. "Nacitat rozbalene" / "Load unpacked" -> vybrat tento adresar

## Pouzitie

1. Oznac taby, ktore chces presunut (alebo necha len jeden aktivny tab).
2. Klikni na ikonu rozsirenia.
3. V comba boxe vyber cielovu grupu (abecedne zoradeny zoznam vsetkych grup
   zo vsetkych okien). Ak uz niekedy bola pouzita nejaka grupa a stale
   existuje, je predvybrana.
4. Klikni **Presun**.

Ak je cielova grupa v inom okne, taby sa do neho najprv presunu a az potom
zaradia do grupy (Chrome nedovoluje priamo zoskupit tab s grupou v inom okne).
Pripnute (pinned) taby sa z presunu automaticky vynechaju.

## Struktura

| Subor | Popis |
| --- | --- |
| `manifest.json` | MV3 manifest, prava `tabs`, `tabGroups`, `storage` |
| `popup.html/css/js` | UI a volania `chrome.tabs` / `chrome.tabGroups` |
| `src/tab-mover-core.js` | ciste jadro logiky (vyber default grupy, planovanie presunu) bez Chrome API |
| `test/` | testy nad `node --test` |

## Testy

```sh
npm install
npm test
```
