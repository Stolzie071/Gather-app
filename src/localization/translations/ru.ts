export const ru = {
  home: {
    subtitle: "Вечер станет интереснее",
    play: "Играть",
    statistics: "Статистика",
  },

  gameList: {
    title: "Во что играем?",
    subtitle: "Выбери игру для своей компании",
    searchPlaceholder: "Поиск игры...",
    tabs: {
      all: "Все игры",
      favorites: "Избранные",
    },
    emptyFavorites: "Избранных игр пока что нет",
    emptySearch: "Игры не найдены",
    games: {
      spy: {
        title: "Шпион",
        players: "3-12 игроков",
        duration: "15+ мин",
      },
      alias: {
        title: "Alias",
        players: "2-16 игроков",
        duration: "30-60 мин",
      },
      mafia: {
        title: "Мафия",
        players: "6-20 игроков",
        duration: "30+ мин",
      },
    },
  },

  spyGame: {
    description: "Найдите шпиона раньше,\nчем он узнает правду",
    start: "Начать игру",
  },

  spyReveal: {
    instruction: "%{name}, нажми на карточку, чтобы узнать локацию или роль",
    revealCard: "Показать карточку игрока %{name}",
    locationLabel: "ЛОКАЦИЯ",
    roleLabel: "РОЛЬ",
    spyRoleName: "Шпион",
    locationWarning:
      "Отвечай осторожно.\nНе дай шпиону догадаться,\nгде вы находитесь.",
    spyWarning:
      "Слушай внимательно.\nПопробуй понять, какую\nлокацию получили остальные.",
    passPhone: "Передать телефон",
    startGame: "Начать игру",
    allRolesReceived: "Все роли\nполучены",
    readyInstruction: "Нажмите на кнопку,\nчтобы начать игру",
  },

  spyTimer: {
    finish: "Завершить",
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
      },
      characters: {
        title: "Персонажи",
        description: "Герои игр, фильмов, книг и тд",
      },
      items: {
        title: "Предметы",
        description: "Еда, техника, одежда и другие вещи",
      },
      animals: {
        title: "Животные",
        description: "Домашние, дикие и фантастические существа",
      },
      professions: {
        title: "Профессии",
        description: "От обычных до самых необычных",
      },
      other: {
        title: "Разное",
        description: "Необычные и смешанные наборы",
      },
      mySets: {
        title: "Мои наборы",
        description: "Созданные тобой категории",
      },
    },
    packs: {
      title: "Выбери наборы",
      subtitle: "Из каких наборов будут выбраны локации?",
      locationCount: "%{count} локации",
      items: {
        nature: "Природа",
        workplaces: "Рабочие места",
        transport: "Транспорт",
        cities: "Города",
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
      },
      spies: "Шпионов",
      spiesHint: "Минимум 1, максимум %{max}",
      selectPlayersHint: "Сначала выбери минимум 3 игроков",
      timer: "Таймер",
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
        },
        spies: {
          one: "%{count} шпион",
          few: "%{count} шпиона",
          many: "%{count} шпионов",
        },
      },
    },
  },

  playerSelection: {
    title: "Выбери игроков",
    searchPlaceholder: "Поиск игроков...",
    selectedCount: {
      one: "Выбрано: %{count} игрок",
      few: "Выбрано: %{count} игрока",
      many: "Выбрано: %{count} игроков",
    },
    loading: "Загружаем игроков...",
    emptyPlayers: "Сохранённых игроков пока нет",
    emptySearch: "Игроки не найдены",
    addPlayer: "Добавить игрока",
    close: "Закрыть",
    done: "Готово",
    addDialog: {
      title: "Добавить игрока",
      chooseAvatar: "Выберите аватар",
      defaultAvatar: "Стандартный аватар",
      choosePhoto: "Выбрать фотографию",
      playerName: "Имя игрока",
      namePlaceholder: "Введите имя игрока...",
      cancel: "Отмена",
      add: "Добавить",
    },
    duplicateAlert: {
      title: "Игрок с таким именем уже есть",
      existingPlayer: "Игрок «%{name}» уже существует.",
      chooseAction: "Выберите, что хотите сделать.",
      cancel: "Отмена",
      createNew: "Создать нового",
    },
    photo: {
      sourceTitle: "Добавить фотографию",
      sourceMessage: "Выберите, откуда взять фотографию.",
      camera: "Сделать фото",
      gallery: "Выбрать из галереи",
      cancel: "Отмена",
      permissionTitle: "Нужно разрешение",
      cameraPermissionMessage:
        "Разрешите Gather использовать камеру, чтобы сделать фотографию для аватара.",
      libraryPermissionMessage:
        "Разрешите Gather выбирать фотографии из галереи для аватара.",
      errorTitle: "Не удалось добавить фотографию",
      errorMessage: "Попробуйте выбрать фотографию ещё раз.",
    },
    crop: {
      title: "Настройте фотографию",
      subtitle: "Перемещайте и масштабируйте изображение",
      cancel: "Отмена",
      confirm: "Готово",
    },
  },

  gameScreen: {
    rules: {
      title: "Не помнишь правила?",
      description: "Быстро освежим за пару минут.",
      read: "Читать правила",
    },
  },

  settings: {
    title: "Настройки",
    darkTheme: "Тёмная тема",

    sections: {
      sound: "Звук",
      application: "Приложение",
      information: "Информация",
      developer: "Для разработчика",
    },

    items: {
      sounds: "Звуки",
      music: "Музыка",
      hapticFeedback: "Тактильная отдача",
      language: "Язык",
      keepAwake: "Не выключать экран",
      about: "О «Gather»",
      feedback: "Обратная связь",
      privacyPolicy: "Политика конфиденциальности",
      rateApp: "Оценить приложение",
      supportDeveloper: "Поддержать разработчика",
      clearPlayers: "Очистить всех друзей",
      clearPhotos: "Очистить все фотографии",
    },
  },
};
