# Assets oficiales BUXDEV

Estos archivos proceden del paquete maestro de marca ubicado fuera de este
checkout en `brand/BUXDEV/`.

- `logo-on-light.svg`: copia sin modificaciones de
  `SVG/logo predominante negro.svg` (SHA-256
  `6d1edc979ef24fc3f20edf713910bbaf6523298ab1d033e26a68bb648d914603`).
- `logo-on-dark.svg`: variante azul y blanca de la esquina superior derecha de
  la pagina 4 de `BUXDEV.pdf` (SHA-256 del PDF
  `20b696c7e00c135ce6250277f38577b5dd1beb0b06523cd4410fc5cbe188838b`).
- `mark-on-light.svg`: isotipo extraido sin alterar sus trazos ni colores del
  SVG oficial usado por `logo-on-light.svg`.
- `mark-on-dark.svg`: isotipo extraido de la misma variante oficial usada por
  `logo-on-dark.svg`.

La pagina 4 se separo con `pdfseparate` y se importo con Inkscape 1.4.4. En el
SVG importado, el logotipo oscuro corresponde exactamente a los objetos
`path31` a `path39`; el isotipo corresponde a `path31`, `path38` y `path39`.
Inkscape agrupo la seleccion y ajusto el `viewBox` a sus limites. No se
redibujaron ni simplificaron los paths.
