# [`atdr.eu`](https://atdr.eu)

A static-site URL shortener using [suri](https://github.com/surishortlink/suri)

## Manage links

Links are managed through [`src/links.json`](src/links.json)

To add a new link

1. (_Optional_)
   [Generate a 5-character random key](https://www.random.org/strings/?num=1&len=5&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new)
2. Edit `src/links.json`
   [directly in GitHub](https://github.com/atdr/atdr.eu/edit/main/src/links.json)
   (or locally)

Every change is checked by CI (lint, `links.json` validation, and a Suri build)
before it deploys. Run the same checks locally with `npm run check`.
