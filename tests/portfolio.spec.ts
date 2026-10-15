import { test, expect } from '@playwright/test';
const projects=['byd','bars','milliy','asaka','chevrolet','pubg'];
test('home, assets, project links and responsive layout',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const failed:string[]=[];page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
 await page.goto('./');await expect(page.getByRole('heading',{level:1})).toContainText('STRATEGY.');await page.waitForTimeout(1600);
 await page.screenshot({path:`test-results/${testInfo.project.name}-home.png`,fullPage:false});
 for(const slug of projects)await expect(page.locator(`a.project-card[href="#/work/${slug}"]`)).toHaveCount(1);
 await page.locator('#work').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);
 await page.screenshot({path:`test-results/${testInfo.project.name}-work.png`,fullPage:false});
 await page.locator('.slot-0 .project-card').click();await expect(page).toHaveURL(/#\/work\/byd/);await expect(page.getByRole('heading',{level:1})).toHaveText('BYD');
 await page.goBack();await expect(page.getByRole('heading',{level:1})).toContainText('STRATEGY.');
 for(const image of await page.locator('img').all()){await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBeTruthy();}
 await expect(page.locator('.media-fallback')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
 expect(errors).toEqual([]);expect(failed).toEqual([]);
});
test('every case supports direct navigation, refresh, real content and next project',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const slug of projects){
  await page.goto(`./#/work/${slug}`);await expect(page.getByRole('heading',{level:1})).toBeVisible();await page.reload();
  await expect(page.locator('.case-role li')).not.toHaveCount(0);await expect(page.locator('.outcome-grid>div')).not.toHaveCount(0);
  await page.locator('.next-project').scrollIntoViewIfNeeded();await expect(page.locator('.next-project')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),slug).toBeTruthy();
  await expect(page.locator('.media-fallback')).toHaveCount(0);
 }
 await page.locator('.next-project').click();await expect(page).toHaveURL(/#\/work\/byd/);expect(errors).toEqual([]);
});
test('navigation, CV, contact, keyboard and reduced motion',async({page,isMobile})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./');
 await page.keyboard.press('Tab');await expect(page.getByText('Skip to content')).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();await expect(page).not.toHaveURL(/#main/);
 if(isMobile){await page.getByRole('button',{name:'Open menu'}).click();await expect(page.getByRole('button',{name:'Close menu'})).toHaveAttribute('aria-expanded','true');}
 await page.getByRole('navigation').getByRole('link',{name:'About',exact:true}).click();await expect(page).toHaveURL(/#\/about/);
 await expect(page.getByRole('heading',{level:1})).toHaveText('THE THINKING.THE DOING.');
 const cv=page.getByRole('link',{name:/Download CV/});const response=await page.request.get((await cv.getAttribute('href'))!);expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('pdf');
 await expect(page.locator('.timeline-row')).toHaveCount(5);
 if(isMobile)await page.getByRole('button',{name:'Open menu'}).click();
 await page.getByRole('navigation').getByRole('link',{name:/Let’s talk/}).click();await expect(page.locator('#contact')).toBeInViewport();
 await expect(page.locator('.contact-links').getByRole('link',{name:'artem.ygy@outlook.com'})).toHaveAttribute('href','mailto:artem.ygy@outlook.com');
 await page.getByRole('button',{name:'BACK TO TOP'}).click();await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
});
test('missing image and video have intentional fallbacks; unknown route has recovery',async({page})=>{
 await page.route('**/media/projects/byd/cover.webp',r=>r.abort());await page.route('**/media/projects/byd/hero.webp',r=>r.abort());
 await page.goto('./#/work/byd');await expect(page.locator('.case-hero .media-fallback')).toBeVisible();
 await page.locator('.video-block').scrollIntoViewIfNeeded();await expect(page.getByText('ORIGINAL FOOTAGE TO FOLLOW',{exact:false})).toBeVisible();
 await page.goto('./#/missing');await expect(page.getByRole('heading',{level:1})).toContainText('BACK ON TRACK');await page.getByRole('link',{name:/Back to the portfolio/}).click();await expect(page).toHaveURL(/#\/$/);
});

test('EN/RU switch translates all pages and persists through navigation and reload',async({page,isMobile},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./');
 const ru=page.getByRole('button',{name:'Русский',exact:true});
 await expect(ru).toBeVisible();await ru.click();
 await expect(page.locator('html')).toHaveAttribute('lang','ru');
 await expect(ru).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('heading',{level:1})).toContainText('СТРАТЕГИЯ.');
 await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',/Артём Югай/);
 await page.waitForTimeout(1600);await page.screenshot({path:`test-results/${testInfo.project.name}-ru-home.png`});
 await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','ru');
 for(const slug of projects){
  await page.goto(`./#/work/${slug}`);
  await expect(page.locator('.case-objective')).toContainText('ЗАДАЧА');
  await expect(page.locator('.case-role li').first()).toContainText(/[А-Яа-яЁё]/);
  await expect(page.locator('.case-outcomes')).toContainText('КЛЮЧЕВЫЕ РЕЗУЛЬТАТЫ');
  await expect(page.locator('.source-note')).toContainText(/[А-Яа-яЁё]/);
  await expect(page).toHaveTitle(/Артём Югай/);
  for(const caption of await page.locator('figcaption').all())await expect(caption).toContainText(/[А-Яа-яЁё]/);
  await page.locator('.video-block').scrollIntoViewIfNeeded();await expect(page.getByText('МЕСТО ДЛЯ ВИДЕО · ОРИГИНАЛ БУДЕТ ДОБАВЛЕН')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`RU ${slug}`).toBeTruthy();
 }
 await page.locator('.next-project').click();await expect(page).toHaveURL(/#\/work\/byd/);await expect(page.locator('.case-meta')).toContainText('Руководитель маркетинга');
 if(isMobile)await page.getByRole('button',{name:'Открыть меню'}).click();
 await page.getByRole('navigation').getByRole('link',{name:'Обо мне',exact:true}).click();
 await expect(page.getByRole('heading',{level:1})).toContainText('ПРОДУМАТЬ.');
 await expect(page.locator('.timeline-row').first()).toContainText('Июль 2025 — март 2026');
 const cv=await page.getByRole('link',{name:/Скачать резюме/}).getAttribute('href');expect((await page.request.get(cv!)).status()).toBe(200);
 await page.getByRole('button',{name:'English',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','en');await expect(page).toHaveTitle('About — Artem Yugay');
 await expect(page.getByRole('heading',{level:1})).toContainText('THE THINKING.');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('lang','en');
 expect(errors).toEqual([]);
});

test('Russian layouts fit narrow phones and tablets; switch keeps current case',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./#/work/milliy');
 await page.getByRole('button',{name:'Русский',exact:true}).click();await expect(page).toHaveURL(/#\/work\/milliy/);
 for(const width of [360,768]){
  await page.setViewportSize({width,height:900});
  for(const route of ['','about',...projects.map(s=>`work/${s}`)]){
   await page.goto(`./#/${route}`);await page.getByRole('heading',{level:1}).waitFor();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px ${route}`).toBeTruthy();
  }
 }
});
