import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

// Images of the chapter in the url. The MangaOni Plus extension appends the following chapters
// to the same reader as `.mop-chapter[data-id]`, while the chapter the page was opened with
// stays as direct children of #slider.
function chapterImages($c: ChibiGenerator<unknown>) {
  return $c.querySelectorAll(
    $c
      .string('#slider > .mop-chapter[data-id="')
      .concat($c.url().urlPart(5).run())
      .concat('"] img, #slider:not(:has(> .mop-chapter[data-id="')
      .concat($c.url().urlPart(5).run())
      .concat('"])) > img')
      .run(),
  );
}

export const MangaOni: PageInterface = {
  name: 'MangaOni',
  domain: 'https://manga-oni.com',
  languages: ['Spanish'],
  type: 'manga',
  urls: {
    match: ['*://manga-oni.com/*'],
  },
  search: 'https://manga-oni.com/buscar?s={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('lector').run(),
          $c.url().urlPart(5).matches('^\\d+$').run(),
          $c.querySelector('#ccap').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1 a.ajp').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('h1 a.ajp').getAttribute('href').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.title().regex('cap[ií]tulo\\s+(\\d+(?:\\.\\d+)?)', 1, 'i').number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.terminado a.rs')
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        condition: $c => $c.url().urlPart(6).equals('cascada').run(),
        current: $c => $c.exec(chapterImages).countAbove().run(),
        total: $c => $c.exec(chapterImages).length().run(),
      },
      {
        current: $c => $c.querySelector('#pag').text().number().run(),
        total: $c => $c.querySelector('#pag2').text().number().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).matches('^(manga|manhwa|manhua|oneshot)$').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
          $c.querySelector('h1.post-title a.ajp').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1.post-title a.ajp').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('[property="og:image"]')
        .ifNotReturn()
        .getAttribute('content')
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('h1.post-title').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#c_list a[href*="/lector/"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('[data-num]').getAttribute('data-num').number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      // The title only changes when the chapter changes without a page load
      return $c.detectChanges($c.title().run(), $c.trigger().run()).domReady().trigger().run();
    },
  },
};
