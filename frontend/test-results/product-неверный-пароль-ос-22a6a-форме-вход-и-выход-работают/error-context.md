# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product.spec.ts >> неверный пароль остаётся в форме, вход и выход работают
- Location: tests\product.spec.ts:58:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "Transition was aborted because of invalid state. ViewTransition opt-in disabled",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=f4e1]:
  - link "К содержимому" [ref=f4e2] [cursor=pointer]:
    - /url: "#main-content"
  - main "Вход и регистрация" [ref=f4e3]:
    - generic [ref=f4e5]:
      - link "На главную" [ref=f4e6] [cursor=pointer]:
        - /url: /
      - generic [ref=f4e9]:
        - generic [ref=f4e10]:
          - link "DontLoaf." [ref=f4e11] [cursor=pointer]:
            - /url: /
          - generic [ref=f4e18]: БОЛЬШЕ ЧЕМ ПРОДУКТИВНОСТЬ
        - generic [ref=f4e19]:
          - generic [ref=f4e20]: ПРОСТРАНСТВО ДЛЯ ВАЖНОГО
          - heading [level=1] [ref=f4e21]:
            - text: Соберите мысли.Найдите
            - emphasis [ref=f4e22]: свой ритм.
          - paragraph [ref=f4e23]: Задачи, идеи и прогресс — в одной ясной системе.
        - generic [ref=f4e24]: ПЛАНИРУЙТЕ / ДЕЙСТВУЙТЕ / РАСТИТЕ
      - generic [ref=f4e25]:
        - generic [ref=f4e26]:
          - generic [ref=f4e27]: ВАШ СЛЕДУЮЩИЙ ШАГ
          - generic [ref=f4e28]:
            - heading "С возвращением." [level=2] [ref=f4e29]
            - paragraph [ref=f4e30]: Ваши задачи и идеи ждут вас. Продолжим?
          - tablist "Вход или регистрация" [ref=f4e31]:
            - tab "Вход" [selected] [ref=f4e32] [cursor=pointer]
            - tab "Регистрация" [ref=f4e33] [cursor=pointer]
          - tabpanel "Вход" [ref=f4e34]:
            - generic [ref=f4e35]:
              - generic [ref=f4e36]:
                - generic [ref=f4e37]: Электронная почта *
                - textbox "Электронная почта *" [ref=f4e38]:
                  - /placeholder: name@example.com
              - generic [ref=f4e39]:
                - generic [ref=f4e40]: Пароль *
                - generic [ref=f4e41]:
                  - textbox "Пароль *" [ref=f4e42]:
                    - /placeholder: Введите пароль
                  - button "Показать пароль" [ref=f4e43] [cursor=pointer]
              - generic [ref=f4e47] [cursor=pointer]:
                - checkbox "Запомнить меня на этом устройстве" [ref=f4e48]
                - generic [ref=f4e49]: Запомнить меня на этом устройстве
              - button "Войти" [ref=f4e50] [cursor=pointer]
              - status [ref=f4e53]
          - paragraph [ref=f4e54]:
            - text: Нет аккаунта?
            - button "Зарегистрироваться" [ref=f4e55] [cursor=pointer]
        - generic [ref=f4e56]: Ваши задачи доступны только после входа.
```

# Test source

```ts
  1   | ﻿import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
  2   | 
  3   | // Run only against an isolated local backend: these tests create real accounts and data.
  4   | const password = 'DontLoaf-test-2026';
  5   | async function account(request: APIRequestContext) {
  6   |   const id = `${Date.now()}${Math.floor(Math.random()*100000)}`;
  7   |   const response = await request.post('/api/auth/register', { data: { username: `test_${id}`, email: `test_${id}@example.com`, password } });
  8   |   expect(response.status()).toBe(201);
  9   |   return response.json();
  10  | }
  11  | async function authenticate(page: Page, auth: { access_token: string; user: unknown }) {
  12  |   await page.addInitScript(auth => { localStorage.setItem('dontloaf_token',auth.access_token);localStorage.setItem('dontloaf_user',JSON.stringify(auth.user)); },auth);
  13  | }
  14  | async function createTask(request: APIRequestContext, token: string, title: string, category='Работа') {
  15  |   const date = new Date(); const due_date = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  16  |   const response = await request.post('/api/tasks',{ headers:{ Authorization:`Bearer ${token}` },data:{ title,category,due_date,priority:'high',description:'Контекст задачи для проверки реального API' } });
  17  |   expect(response.ok()).toBeTruthy(); return response.json();
  18  | }
  19  | function collectErrors(page:Page) { const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));return errors; }
  20  | 
  21  | test('регистрация, CRUD задач, фильтры и доступное подтверждение',async({page})=>{
  22  |   const errors=collectErrors(page);
  23  |   const id=Date.now();
  24  |   await page.goto('/auth?mode=register');
  25  |   await page.getByLabel('Как к вам обращаться').fill(`Проверка_${id}`);
  26  |   await page.getByLabel('Электронная почта').fill(`ui_${id}@example.com`);
  27  |   await page.getByLabel('Пароль *',{exact:true}).fill(password);
  28  |   await page.getByRole('button',{name:'Создать аккаунт',exact:true}).click();
  29  |   await expect(page).toHaveURL(/\/tasks/);
  30  |   await page.getByRole('link',{name:'Новая задача',exact:true}).click();
  31  |   await page.getByLabel('Название задачи').fill('Подготовить проект');
  32  |   await page.getByLabel('Описание',{exact:true}).fill('Согласовать структуру и следующие шаги');
  33  |   await page.getByRole('button',{name:'Сохранить задачу'}).click();
  34  |   await expect(page).toHaveURL(/\/tasks/);
  35  |   await expect(page.getByRole('link',{name:'Подготовить проект',exact:true})).toBeVisible();
  36  |   await page.getByRole('checkbox',{name:'Завершить: Подготовить проект',exact:true}).check();
  37  |   await expect(page.getByRole('status')).toContainText('Задача завершена');
  38  |   await page.getByLabel('Статус',{exact:true}).selectOption('active');
  39  |   await expect(page.getByRole('heading',{name:'Ничего не найдено'})).toBeVisible();
  40  |   await page.getByLabel('Статус',{exact:true}).selectOption('all');
  41  |   await page.getByRole('button',{name:'Карточки задач'}).click();
  42  |   await expect(page.locator('.workspace-cards .task-row')).toHaveCount(1);
  43  |   await page.getByRole('link',{name:'Подготовить проект',exact:true}).click();
  44  |   await page.getByLabel('Название задачи').fill('Подготовить новый проект');
  45  |   await page.getByRole('button',{name:'Сохранить задачу'}).click();
  46  |   await page.getByRole('button',{name:'Удалить задачу: Подготовить новый проект'}).click();
  47  |   await expect(page.getByRole('dialog')).toBeVisible();
  48  |   await expect(page.getByRole('button',{name:'Отмена',exact:true})).toBeFocused();
  49  |   await page.keyboard.press('Escape');
  50  |   await expect(page.getByRole('dialog')).not.toBeVisible();
  51  |   await page.getByRole('button',{name:'Удалить задачу: Подготовить новый проект'}).click();
  52  |   await page.getByRole('dialog').getByRole('button',{name:'Удалить',exact:true}).click();
  53  |   await expect(page.getByRole('dialog')).not.toBeVisible();
  54  |   await expect(page.getByRole('heading',{name:'Список пока пуст'})).toBeVisible();
  55  |   expect(errors).toEqual([]);
  56  | });
  57  | 
  58  | test('неверный пароль остаётся в форме, вход и выход работают',async({page,request})=>{
  59  |   const auth=await account(request);const errors=collectErrors(page);
  60  |   await page.goto('/auth?mode=login');
  61  |   await page.getByLabel('Электронная почта').fill(auth.user.email);
  62  |   await page.getByLabel('Пароль *',{exact:true}).fill('wrong-password');
  63  |   await page.getByRole('button',{name:'Войти',exact:true}).click();
  64  |   await expect(page.getByRole('alert')).toContainText('Неверный');
  65  |   await expect(page).toHaveURL(/mode=login/);
  66  |   await page.getByLabel('Пароль *',{exact:true}).fill(password);
  67  |   await page.getByRole('button',{name:'Войти',exact:true}).click();
  68  |   await expect(page).toHaveURL(/\/tasks/);
  69  |   await page.getByRole('button',{name:'Выйти',exact:true}).click();
  70  |   await expect(page).toHaveURL(/\/$/);
  71  |   await page.goto('/tasks');await expect(page).toHaveURL(/\/auth\?mode=login/);
> 72  |   expect(errors).toEqual([]);
      |                  ^ Error: expect(received).toEqual(expected) // deep equality
  73  | });
  74  | 
  75  | test('дерево, масштаб, раскрытие, реальные показатели и заметки',async({page,request})=>{
  76  |   const auth=await account(request);await authenticate(page,auth);const errors=collectErrors(page);
  77  |   for(let i=0;i<8;i++)await createTask(request,auth.access_token,`Задача ${i+1}`,i<4?'Работа':'Личное');
  78  |   await page.goto('/tree');
  79  |   await expect(page.locator('.graph-node-task')).toHaveCount(8);
  80  |   const category=page.locator('.graph-node-category').first();
  81  |   await category.click();await expect(page.locator('.graph-node-task')).toHaveCount(4);
  82  |   await category.click();await expect(page.locator('.graph-node-task')).toHaveCount(8);
  83  |   const before=await page.getByLabel('Масштаб',{exact:true}).textContent();
  84  |   await page.getByRole('button',{name:'Увеличить масштаб',exact:true}).click();
  85  |   expect(await page.getByLabel('Масштаб',{exact:true}).textContent()).not.toBe(before);
  86  |   await page.getByRole('button',{name:'Вместить дерево'}).click();
  87  |   await page.locator('.graph-node-task').last().click();
  88  |   await expect(page.locator('.tree-selected-detail h2')).toHaveText('Задача 8');
  89  |   await page.getByRole('button',{name:'Завершить',exact:true}).click();
  90  |   await expect(page.getByRole('button',{name:'Вернуть в работу'})).toBeVisible();
  91  |   await page.goto('/analytics');
  92  |   await expect(page.locator('.refined-kpis .metric')).toHaveText(['8','1','1']);
  93  |   await page.locator('.chart-days button').last().click();
  94  |   await expect(page.locator('.chart-description')).toContainText('Завершено задач: 1');
  95  |   await page.goto('/obsidian');
  96  |   await page.getByRole('button',{name:'Новая заметка',exact:true}).click();
  97  |   await page.getByLabel('Название заметки').fill('Идея для проекта');
  98  |   await page.getByLabel('Текст заметки').fill('Содержание сохраняется через существующий API.');
  99  |   await page.getByRole('button',{name:'Сохранить',exact:true}).click();
  100 |   await expect(page.locator('.notes-saved')).toBeVisible();
  101 |   await page.reload();await expect(page.getByLabel('Текст заметки')).toHaveValue('Содержание сохраняется через существующий API.');
  102 |   await page.getByRole('button',{name:'Удалить заметку'}).click();
  103 |   await expect(page.getByRole('dialog')).toBeVisible();
  104 |   await page.getByRole('dialog').getByRole('button',{name:'Удалить',exact:true}).click();
  105 |   await expect(page.getByRole('heading',{name:'Здесь начинаются идеи'})).toBeVisible();
  106 |   expect(errors).toEqual([]);
  107 | });
  108 | 
  109 | test('все маршруты на 375, 768, 1024 и 1440 px',async({page,request})=>{
  110 |   const auth=await account(request);await authenticate(page,auth);const errors=collectErrors(page);
  111 |   await createTask(request,auth.access_token,'Проверить адаптивность рабочего пространства');
  112 |   for(const width of [375,768,1024,1440]){
  113 |     await page.setViewportSize({width,height:950});
  114 |     for(const route of ['/','/tasks','/editor','/tree','/analytics','/obsidian','/profile']){
  115 |       await page.goto(route);await expect(page.locator('h1').first()).toBeVisible();
  116 |       await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  117 |       expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} at ${width}`).toBeTruthy();
  118 |     }
  119 |     if(width===1440)await page.screenshot({path:'test-results/profile-desktop.png',fullPage:true});
  120 |   }
  121 |   expect(errors).toEqual([]);
  122 | });
  123 | 
  124 | test('hero WebGL, мобильная версия и уменьшение движения',async({page})=>{
  125 |   const errors=collectErrors(page);let scenes=0;
  126 |   page.on('request',request=>{if(request.url().includes('HeroScene'))scenes++;});
  127 |   await page.setViewportSize({width:375,height:850});await page.goto('/');
  128 |   await expect(page.locator('.structure-still')).toBeVisible();
  129 |   await expect(page.locator('astro-island[ssr]')).toHaveCount(0);expect(scenes).toBe(0);
  130 |   await page.setViewportSize({width:1440,height:1000});
  131 |   await expect(page.locator('.sculpture-canvas canvas')).toBeVisible({timeout:20000});
  132 |   await page.mouse.move(1100,350);await page.screenshot({path:'test-results/home-desktop.png',fullPage:false});
  133 |   await page.emulateMedia({reducedMotion:'reduce'});
  134 |   await expect(page.locator('.sculpture-canvas')).toHaveCount(0);
  135 |   await expect(page.locator('.structure-still')).toBeVisible();
  136 |   await page.goto('/auth');
  137 |   for(const width of [375,768,1024,1440]){await page.setViewportSize({width,height:950});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}
  138 |   expect(errors).toEqual([]);
  139 | });
  140 | 
  141 | test('ошибка API и восстановление списка',async({page,request})=>{
  142 |   const auth=await account(request);await authenticate(page,auth);const errors=collectErrors(page);
  143 |   await page.route('**/api/tasks?filter=all',route=>route.abort());
  144 |   await page.goto('/tasks');await expect(page.getByRole('alert')).toContainText('Не удалось связаться');
  145 |   await page.unroute('**/api/tasks?filter=all');
  146 |   await page.getByRole('alert').getByRole('button',{name:'Повторить'}).click();
  147 |   await expect(page.getByRole('heading',{name:'Список пока пуст'})).toBeVisible();
  148 |   expect(errors).toEqual([]);
  149 | });
  150 | 
```