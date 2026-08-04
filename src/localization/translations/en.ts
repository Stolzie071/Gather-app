export const en = {
  home: {
    subtitle: "Make your evening more fun",
    play: "Play",
    statistics: "Statistics",
  },

  statistics: {
    title: "Statistics",
    subtitle: "Your game results",
    tabs: {
      players: "Players",
      history: "History",
    },
    summary: {
      popular: "Most popular: ",
      empty: "No completed games yet",
    },
    searchPlaceholder: "Search players...",
    emptyPlayers: "No player statistics yet",
    emptySearch: "No players found",
    historyPlaceholder: "Game history is coming in the next step",
    history: {
      allPlayers: "All players",
      closeFilter: "Close player filter",
      peaceful: "Civilians",
      spies: "Spies",
      winner: "Winner",
      deletedPlayer: "Deleted player",
      empty: "No completed games yet",
      emptyFilter: "This player has no completed games yet",
      today: "Today",
      yesterday: "Yesterday",
    },
    playerDetails: {
      editPlayer: "Edit player",
      closeActions: "Close player menu",
      renamePlayer: "Rename player",
      deletePlayer: "Delete player",
      deleteDialog: {
        title: "Delete player?",
        message:
          "The player “%{name}” and all their statistics will be deleted.\nThis action cannot be undone.",
        cancel: "Cancel",
        confirm: "Delete",
      },
      otherGames: "Other",
      wins: "Wins",
      winRate: "Win rate",
      gamesPlayed: "Total games",
      lastGame: "Last game",
      noGames: "No games",
      victory: "Victory",
      defeat: "Defeat",
      gameStats: {
        total: "Total games",
        asSpy: "Played as spy",
        spyWins: "Wins as spy",
        civilianWins: "Wins as civilian",
      },
      playerNotFound: "Player not found",
    },
    counts: {
      parties: {
        one: "%{count} game",
        few: "%{count} games",
        many: "%{count} games",
      },
      players: {
        one: "%{count} player",
        few: "%{count} players",
        many: "%{count} players",
      },
      games: {
        one: "%{count} game",
        few: "%{count} games",
        many: "%{count} games",
      },
      wins: {
        one: "%{count} win",
        few: "%{count} wins",
        many: "%{count} wins",
      },
      winRate: "%{count}% wins",
    },
  },

  gameList: {
    title: "What are we playing?",
    subtitle: "Choose a game for your group",
    searchPlaceholder: "Search games...",
    tabs: {
      all: "All games",
      favorites: "Favorites",
    },
    emptyFavorites: "No favorite games yet",
    emptySearch: "No games found",
    games: {
      spy: {
        title: "Spy",
        players: "3-10 players",
        duration: "15+ min",
      },
      alias: {
        title: "Alias",
        players: "2-16 players",
        duration: "30-60 min",
      },
      mafia: {
        title: "Mafia",
        players: "6-20 players",
        duration: "30+ min",
      },
    },
  },

  spyGame: {
    description: "Find the spy before\nthey discover the truth",
    start: "Start game",
  },

  spyReveal: {
    instruction: "%{name}, tap the card to discover your location or role",
    revealCard: "Reveal %{name}'s card",
    locationLabel: "LOCATION",
    roleLabel: "ROLE",
    spyRoleName: "Spy",
    otherSpies: "Other spies:",
    allPlayersAreSpiesExcept: "All players are spies except:",
    locationWarning:
      "Answer carefully.\nDon't let the spy figure out\nwhere you are.",
    spyWarning:
      "Listen carefully.\nTry to figure out which location\nthe others received.",
    passPhone: "Pass the phone",
    startGame: "Start game",
    allRolesReceived: "All roles\nreceived",
    readyInstruction: "Tap the button\nto start the game",
  },

  spyTimer: {
    finish: "Finish",
    expiredTitle: "Time is up",
    expiredMessage: "Discuss and vote for the player you think is the spy",
    disabledTitle: "Timer is off",
    disabledMessage:
      "When the round ends, tap the button below to choose the winner",
  },

  spyResults: {
    title: "Game over!",
    subtitle: "Who won this round?\nYou can select multiple players.",
    spy: "Spy",
    done: "Done",
  },

  exitGameDialog: {
    title: "Leave the current round?",
    message: "The current round will end,\nand its progress won't be saved.",
    stay: "Stay",
    exit: "Exit",
  },

  resumeGameDialog: {
    title: "Continue the round?",
    message: "You have an unfinished game of Spy.",
    leave: "Leave",
    resume: "Continue",
  },

  spySetup: {
    title: "Game setup",
    step: "Step %{current} of %{total}",
    navigation: {
      back: "Back",
      next: "Next",
    },
    category: {
      title: "Choose a category",
      subtitle: "Choose the type of words for the game",
      locations: {
        title: "Locations",
        description: "Real and imaginary places",
      },
      characters: {
        title: "Characters",
        description: "Heroes from games, movies, books, and more",
      },
      items: {
        title: "Items",
        description: "Food, technology, clothing, and other things",
      },
      animals: {
        title: "Animals",
        description: "Domestic, wild, and fantasy creatures",
      },
      professions: {
        title: "Professions",
        description: "From ordinary to the most unusual",
      },
      other: {
        title: "Other",
        description: "Unusual and mixed sets",
      },
      mySets: {
        title: "My sets",
        description: "Categories created by you",
      },
    },
    packs: {
      title: "Choose packs",
      subtitle: "Which packs should the locations come from?",
      locationCount: "%{count} locations",
      items: {
        nature: "Nature",
        workplaces: "Workplaces",
        transport: "Transport",
        cities: "Cities",
      },
    },
    options: {
      title: "Set up the game",
      subtitle: "Choose the remaining game settings",
      players: "Players",
      playerCount: {
        one: "%{count} player",
        few: "%{count} players",
        many: "%{count} players",
      },
      spies: "Spies",
      spiesRecommendation: {
        one: "%{count} spy is recommended for this group",
        few: "%{count} spies are recommended for this group",
        many: "%{count} spies are recommended for this group",
      },
      spiesHint: "Minimum 1, maximum %{max}",
      selectPlayersHint: "First select at least 3 players",
      spiesKnowEachOther: "Do the spies know each other?",
      yes: "Yes",
      no: "No",
      timer: "Timer",
      timerRecommendation:
        "%{count} minutes are recommended for this group",
      minutesShort: "min",
      timerHint: "Minimum 1 minute",
      noTimer: "No timer",
    },
    summary: {
      title: "All ready! 🎉",
      subtitle: "Check the settings and let's start the game.",
      category: "Category",
      pack: "Pack",
      options: "Game settings",
      start: "Start game",
      information:
        "After starting, each player will receive their card in turn.",
      noPacks: "No pack selected",
      noTimer: "no timer",
      minutes: "%{count} min",
      units: {
        players: {
          one: "%{count} player",
          few: "%{count} players",
          many: "%{count} players",
        },
        spies: {
          one: "%{count} spy",
          few: "%{count} spies",
          many: "%{count} spies",
        },
      },
    },
  },

  playerSelection: {
    title: "Choose players",
    searchPlaceholder: "Search players...",
    selectedCount: {
      one: "Selected: %{count} player",
      few: "Selected: %{count} players",
      many: "Selected: %{count} players",
    },
    maximumCount: "(Maximum %{count})",
    loading: "Loading players...",
    emptyPlayers: "No saved players yet",
    emptySearch: "No players found",
    addPlayer: "Add player",
    close: "Close",
    done: "Done",
    addDialog: {
      title: "Add player",
      chooseAvatar: "Choose an avatar",
      defaultAvatar: "Default avatar",
      choosePhoto: "Choose a photo",
      more: "More",
      moreAvatars: "Show all avatars",
      playerName: "Player name",
      namePlaceholder: "Enter player name...",
      cancel: "Cancel",
      add: "Add",
    },
    avatarPicker: {
      title: "Choose an avatar",
      male: "Men",
      female: "Women",
      cancel: "Cancel",
      select: "Select",
    },
    duplicateAlert: {
      title: "This player name already exists",
      existingPlayer: "A player named “%{name}” already exists.",
      chooseAction: "Choose what you want to do.",
      cancel: "Cancel",
      createNew: "Create another",
    },
    photo: {
      sourceTitle: "Add a photo",
      sourceMessage: "Choose where to get the photo from.",
      camera: "Take a photo",
      gallery: "Choose from gallery",
      cancel: "Cancel",
      permissionTitle: "Permission required",
      cameraPermissionMessage:
        "Allow Gather to use the camera to take a player avatar photo.",
      libraryPermissionMessage:
        "Allow Gather to choose player avatar photos from your library.",
      errorTitle: "Could not add the photo",
      errorMessage: "Try choosing the photo again.",
    },
    crop: {
      title: "Adjust the photo",
      subtitle: "Move and zoom the image",
      cancel: "Cancel",
      confirm: "Done",
    },
  },

  gameScreen: {
    rules: {
      title: "Forgot the rules?",
      description: "Refresh them in a couple of minutes.",
      read: "Read rules",
    },
  },

  settings: {
    title: "Settings",
    darkTheme: "Dark theme",

    sections: {
      sound: "Sound",
      application: "Application",
      information: "Information",
      developer: "For developer",
      hapticTests: "Haptic tests",
    },

    items: {
      sounds: "Sounds",
      music: "Music",
      hapticFeedback: "Haptic feedback",
      language: "Language",
      keepAwake: "Keep screen awake",
      about: "About «Gather»",
      feedback: "Feedback",
      privacyPolicy: "Privacy policy",
      rateApp: "Rate the app",
      supportDeveloper: "Support the developer",
      clearPlayers: "Clear all friends",
      clearPhotos: "Clear all photos",
      savedGames: "Saved games: %{count}",
      clearGameHistory: "Clear game history",
    },

    hapticTests: {
      selection: "Selection",
      impactLight: "Impact Light",
      impactMedium: "Impact Medium",
      impactHeavy: "Impact Heavy",
      impactSoft: "Impact Soft",
      impactRigid: "Impact Rigid",
      notificationSuccess: "Notification Success",
      notificationWarning: "Notification Warning",
      notificationError: "Notification Error",
      androidConfirm: "Android Confirm",
      androidReject: "Android Reject",
      androidToggleOn: "Android Toggle On",
      androidToggleOff: "Android Toggle Off",
      androidSegmentTick: "Android Segment Tick",
      androidClockTick: "Android Clock Tick",
    },
  },
};
