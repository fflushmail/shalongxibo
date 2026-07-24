export interface DialogueLine {
  hebrew: string   // with nikud where possible
  romanized: string
  hanzi: string
  hanziPhonetic?: string
  audioUrl?: string
}

export interface Dialogue {
  id: string
  titleZh: string
  scenario: string
  scenarioEmoji: string
  difficulty: 'beginner' | 'intermediate'
  lines: DialogueLine[]
}

export const DIALOGUES: Dialogue[] = [
  {
    id: 'morning-site',
    titleZh: '早上在工地打招呼',
    scenario: 'Construction Site Morning',
    scenarioEmoji: '🏗️',
    difficulty: 'beginner',
    lines: [
      {
        hebrew: 'שָׁלוֹם! אֵיךְ אַתָּה?',
        romanized: 'Shalom! Eich ata?',
        hanzi: '你好！你怎么样？',
        hanziPhonetic: '沙龙！艾赫 阿塔？',
      },
      {
        hebrew: 'בְּסֵדֶר, תּוֹדָה! וְאַתָּה?',
        romanized: "Beseder, toda! Ve'ata?",
        hanzi: '还不错，谢谢！你呢？',
        hanziPhonetic: '贝赛德，托达！威阿塔？',
      },
      {
        hebrew: 'גַּם אֲנִי בְּסֵדֶר. בּוֹאוּ נַתְחִיל!',
        romanized: 'Gam ani beseder. Bou natchil!',
        hanzi: '我也不错。我们开始干活吧！',
        hanziPhonetic: '嘎姆 阿尼 贝赛德。包 纳赫吉尔！',
      },
    ],
  },
  {
    id: 'supermarket',
    titleZh: '在超市买东西',
    scenario: 'At the Supermarket',
    scenarioEmoji: '🛒',
    difficulty: 'beginner',
    lines: [
      {
        hebrew: 'כַּמָּה זֶה עוֹלֶה?',
        romanized: 'Kama ze ole?',
        hanzi: '这个多少钱？',
        hanziPhonetic: '卡玛 泽 奥雷？',
      },
      {
        hebrew: 'עֶשְׂרִים שֶׁקֶל בְּבַקָּשָׁה.',
        romanized: 'Esrim shekel, bevakasha.',
        hanzi: '二十谢克尔，谢谢。',
        hanziPhonetic: '埃斯林 谢克尔，贝瓦卡沙。',
      },
      {
        hebrew: 'תּוֹדָה רַבָּה!',
        romanized: 'Toda raba!',
        hanzi: '非常感谢！',
        hanziPhonetic: '托达 拉巴！',
      },
    ],
  },
  {
    id: 'lunch-break',
    titleZh: '午饭时间',
    scenario: 'Lunch Break',
    scenarioEmoji: '🥙',
    difficulty: 'beginner',
    lines: [
      {
        hebrew: 'מָה אַתָּה אוֹכֵל הַיּוֹם?',
        romanized: 'Ma ata ochel hayom?',
        hanzi: '你今天吃什么？',
        hanziPhonetic: '玛 阿塔 奥赫尔 哈尤姆？',
      },
      {
        hebrew: 'פָּלָאפֶל עִם פִּיתָּה. בָּא לְךָ?',
        romanized: "Falafel im pita. Ba lecha?",
        hanzi: '法拉费配皮塔饼。你想要吗？',
        hanziPhonetic: '法拉费尔 伊姆 皮塔。巴 勒哈？',
      },
      {
        hebrew: 'כֵּן, תּוֹדָה! גַּם אֲנִי רָעֵב.',
        romanized: 'Ken, toda! Gam ani raev.',
        hanzi: '好，谢谢！我也饿了。',
        hanziPhonetic: '肯，托达！嘎姆 阿尼 拉艾夫。',
      },
    ],
  },
  {
    id: 'ask-help',
    titleZh: '向同事求助',
    scenario: 'Asking a Colleague for Help',
    scenarioEmoji: '🤝',
    difficulty: 'beginner',
    lines: [
      {
        hebrew: 'סְלִיחָה, אַתָּה יָכוֹל לַעֲזוֹר לִי?',
        romanized: 'Sliha, ata yachol laazor li?',
        hanzi: '不好意思，你能帮我吗？',
        hanziPhonetic: '斯利哈，阿塔 雅霍尔 拉阿佐 利？',
      },
      {
        hebrew: 'בְּטַח! מָה קָרָה?',
        romanized: 'Betach! Ma kara?',
        hanzi: '当然！发生什么了？',
        hanziPhonetic: '贝塔赫！玛 卡拉？',
      },
      {
        hebrew: 'אֲנִי לֹא מֵבִין אֶת הַתַּכְנִית.',
        romanized: 'Ani lo mevin et hatachnit.',
        hanzi: '我看不懂这张图纸。',
        hanziPhonetic: '阿尼 罗 梅文 艾特 哈塔赫尼特。',
      },
    ],
  },
  {
    id: 'end-of-day',
    titleZh: '下班道别',
    scenario: 'End of Workday',
    scenarioEmoji: '🌅',
    difficulty: 'beginner',
    lines: [
      {
        hebrew: 'יוֹם עֲבוֹדָה טוֹב! תּוֹדָה.',
        romanized: 'Yom avoda tov! Toda.',
        hanzi: '今天辛苦了！谢谢。',
        hanziPhonetic: '约姆 阿沃达 托夫！托达。',
      },
      {
        hebrew: 'לְהִתְרָאוֹת מָחָר.',
        romanized: 'Lehitraot machar.',
        hanzi: '明天见。',
        hanziPhonetic: '勒希特拉奥特 马哈尔。',
      },
      {
        hebrew: 'לַיְלָה טוֹב! נְסִיעָה טוֹבָה.',
        romanized: 'Layla tov! Nesiya tova.',
        hanzi: '晚安！一路平安。',
        hanziPhonetic: '莱拉 托夫！内西亚 托瓦。',
      },
    ],
  },
  {
    id: 'safety-site',
    titleZh: '工地安全提醒',
    scenario: 'Safety at Work',
    scenarioEmoji: '⛑️',
    difficulty: 'intermediate',
    lines: [
      {
        hebrew: 'שִׂים כּוֹבַע בְּטִיחוּת!',
        romanized: 'Sim kova bitachon!',
        hanzi: '戴上安全帽！',
        hanziPhonetic: '西姆 科瓦 比塔洪！',
      },
      {
        hebrew: 'כֵּן, סְלִיחָה. שָׁכַחְתִּי.',
        romanized: 'Ken, sliha. Shachachti.',
        hanzi: '好的，对不起。我忘了。',
        hanziPhonetic: '肯，斯利哈。沙哈赫提。',
      },
      {
        hebrew: 'זֶה חָשׁוּב לַבְּטִיחוּת שֶׁלְּךָ!',
        romanized: 'Ze chashuv labtikhut shelcha!',
        hanzi: '这对你的安全很重要！',
        hanziPhonetic: '泽 哈书夫 拉比提胡特 谢勒哈！',
      },
    ],
  },
  {
    id: 'directions',
    titleZh: '问路',
    scenario: 'Asking for Directions',
    scenarioEmoji: '🗺️',
    difficulty: 'intermediate',
    lines: [
      {
        hebrew: 'סְלִיחָה, אֵיפֹה הָאוֹטוֹבּוּס?',
        romanized: 'Sliha, eifo ha\'otobus?',
        hanzi: '请问，公交车站在哪里？',
        hanziPhonetic: '斯利哈，艾福 哈奥托巴斯？',
      },
      {
        hebrew: 'לֵךְ יָשָׁר וְאַחַר כָּךְ שְׂמֹאלָה.',
        romanized: 'Lech yashar ve\'achar kach smola.',
        hanzi: '直走然后向左转。',
        hanziPhonetic: '莱赫 雅沙尔 威阿哈尔 卡赫 斯莫拉。',
      },
      {
        hebrew: 'תּוֹדָה רַבָּה, אָחִי!',
        romanized: 'Toda raba, achi!',
        hanzi: '非常感谢，兄弟！',
        hanziPhonetic: '托达 拉巴，阿希！',
      },
    ],
  },
  {
    id: 'doctor',
    titleZh: '去诊所看病',
    scenario: 'At the Clinic',
    scenarioEmoji: '🏥',
    difficulty: 'intermediate',
    lines: [
      {
        hebrew: 'כֹּאֵב לִי הַגַּב.',
        romanized: "Ko'ev li hagav.",
        hanzi: '我的背很痛。',
        hanziPhonetic: '科艾夫 利 哈嘎夫。',
      },
      {
        hebrew: 'מֵאָתַיִם נְפִילָה?',
        romanized: 'Meataim nefila?',
        hanzi: '你是摔倒了吗？',
        hanziPhonetic: '梅阿塔伊姆 内费拉？',
      },
      {
        hebrew: 'כֵּן, בָּעֲבוֹדָה.',
        romanized: 'Ken, baavoda.',
        hanzi: '是的，在工作的时候。',
        hanziPhonetic: '肯，巴阿沃达。',
      },
    ],
  },
]

// Get daily dialogue based on current calendar date
export function getDailyDialogue(): Dialogue {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  return DIALOGUES[dayIndex % DIALOGUES.length]
}
