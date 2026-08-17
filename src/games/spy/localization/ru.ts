export const spyRu = {
  spyGame: {
    description: "Найдите шпиона раньше,\nчем он узнает правду",
    start: "Начать игру",
  },

  spyReveal: {
    revealCard: "Показать карточку игрока %{name}",
    roleLabel: "РОЛЬ",
    spyRoleName: "Шпион",
    otherSpies: "Другие шпионы:",
    allPlayersAreSpiesExcept: "Все игроки шпионы кроме:",
    categories: {
      locations: {
        instruction: "%{name}, нажми на карточку, чтобы узнать локацию или роль",
        wordLabel: "ЛОКАЦИЯ",
        wordWarning:
          "Отвечай осторожно.\nНе дай шпиону догадаться,\nгде вы находитесь.",
        spyWarning:
          "Слушай внимательно.\nПопробуй понять, какую\nлокацию получили остальные.",
      },
      characters: {
        instruction:
          "%{name}, нажми на карточку, чтобы узнать персонажа или роль",
        wordLabel: "ПЕРСОНАЖ",
        wordWarning:
          "Отвечай осторожно.\nНе дай шпиону догадаться,\nкакого персонажа вы получили.",
        spyWarning:
          "Слушай внимательно.\nПопробуй понять, какого\nперсонажа получили остальные.",
      },
      animals: {
        instruction: "%{name}, нажми на карточку, чтобы узнать животное или роль",
        wordLabel: "ЖИВОТНОЕ",
        wordWarning:
          "Отвечай осторожно.\nНе дай шпиону догадаться,\nкакое животное вы получили.",
        spyWarning:
          "Слушай внимательно.\nПопробуй понять, какое\nживотное получили остальные.",
      },
      other: {
        instruction:
          "%{name}, нажми на карточку, чтобы узнать секретное слово или роль",
        wordLabel: "СЛОВО",
        wordWarning:
          "Отвечай осторожно.\nНе дай шпиону догадаться,\nкакое слово вы получили.",
        spyWarning:
          "Слушай внимательно.\nПопробуй понять, какое\nслово получили остальные.",
      },
      mySets: {
        instruction:
          "%{name}, нажми на карточку, чтобы узнать секретное слово или роль",
        wordLabel: "СЛОВО",
        wordWarning:
          "Отвечай осторожно.\nНе дай шпиону догадаться,\nкакое слово вы получили.",
        spyWarning:
          "Слушай внимательно.\nПопробуй понять, какое\nслово получили остальные.",
      },
    },
    passPhone: "Передать телефон",
    startGame: "Начать игру",
    allRolesReceived: "Все роли\nполучены",
    readyInstruction: "Нажмите на кнопку,\nчтобы начать игру",
  },

  spyTimer: {
    finish: "Завершить",
    expiredTitle: "Время вышло",
    expiredMessage: "Обсудите и проголосуйте за того, кого считаете шпионом",
    disabledTitle: "Таймер отключён",
    disabledMessage:
      "По завершении партии нажмите кнопку ниже, чтобы указать победителя",
  },

  spyResults: {
    title: "Игра окончена!",
    subtitle: "Кто выиграл эту партию?\nМожно выбрать несколько игроков.",
    spy: "Шпион",
    done: "Готово",
  },

  spySetup: {
    title: "Настройка игры",
    step: "Шаг %{current} из %{total}",
    navigation: {
      back: "Назад",
      next: "Далее",
    },
    category: {
      title: "Выбери категорию",
      subtitle: "Выбери тип слов для игры",
      locations: {
        title: "Локации",
        description: "Реальные и вымышленные места",
        packsSubtitle: "Из каких наборов будут выбраны локации?",
        wordCount: {
          one: "%{count} локация",
          few: "%{count} локации",
          many: "%{count} локаций",
          other: "%{count} локации",
        },
      },
      characters: {
        title: "Персонажи",
        description: "Герои игр, фильмов, книг и тд",
        packsSubtitle: "Из каких наборов будут выбраны персонажи?",
        wordCount: {
          one: "%{count} персонаж",
          few: "%{count} персонажа",
          many: "%{count} персонажей",
          other: "%{count} персонажа",
        },
      },
      animals: {
        title: "Животные",
        description: "Домашние, дикие и морские животные",
        packsSubtitle: "Из каких наборов будут выбраны животные?",
        wordCount: {
          one: "%{count} животное",
          few: "%{count} животных",
          many: "%{count} животных",
          other: "%{count} животных",
        },
      },
      other: {
        title: "Разное",
        description: "Необычные и смешанные наборы",
        packsSubtitle: "Из каких наборов будут выбраны слова?",
        wordCount: {
          one: "%{count} слово",
          few: "%{count} слова",
          many: "%{count} слов",
          other: "%{count} слова",
        },
      },
      mySets: {
        title: "Мои наборы",
        description: "Создавай собственные наборы слов",
        packsSubtitle: "Выбери свой набор или создай новый",
        wordCount: {
          one: "%{count} слово",
          few: "%{count} слова",
          many: "%{count} слов",
          other: "%{count} слова",
        },
      },
    },
    packs: {
      title: "Выбери наборы",
      createCustomPack: "Создать набор",
      noCustomPacks: "Созданных наборов пока нет",
      editCustomPack: "Редактировать набор",
      items: {
        nature: "Природа",
        workplaces: "Рабочие места",
        transport: "Транспорт",
        cities: "Города",
        "dota-2-heroes": "Герои Dota 2",
        "marvel-cinematic-universe": "Персонажи Marvel",
        "dc-screen-characters": "Персонажи DC",
        "domestic-animals": "Домашние животные",
        "wild-animals": "Дикие животные",
        "sea-animals": "Морские животные",
        "school-items": "Школьные предметы",
        professions: "Профессии",
      },
    },
    customPackDialog: {
      title: "Создать набор",
      editTitle: "Изменить набор",
      packName: "Название набора",
      namePlaceholder: "Введите название...",
      words: "Слова",
      wordsCount: "Добавлено: %{count}",
      emptyWords: "Добавь хотя бы одно слово",
      wordPlaceholder: "Введите слово...",
      editWord: "Изменить слово",
      deleteWord: "Удалить слово",
      addWord: "Добавить слово",
      cancel: "Отмена",
      create: "Создать",
      save: "Сохранить",
      deletePack: "Удалить набор",
      deleteDialog: {
        title: "Удалить набор?",
        message:
          "Набор «%{name}» и все его слова будут удалены.\nЭто действие нельзя отменить.",
        cancel: "Отмена",
        confirm: "Удалить",
      },
      duplicateWord: {
        title: "Такое слово уже есть",
        message: "Слово «%{word}» уже добавлено в этот набор.",
        ok: "ОК",
      },
    },
    options: {
      title: "Настрой игру",
      subtitle: "Осталось выбрать параметры партии",
      players: "Игроки",
      playerCount: {
        one: "%{count} игрок",
        few: "%{count} игрока",
        many: "%{count} игроков",
        other: "%{count} игрока",
      },
      spies: "Шпионов",
      spiesRecommendation: {
        one: "Для данного состава рекомендуется %{count} шпион",
        few: "Для данного состава рекомендуется %{count} шпиона",
        many: "Для данного состава рекомендуется %{count} шпионов",
        other: "Для данного состава рекомендуется %{count} шпиона",
      },
      spiesHint: "Минимум 1, максимум %{max}",
      selectPlayersHint: "Сначала выбери минимум 3 игроков",
      spiesKnowEachOther: "Шпионы знают друг друга?",
      yes: "Да",
      no: "Нет",
      timer: "Таймер",
      timerRecommendation: {
        one: "Для данного состава рекомендуется %{count} минута",
        few: "Для данного состава рекомендуется %{count} минуты",
        many: "Для данного состава рекомендуется %{count} минут",
        other: "Для данного состава рекомендуется %{count} минуты",
      },
      minutesShort: "мин",
      timerHint: "Минимум 1 минута",
      noTimer: "Без таймера",
    },
    summary: {
      title: "Всё готово! 🎉",
      subtitle: "Проверь настройки и начнём игру.",
      category: "Категория",
      pack: "Наборы",
      options: "Настройки игры",
      start: "Начать игру",
      information:
        "После начала каждый игрок по очереди получит свою карточку.",
      noPacks: "Набор не выбран",
      noTimer: "без таймера",
      minutes: "%{count} мин",
      units: {
        players: {
          one: "%{count} игрок",
          few: "%{count} игрока",
          many: "%{count} игроков",
          other: "%{count} игрока",
        },
        spies: {
          one: "%{count} шпион",
          few: "%{count} шпиона",
          many: "%{count} шпионов",
          other: "%{count} шпиона",
        },
      },
    },
  },
} as const;
