# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product.spec.ts >> регистрация, CRUD задач, фильтры и доступное подтверждение
- Location: tests\product.spec.ts:21:1

# Error details

```
Test timeout of 90000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f3e1]:
  - link "К содержимому" [ref=f3e2] [cursor=pointer]:
    - /url: "#main-content"
  - main "Рабочее пространство DontLoaf" [ref=f3e3]:
    - complementary [ref=f3e5]:
      - generic [ref=f3e6]:
        - link "DontLoaf — на главную" [ref=f3e7] [cursor=pointer]:
          - /url: /
          - generic [ref=f3e8]: DontLoaf.
        - link "Создать задачу" [ref=f3e14] [cursor=pointer]:
          - /url: /editor
        - generic [ref=f3e17]: РАБОЧЕЕ ПРОСТРАНСТВО
        - navigation "Разделы приложения" [ref=f3e18]:
          - link "Задачи" [ref=f3e19] [cursor=pointer]:
            - /url: /tasks
          - link "Дерево задач" [ref=f3e25] [cursor=pointer]:
            - /url: /tree
          - link "Заметки" [ref=f3e31] [cursor=pointer]:
            - /url: /obsidian
          - link "Аналитика" [ref=f3e35] [cursor=pointer]:
            - /url: /analytics
          - link "Профиль" [ref=f3e39] [cursor=pointer]:
            - /url: /profile
      - generic [ref=f3e44]:
        - link "П Проверка_1792796037457 ui_1792796037457@example.com" [ref=f3e45] [cursor=pointer]:
          - /url: /profile
          - generic [ref=f3e46]: П
          - generic [ref=f3e47]:
            - strong [ref=f3e48]: Проверка_1792796037457
            - generic [ref=f3e49]: ui_1792796037457@example.com
        - button "Выйти" [ref=f3e50] [cursor=pointer]
    - generic [ref=f3e56]:
      - generic [ref=f3e57]:
        - generic [ref=f3e58]:
          - generic [ref=f3e59]: РАБОЧЕЕ ПРОСТРАНСТВО / 01
          - heading "Ваши задачи." [level=1] [ref=f3e60]
          - paragraph [ref=f3e61]: Главное — в фокусе. Остальное — на своём месте.
        - link "Новая задача" [ref=f3e62] [cursor=pointer]:
          - /url: /editor
      - generic [ref=f3e64]:
        - generic [ref=f3e65]:
          - generic [ref=f3e66]: В ПРОЦЕССЕ
          - strong [ref=f3e67]: "1"
          - generic [ref=f3e68]: задач ждут следующего шага
        - generic [ref=f3e69]:
          - generic [ref=f3e70]: ГОТОВО
          - strong [ref=f3e71]: "0"
          - generic [ref=f3e72]: задач выполнено
        - generic [ref=f3e73]:
          - generic [ref=f3e74]:
            - generic [ref=f3e75]: ВАШ ПРОГРЕСС
            - strong [ref=f3e76]: 1 задач впереди
            - generic [ref=f3e77]: по выбранному периоду
          - progressbar "Выполнено задач" [ref=f3e78]:
            - generic [ref=f3e82]: 0%
      - generic [ref=f3e83]:
        - generic "Период задач" [ref=f3e84]:
          - button "Все" [pressed] [ref=f3e85] [cursor=pointer]
          - button "Сегодня" [ref=f3e86] [cursor=pointer]
          - button "Неделя" [ref=f3e87] [cursor=pointer]
          - button "Месяц" [ref=f3e88] [cursor=pointer]
        - generic [ref=f3e89]:
          - generic [ref=f3e93]: Поиск задач
          - searchbox "Поиск задач" [ref=f3e94]
      - generic [ref=f3e95]:
        - generic [ref=f3e96]:
          - generic [ref=f3e97]:
            - generic [ref=f3e98]: Статус
            - combobox "Статус" [ref=f3e99]:
              - option "Все задачи" [selected]
              - option "В работе"
              - option "Выполненные"
          - generic [ref=f3e100]:
            - generic [ref=f3e101]: Порядок
            - combobox "Порядок" [ref=f3e102]:
              - option "По сроку" [selected]
              - option "По приоритету"
              - option "По названию"
              - option "Сначала новые"
        - generic [ref=f3e103]:
          - button "Список задач" [pressed] [ref=f3e104] [cursor=pointer]
          - button "Карточки задач" [ref=f3e106] [cursor=pointer]
      - generic [ref=f3e112]:
        - generic [ref=f3e113]:
          - generic [ref=f3e114]: ЗАДАЧА
          - generic [ref=f3e115]: КАТЕГОРИЯ
          - generic [ref=f3e116]: СРОК
          - generic [ref=f3e117]: ПРИОРИТЕТ
          - generic [ref=f3e118]: Действия
        - list [ref=f3e119]:
          - listitem [ref=f3e120]:
            - generic [ref=f3e121]:
              - 'checkbox "Завершить: Подготовить проект" [ref=f3e123] [cursor=pointer]'
              - generic [ref=f3e127]:
                - link "Подготовить проект" [ref=f3e128] [cursor=pointer]:
                  - /url: /editor?id=6e845cdb-dfa4-4dc7-a217-318b70219811
                - generic [ref=f3e129]: Согласовать структуру и следующие шаги
            - generic [ref=f3e130]: Учёба
            - generic [ref=f3e131]: Сегодня
            - generic [ref=f3e134]: Средний
            - generic [ref=f3e136]:
              - 'link "Открыть задачу: Подготовить проект" [ref=f3e137] [cursor=pointer]':
                - /url: /editor?id=6e845cdb-dfa4-4dc7-a217-318b70219811
              - 'button "Удалить задачу: Подготовить проект" [ref=f3e141] [cursor=pointer]'
      - status [ref=f3e146]: "Найдено задач: 1"
```