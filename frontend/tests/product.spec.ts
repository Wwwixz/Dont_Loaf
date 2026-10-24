import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

// Run only against an isolated local backend: these tests create real accounts and data.
const password = 'DontLoaf-test-2026';
async function account(request: APIRequestContext) {
  const id = `${Date.now()}${Math.floor(Math.random()*100000)}`;
  const response = await request.post('/api/auth/register', { data: { username: `test_${id}`, email: `test_${id}@example.com`, password } });
  expect(response.status()).toBe(201);
  return response.json();
}
async function authenticate(page: Page, auth: { access_token: string; user: unknown }) {
  await page.addInitScript(auth => { localStorage.setItem('dontloaf_token',auth.access_token);localStorage.setItem('dontloaf_user',JSON.stringify(auth.user)); },auth);
}
async function createTask(request: APIRequestContext, token: string, title: string, category='Работа') {
  const date = new Date(); const due_date = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const response = await request.post('/api/tasks',{ headers:{ Authorization:`Bearer ${token}` },data:{ title,category,due_date,priority:'high',description:'Контекст задачи для проверки реального API' } });
  expect(response.ok()).toBeTruthy(); return response.json();
}
function collectErrors(page:Page) { const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));return errors; }

test('регистрация, CRUD задач, фильтры и доступное подтверждение',async({page})=>{
  const errors=collectErrors(page);
  const id=Date.now();
  await page.goto('/auth?mode=register');
  await page.getByLabel('Как к вам обращаться').fill(`Проверка_${id}`);
  await page.getByLabel('Электронная почта').fill(`ui_${id}@example.com`);
  await page.getByLabel('Пароль *',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Создать аккаунт',exact:true}).click();
  await expect(page).toHaveURL(/\/tasks/);
  await page.getByRole('link',{name:'Новая задача',exact:true}).click();
  await page.getByLabel('Название задачи').fill('Подготовить проект');
  await page.getByLabel('Описание',{exact:true}).fill('Согласовать структуру и следующие шаги');
  await page.getByRole('button',{name:'Сохранить задачу'}).click();
  await expect(page).toHaveURL(/\/tasks/);
  await expect(page.getByRole('link',{name:'Подготовить проект',exact:true})).toBeVisible();
  await page.getByRole('checkbox',{name:'Завершить: Подготовить проект',exact:true}).check();
  await expect(page.getByRole('status')).toContainText('Задача завершена');
  await page.getByLabel('Статус',{exact:true}).selectOption('active');
  await expect(page.getByRole('heading',{name:'Ничего не найдено'})).toBeVisible();
  await page.getByLabel('Статус',{exact:true}).selectOption('all');
  await page.getByRole('button',{name:'Карточки задач'}).click();
  await expect(page.locator('.workspace-cards .task-row')).toHaveCount(1);
  await page.getByRole('link',{name:'Подготовить проект',exact:true}).click();
  await page.getByLabel('Название задачи').fill('Подготовить новый проект');
  await page.getByRole('button',{name:'Сохранить задачу'}).click();
  await page.getByRole('button',{name:'Удалить задачу: Подготовить новый проект'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button',{name:'Отмена',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('button',{name:'Удалить задачу: Подготовить новый проект'}).click();
  await page.getByRole('dialog').getByRole('button',{name:'Удалить',exact:true}).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('heading',{name:'Список пока пуст'})).toBeVisible();
  expect(errors).toEqual([]);
});

test('неверный пароль остаётся в форме, вход и выход работают',async({page,request})=>{
  const auth=await account(request);const errors=collectErrors(page);
  await page.goto('/auth?mode=login');
  await page.getByLabel('Электронная почта').fill(auth.user.email);
  await page.getByLabel('Пароль *',{exact:true}).fill('wrong-password');
  await page.getByRole('button',{name:'Войти',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Неверный');
  await expect(page).toHaveURL(/mode=login/);
  await page.getByLabel('Пароль *',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Войти',exact:true}).click();
  await expect(page).toHaveURL(/\/tasks/);
  await page.getByRole('button',{name:'Выйти',exact:true}).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/tasks');await expect(page).toHaveURL(/\/auth\?mode=login/);
  expect(errors).toEqual([]);
});

test('дерево, масштаб, раскрытие, реальные показатели и заметки',async({page,request})=>{
  const auth=await account(request);await authenticate(page,auth);const errors=collectErrors(page);
  for(let i=0;i<8;i++)await createTask(request,auth.access_token,`Задача ${i+1}`,i<4?'Работа':'Личное');
  await page.goto('/tree');
  await expect(page.locator('.graph-node-task')).toHaveCount(8);
  const category=page.locator('.graph-node-category').first();
  await category.click();await expect(page.locator('.graph-node-task')).toHaveCount(4);
  await category.click();await expect(page.locator('.graph-node-task')).toHaveCount(8);
  const before=await page.getByLabel('Масштаб',{exact:true}).textContent();
  await page.getByRole('button',{name:'Увеличить масштаб',exact:true}).click();
  expect(await page.getByLabel('Масштаб',{exact:true}).textContent()).not.toBe(before);
  await page.getByRole('button',{name:'Вместить дерево'}).click();
  await page.locator('.graph-node-task').last().click();
  await expect(page.locator('.tree-selected-detail h2')).toHaveText('Задача 8');
  await page.getByRole('button',{name:'Завершить',exact:true}).click();
  await expect(page.getByRole('button',{name:'Вернуть в работу'})).toBeVisible();
  await page.goto('/analytics');
  await expect(page.locator('.refined-kpis .metric')).toHaveText(['8','1','1']);
  await page.locator('.chart-days button').last().click();
  await expect(page.locator('.chart-description')).toContainText('Завершено задач: 1');
  await page.goto('/obsidian');
  await page.getByRole('button',{name:'Новая заметка',exact:true}).click();
  await page.getByLabel('Название заметки').fill('Идея для проекта');
  await page.getByLabel('Текст заметки').fill('Содержание сохраняется через существующий API.');
  await page.getByRole('button',{name:'Сохранить',exact:true}).click();
  await expect(page.locator('.notes-saved')).toBeVisible();
  await page.reload();await expect(page.getByLabel('Текст заметки')).toHaveValue('Содержание сохраняется через существующий API.');
  await page.getByRole('button',{name:'Удалить заметку'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button',{name:'Удалить',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Здесь начинаются идеи'})).toBeVisible();
  expect(errors).toEqual([]);
});

test('все маршруты на 375, 768, 1024 и 1440 px',async({page,request})=>{
  const auth=await account(request);await authenticate(page,auth);const errors=collectErrors(page);
  await createTask(request,auth.access_token,'Проверить адаптивность рабочего пространства');
  for(const width of [375,768,1024,1440]){
    await page.setViewportSize({width,height:950});
    for(const route of ['/','/tasks','/editor','/tree','/analytics','/obsidian','/profile']){
      await page.goto(route);await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} at ${width}`).toBeTruthy();
    }
    if(width===1440)await page.screenshot({path:'test-results/profile-desktop.png',fullPage:true});
  }
  expect(errors).toEqual([]);
});

test('hero WebGL, мобильная версия и уменьшение движения',async({page})=>{
  const errors=collectErrors(page);let scenes=0;
  page.on('request',request=>{if(request.url().includes('HeroScene'))scenes++;});
  await page.setViewportSize({width:375,height:850});await page.goto('/');
  await expect(page.locator('.structure-still')).toBeVisible();
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);expect(scenes).toBe(0);
  await page.setViewportSize({width:1440,height:1000});
  await expect(page.locator('.sculpture-canvas canvas')).toBeVisible({timeout:20000});
  await page.mouse.move(1100,350);await page.screenshot({path:'test-results/home-desktop.png',fullPage:false});
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.sculpture-canvas')).toHaveCount(0);
  await expect(page.locator('.structure-still')).toBeVisible();
  await page.goto('/auth');
  for(const width of [375,768,1024,1440]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}
  expect(errors).toEqual([]);
});

test('ошибка API и восстановление списка',async({page,request})=>{
  const auth=await account(request);await authenticate(page,auth);const errors=collectErrors(page);
  await page.route('**/api/tasks?filter=all',route=>route.abort());
  await page.goto('/tasks');await expect(page.getByRole('alert')).toContainText('Не удалось связаться');
  await page.unroute('**/api/tasks?filter=all');
  await page.getByRole('alert').getByRole('button',{name:'Повторить'}).click();
  await expect(page.getByRole('heading',{name:'Список пока пуст'})).toBeVisible();
  expect(errors).toEqual([]);
});
