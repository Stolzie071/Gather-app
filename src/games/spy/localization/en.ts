export const spyEn = {
  spyGame: {
    description: "Find the spy before\nthey discover the truth",
    start: "Start game",
  },

  spyReveal: {
    revealCard: "Reveal %{name}'s card",
    roleLabel: "ROLE",
    spyRoleName: "Spy",
    otherSpies: "Other spies:",
    allPlayersAreSpiesExcept: "All players are spies except:",
    categories: {
      locations: {
        instruction: "%{name}, tap the card to discover your location or role",
        wordLabel: "LOCATION",
        wordWarning:
          "Answer carefully.\nDon't let the spy figure out\nwhere you are.",
        spyWarning:
          "Listen carefully.\nTry to figure out which location\nthe others received.",
      },
      characters: {
        instruction: "%{name}, tap the card to discover your character or role",
        wordLabel: "CHARACTER",
        wordWarning:
          "Answer carefully.\nDon't let the spy figure out\nwhich character you received.",
        spyWarning:
          "Listen carefully.\nTry to figure out which character\nthe others received.",
      },
      animals: {
        instruction: "%{name}, tap the card to discover your animal or role",
        wordLabel: "ANIMAL",
        wordWarning:
          "Answer carefully.\nDon't let the spy figure out\nwhich animal you received.",
        spyWarning:
          "Listen carefully.\nTry to figure out which animal\nthe others received.",
      },
      other: {
        instruction: "%{name}, tap the card to discover your secret word or role",
        wordLabel: "WORD",
        wordWarning:
          "Answer carefully.\nDon't let the spy figure out\nwhich word you received.",
        spyWarning:
          "Listen carefully.\nTry to figure out which word\nthe others received.",
      },
      mySets: {
        instruction: "%{name}, tap the card to discover your secret word or role",
        wordLabel: "WORD",
        wordWarning:
          "Answer carefully.\nDon't let the spy figure out\nwhich word you received.",
        spyWarning:
          "Listen carefully.\nTry to figure out which word\nthe others received.",
      },
    },
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
        packsSubtitle: "Which packs should the locations come from?",
        wordCount: { one: "%{count} location", other: "%{count} locations" },
      },
      characters: {
        title: "Characters",
        description: "Heroes from games, movies, books, and more",
        packsSubtitle: "Which packs should the characters come from?",
        wordCount: { one: "%{count} character", other: "%{count} characters" },
      },
      animals: {
        title: "Animals",
        description: "Domestic, wild, and sea animals",
        packsSubtitle: "Which packs should the animals come from?",
        wordCount: { one: "%{count} animal", other: "%{count} animals" },
      },
      other: {
        title: "Other",
        description: "Unusual and mixed sets",
        packsSubtitle: "Which packs should the words come from?",
        wordCount: { one: "%{count} word", other: "%{count} words" },
      },
      mySets: {
        title: "My sets",
        description: "Create your own word packs",
        packsSubtitle: "Choose your pack or create a new one",
        wordCount: { one: "%{count} word", other: "%{count} words" },
      },
    },
    packs: {
      title: "Choose packs",
      createCustomPack: "Create pack",
      noCustomPacks: "No packs created yet",
      editCustomPack: "Edit pack",
      items: {
        nature: "Nature",
        entertainment: "Entertainment",
        workplaces: "Workplaces",
        transport: "Transport",
        cities: "Cities",
        "dota-2-heroes": "Dota 2 Heroes",
        "marvel-cinematic-universe": "Marvel Characters",
        "dc-screen-characters": "DC Characters",
        "domestic-animals": "Domestic Animals",
        "wild-animals": "Wild Animals",
        "sea-animals": "Sea Animals",
        "school-items": "School Items",
        professions: "Professions",
      },
    },
    customPackDialog: {
      title: "Create pack",
      editTitle: "Edit pack",
      packName: "Pack name",
      namePlaceholder: "Enter a name...",
      words: "Words",
      wordsCount: "Added: %{count}",
      emptyWords: "Add at least one word",
      wordPlaceholder: "Enter a word...",
      editWord: "Edit word",
      deleteWord: "Delete word",
      addWord: "Add word",
      cancel: "Cancel",
      create: "Create",
      save: "Save",
      deletePack: "Delete pack",
      deleteDialog: {
        title: "Delete pack?",
        message:
          "The pack “%{name}” and all its words will be deleted.\nThis action cannot be undone.",
        cancel: "Cancel",
        confirm: "Delete",
      },
      duplicateWord: {
        title: "This word already exists",
        message: "“%{word}” has already been added to this pack.",
        ok: "OK",
      },
    },
    options: {
      title: "Set up the game",
      subtitle: "Choose the remaining game settings",
      players: "Players",
      playerCount: { one: "%{count} player", other: "%{count} players" },
      spies: "Spies",
      spiesRecommendation: {
        one: "%{count} spy is recommended for this group",
        other: "%{count} spies are recommended for this group",
      },
      spiesHint: "Minimum 1, maximum %{max}",
      selectPlayersHint: "First select at least 3 players",
      spiesKnowEachOther: "Do the spies know each other?",
      yes: "Yes",
      no: "No",
      timer: "Timer",
      timerRecommendation: {
        one: "%{count} minute is recommended for this group",
        other: "%{count} minutes are recommended for this group",
      },
      minutesShort: "min",
      timerHint: "Minimum 1 minute",
      noTimer: "No timer",
    },
    summary: {
      title: "All ready! 🎉",
      subtitle: "Check the settings and let's start the game.",
      category: "Category",
      pack: "Packs",
      options: "Game settings",
      start: "Start game",
      information:
        "After starting, each player will receive their card in turn.",
      noPacks: "No pack selected",
      noTimer: "no timer",
      minutes: "%{count} min",
      units: {
        players: { one: "%{count} player", other: "%{count} players" },
        spies: { one: "%{count} spy", other: "%{count} spies" },
      },
    },
  },
} as const;
