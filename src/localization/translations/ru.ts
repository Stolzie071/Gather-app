export const ru = {
  home: {
    subtitle: "Вечер станет интереснее",
    play: "Играть",
    statistics: "Статистика",
  },

  statistics: {
    title: "Статистика",
    subtitle: "Результаты ваших партий",
    tabs: {
      players: "Игроки",
      history: "История",
    },
    summary: {
      popular: "Самая популярная: ",
      empty: "Завершённых партий пока нет",
    },
    searchPlaceholder: "Поиск игрока...",
    emptyPlayers: "Статистики игроков пока нет",
    emptySearch: "Игроки не найдены",
    historyPlaceholder: "Историю партий добавим следующим этапом",
    history: {
      allPlayers: "Все игроки",
      closeFilter: "Закрыть фильтр игроков",
      peaceful: "Мирные",
      spies: "Шпионы",
      winner: "Победитель",
      deletedPlayer: "Удалённый игрок",
      empty: "История партий пока пуста",
      emptyFilter: "У этого игрока пока нет завершённых партий",
      today: "Сегодня",
      yesterday: "Вчера",
    },
    playerDetails: {
      editPlayer: "Редактировать игрока",
      closeActions: "Закрыть меню игрока",
      renamePlayer: "Переименовать игрока",
      renameDialog: {
        title: "Переименовать игрока",
        playerName: "Имя игрока",
        namePlaceholder: "Введите новое имя...",
        cancel: "Отмена",
        confirm: "Переименовать",
      },
      deletePlayer: "Удалить игрока",
      deleteDialog: {
        title: "Удалить игрока?",
        message:
          "Игрок «%{name}» и вся его статистика будут удалены.\nЭто действие нельзя отменить.",
        cancel: "Отмена",
        confirm: "Удалить",
      },
      otherGames: "Другое",
      wins: "Победы",
      winRate: "Процент побед",
      gamesPlayed: "Всего партий",
      lastGame: "Последняя игра",
      noGames: "Нет партий",
      victory: "Победа",
      defeat: "Поражение",
      gameStats: {
        total: "Всего партий",
        asSpy: "Был шпионом",
        spyWins: "Победил за шпиона",
        civilianWins: "Победил за мирных",
      },
      playerNotFound: "Игрок не найден",
    },
    counts: {
      parties: {
        one: "%{count} партия",
        few: "%{count} партии",
        many: "%{count} партий",
      },
      players: {
        one: "%{count} игрок",
        few: "%{count} игрока",
        many: "%{count} игроков",
      },
      games: {
        one: "%{count} игра",
        few: "%{count} игры",
        many: "%{count} игр",
      },
      wins: {
        one: "%{count} победа",
        few: "%{count} победы",
        many: "%{count} побед",
      },
      winRate: "%{count} % побед",
    },
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
    wordLabel: "ПЕРСОНАЖ",
    roleLabel: "РОЛЬ",
    spyRoleName: "Шпион",
    otherSpies: "Другие шпионы:",
    allPlayersAreSpiesExcept: "Все игроки шпионы кроме:",
    locationWarning:
      "Отвечай осторожно.\nНе дай шпиону догадаться,\nгде вы находитесь.",
    wordWarning:
      "Отвечай осторожно.\nНе дай шпиону догадаться,\nкакого персонажа вы получили.",
    spyWarning:
      "Слушай внимательно.\nПопробуй понять, какую\nлокацию получили остальные.",
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

  exitGameDialog: {
    title: "Покинуть текущую партию?",
    message: "Текущая партия завершится,\nа её прогресс не сохранится.",
    stay: "Остаться",
    exit: "Выйти",
  },

  resumeGameDialog: {
    title: "Продолжить партию?",
    message: "У вас осталась незавершённая партия в «Шпиона».",
    leave: "Покинуть",
    resume: "Продолжить",
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
      spiesRecommendation: {
        one: "Для данного состава рекомендуется %{count} шпион",
        few: "Для данного состава рекомендуется %{count} шпиона",
        many: "Для данного состава рекомендуется %{count} шпионов",
      },
      spiesHint: "Минимум 1, максимум %{max}",
      selectPlayersHint: "Сначала выбери минимум 3 игроков",
      spiesKnowEachOther: "Шпионы знают друг друга?",
      yes: "Да",
      no: "Нет",
      timer: "Таймер",
      timerRecommendation: "Для данного состава рекомендуется %{count} минут",
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
    maximumCount: "(Максимум %{count})",
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
      more: "Ещё",
      moreAvatars: "Показать все аватары",
      playerName: "Имя игрока",
      namePlaceholder: "Введите имя игрока...",
      cancel: "Отмена",
      add: "Добавить",
    },
    avatarPicker: {
      title: "Выбери аватар",
      male: "Мужские",
      female: "Женские",
      cancel: "Отмена",
      select: "Выбрать",
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
      hapticTests: "Тесты вибраций",
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
      savedGames: "Сохранено партий: %{count}",
      clearGameHistory: "Очистить историю партий",
    },

    hapticTests: {
      selection: "Selection — выбор",
      impactLight: "Impact Light — лёгкий удар",
      impactMedium: "Impact Medium — средний удар",
      impactHeavy: "Impact Heavy — сильный удар",
      impactSoft: "Impact Soft — мягкий удар",
      impactRigid: "Impact Rigid — резкий удар",
      notificationSuccess: "Notification Success — успех",
      notificationWarning: "Notification Warning — предупреждение",
      notificationError: "Notification Error — ошибка",
      androidConfirm: "Android Confirm — подтверждение",
      androidReject: "Android Reject — отказ",
      androidToggleOn: "Android Toggle On — включение",
      androidToggleOff: "Android Toggle Off — выключение",
      androidSegmentTick: "Android Segment Tick — деление",
      androidClockTick: "Android Clock Tick — часы",
    },
  },
};
