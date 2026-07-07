// AI Wishes Service — generates templated wishes by occasion
// Can be replaced with OpenAI / Gemini API calls in the future.

const wishesTemplates = {
  Birthday: [
    "🎂 Wishing you the happiest of birthdays! May this year bring you endless joy, laughter, and everything your heart desires. Celebrate big! 🎉",
    "✨ Another year older, another year wiser! May your birthday be filled with love, surprises, and unforgettable moments. You deserve the world! 🌟",
    "🎈 Happy Birthday! May your day sparkle with happiness and your year ahead be filled with wonderful adventures. Enjoy every moment! 🥳"
  ],
  Anniversary: [
    "💍 Happy Anniversary! Your love story is truly beautiful. Wishing you many more years of happiness, togetherness, and cherished memories. 💕",
    "🌹 Celebrating your love today! May your bond grow stronger with each passing year. Here's to a lifetime of love and joy! ✨",
    "💖 Happy Anniversary! Your journey together is an inspiration. Wishing you endless love, laughter, and happily ever afters! 🥂"
  ],
  Wedding: [
    "💒 Congratulations on your beautiful wedding! May your marriage be blessed with love, harmony, and a lifetime of wonderful memories. 🎊",
    "👰 Wishing the newlyweds a lifetime of love and happiness! May your journey together be as beautiful as your wedding day. 💐",
    "🤵 A beautiful beginning to a beautiful forever! Congratulations on finding your perfect match. Wishing you eternal bliss! 💫"
  ],
  Proposal: [
    "💍 She said YES! Congratulations on your engagement! May your love story continue to be magical and your future together be extraordinary. ✨",
    "🌹 What a beautiful proposal! Wishing you both a lifetime of love, laughter, and happily ever after. Congratulations! 💕",
    "💖 The beginning of forever! Congratulations on your engagement. May your love grow deeper with every passing moment. 🥂"
  ],
  Engagement: [
    "💍 Congratulations on your engagement! Two hearts, one love, forever together. Wishing you the happiest journey ahead! ✨",
    "🎉 Engaged! What wonderful news! May this exciting new chapter bring you both endless joy and beautiful memories. 💕",
    "🌟 Celebrating your engagement! May your love story be filled with magical moments and a lifetime of togetherness. 💖"
  ],
  'Baby Shower': [
    "🍼 Welcome to the wonderful world of parenthood! Wishing you and your little bundle of joy a lifetime of love and happiness. 👶",
    "🎀 A little miracle is on the way! May your baby shower be filled with joy, laughter, and beautiful blessings. 💕",
    "✨ Congratulations on your growing family! May your new arrival bring you infinite happiness and unforgettable moments. 🌟"
  ],
  Housewarming: [
    "🏠 Congratulations on your new home! May it be filled with love, warmth, laughter, and countless beautiful memories. 🎉",
    "✨ Welcome home! Wishing you peace, prosperity, and happiness in your beautiful new abode. May every corner be filled with joy! 🌟",
    "🏡 A new home, a new beginning! May your new space be blessed with love, health, and wonderful adventures. Congratulations! 💕"
  ],
  Graduation: [
    "🎓 Congratulations, Graduate! Your hard work and dedication have paid off. The world is yours — go make it extraordinary! 🌟",
    "🎉 Hats off to you, Graduate! May your future be as bright as your achievements. Dream big and soar high! ✨",
    "📚 What an incredible achievement! Congratulations on your graduation. The best is yet to come! 🎊"
  ],
  Retirement: [
    "🎉 Happy Retirement! You've earned every moment of this new chapter. May your days be filled with relaxation, joy, and adventure! ✨",
    "🌟 Cheers to a new beginning! Your dedication and hard work have been truly inspiring. Enjoy the well-deserved retirement! 🥂",
    "🎊 Congratulations on your retirement! May this new journey bring you peace, happiness, and all the things you love. 💕"
  ],
  "Mother's Day": [
    "🌸 Happy Mother's Day! To the most amazing woman — thank you for your unconditional love, strength, and beautiful heart. 💕",
    "💐 Celebrating the queen of our hearts! Happy Mother's Day to the most wonderful mother in the world. You are loved beyond measure! 💖",
    "🌹 Happy Mother's Day! Your love is the greatest gift of all. May today be as special as you make every day for us. ✨"
  ],
  "Father's Day": [
    "👔 Happy Father's Day! To the strongest, wisest, and most loving father — thank you for being our rock and inspiration. 💪",
    "🏆 Celebrating the world's greatest dad! Happy Father's Day! Your love and guidance mean everything to us. 💕",
    "🌟 Happy Father's Day! Thank you for always being there with your strength, wisdom, and unconditional love. You're the best! ✨"
  ],
  "Valentine's Day": [
    "💝 Happy Valentine's Day! You make every day feel like a love story. Here's to celebrating our beautiful journey together. 🌹",
    "💕 To my forever valentine — you are my greatest blessing. Happy Valentine's Day! May our love grow stronger each day. ✨",
    "🌹 Happy Valentine's Day! Love is the most beautiful gift, and I'm grateful to share it with you. 💖"
  ],
  Christmas: [
    "🎄 Merry Christmas! May this season fill your heart with joy, your home with warmth, and your life with beautiful blessings. ✨",
    "🎅 Wishing you a magical Christmas filled with love, laughter, and cherished moments with your loved ones. 🎁",
    "❄️ Merry Christmas! May the spirit of the season bring you peace, happiness, and all the gifts of love. 🌟"
  ],
  Diwali: [
    "🪔 Happy Diwali! May the festival of lights illuminate your life with prosperity, health, and endless happiness. ✨",
    "🎆 Wishing you a sparkling Diwali filled with love, laughter, and beautiful moments. May your life shine bright! 🪔",
    "✨ Happy Diwali! May every lamp light up your path to success, joy, and eternal blessings. Shubh Deepavali! 🌟"
  ],
  'New Year': [
    "🎆 Happy New Year! May this year bring you extraordinary adventures, beautiful memories, and all your dreams come true. ✨",
    "🥂 Cheers to a new year filled with new possibilities! Wishing you health, happiness, and success in everything you do. 🌟",
    "🎉 Happy New Year! May every day of this year be filled with love, laughter, and wonderful surprises. 💕"
  ],
  Congratulations: [
    "🎉 Congratulations! Your achievement is truly inspiring. Wishing you continued success and many more victories ahead! ✨",
    "🏆 What an incredible accomplishment! Congratulations! The world is brighter because of your hard work and dedication. 🌟",
    "🎊 Congratulations on this wonderful milestone! May this success be just the beginning of something extraordinary. 💫"
  ],
  'Corporate Celebration': [
    "🏢 Congratulations to the team! Your hard work and dedication have led to this incredible achievement. Here's to more success! 🎉",
    "🌟 Celebrating this corporate milestone! Your commitment to excellence is truly inspiring. Cheers to the team! 🥂",
    "🎊 What a remarkable achievement for the organization! Wishing you continued growth, innovation, and success. ✨"
  ],
  Festival: [
    "🎊 Wishing you a joyful and memorable festival celebration! May this occasion bring you happiness, love, and togetherness. ✨",
    "🌟 Happy Festivities! May this celebration fill your life with colors of joy, warmth, and beautiful memories. 💕",
    "🎉 Celebrating together! May this festival bring you prosperity, happiness, and countless blessings. Enjoy every moment! ✨"
  ],
  'Custom Occasion': [
    "🌟 What a special occasion to celebrate! Wishing you joy, happiness, and beautiful memories on this wonderful day. ✨",
    "💫 Every celebration makes life more beautiful! Wishing you a day filled with love, laughter, and cherished moments. 💕",
    "🎊 Here's to celebrating life's beautiful moments! May this day be as special and extraordinary as you are. 🌟"
  ]
};

const hashtagTemplates = {
  Birthday: ['#HappyBirthday', '#BirthdayCelebration', '#BirthdayWishes', '#CelebrateLife', '#GENZRoyalHampers'],
  Anniversary: ['#HappyAnniversary', '#LoveForever', '#AnniversaryCelebration', '#TogetherForever', '#GENZRoyalHampers'],
  Wedding: ['#JustMarried', '#WeddingCelebration', '#HappilyEverAfter', '#WeddingDay', '#GENZRoyalHampers'],
  Proposal: ['#SheSaidYes', '#Engaged', '#ProposalDay', '#LoveStory', '#GENZRoyalHampers'],
  Engagement: ['#Engaged', '#EngagementDay', '#ForeverBegins', '#RingDay', '#GENZRoyalHampers'],
  'Baby Shower': ['#BabyShower', '#BabyOnTheWay', '#NewArrival', '#BabyLove', '#GENZRoyalHampers'],
  Housewarming: ['#NewHome', '#Housewarming', '#HomeSweet', '#NewBeginnings', '#GENZRoyalHampers'],
  Graduation: ['#Graduation', '#ClassOf2026', '#ProudGraduate', '#Achievement', '#GENZRoyalHampers'],
  Retirement: ['#HappyRetirement', '#NewChapter', '#RetirementLife', '#Celebration', '#GENZRoyalHampers'],
  "Mother's Day": ['#MothersDay', '#BestMom', '#MomLove', '#ThankYouMom', '#GENZRoyalHampers'],
  "Father's Day": ['#FathersDay', '#BestDad', '#DadLove', '#ThankYouDad', '#GENZRoyalHampers'],
  "Valentine's Day": ['#ValentinesDay', '#LoveDay', '#ForeverLove', '#BeMyValentine', '#GENZRoyalHampers'],
  Christmas: ['#MerryChristmas', '#ChristmasJoy', '#HolidaySeason', '#FestiveSeason', '#GENZRoyalHampers'],
  Diwali: ['#HappyDiwali', '#FestivalOfLights', '#DiwaliCelebration', '#ShubhDiwali', '#GENZRoyalHampers'],
  'New Year': ['#HappyNewYear', '#NewYear2026', '#NewBeginnings', '#Cheers', '#GENZRoyalHampers'],
  Congratulations: ['#Congratulations', '#Achievement', '#Milestone', '#Proud', '#GENZRoyalHampers'],
  'Corporate Celebration': ['#CorporateEvent', '#TeamSuccess', '#BusinessMilestone', '#GrowthStory', '#GENZRoyalHampers'],
  Festival: ['#FestivalCelebration', '#Festivities', '#CelebrateLife', '#Joy', '#GENZRoyalHampers'],
  'Custom Occasion': ['#SpecialMoment', '#CelebrateLife', '#Memories', '#JoyfulDay', '#GENZRoyalHampers']
};

const giftSuggestions = {
  Birthday: ['Premium Cake Hamper', 'Luxury Chocolate Box', 'Personalised Gift Basket', 'Birthday Flower Bouquet', 'Royal Celebration Hamper'],
  Anniversary: ['Rose Gold Gift Set', 'Luxury Couple Hamper', 'Premium Wine & Cheese Basket', 'Personalised Photo Frame', 'Royal Anniversary Hamper'],
  Wedding: ['Premium Wedding Gift Box', 'Luxury Couple Hamper', 'Royal Crystal Set', 'Personalised Couple Gift', 'Grand Wedding Celebration Hamper'],
  Default: ['Premium Gift Hamper', 'Luxury Celebration Box', 'Royal Festive Basket', 'Personalised Keepsake Gift', 'Grand Celebration Hamper']
};

export function generateWishes(occasion) {
  const templates = wishesTemplates[occasion] || wishesTemplates['Custom Occasion'];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

export function generateHashtags(occasion) {
  return hashtagTemplates[occasion] || hashtagTemplates['Custom Occasion'];
}

export function generateGiftSuggestions(occasion) {
  return giftSuggestions[occasion] || giftSuggestions['Default'];
}
