/* =====================================================================
   SATYANAND AYURVEDA — product catalogue
   ---------------------------------------------------------------------
   The whole shop is driven from this file. To add a product, copy one
   block and change it. Fields:

     id         unique, lowercase-with-dashes — used in the product URL
     name       full product name
     short      text printed on the pack illustration; "|" = line break
     form       Tablets, Churna, Tailam …
     category   one of the category ids below
     shape      pack illustration: bottle | jar | tall | dropper | pouch | tube | box | tin
     tone       pack label colour: forest | leaf | sprout | meadow | gold
     image      OPTIONAL path to a real product photo, e.g. 'assets/img/products/ashwagandha.jpg'
                (square, ~800×800). When set, it replaces the illustration.
     variants   pack sizes — id, label, price, mrp (price before discount)
     badges     any of: bestseller, new, trending, seasonal
     dosha      doshas it suits: vata, pitta, kapha — drives quiz picks
     stock      set to false to show "Sold out"

   ⚠️ Prices, pack sizes and descriptions are placeholders written for the
   design. Replace them with the real label text before launch.
   ===================================================================== */
(function () {
  'use strict';

  var v = function (id, label, price, mrp) { return { id: id, label: label, price: price, mrp: mrp }; };

  var categories = [
    { id: 'immunity',        name: 'Immunity',          blurb: 'Everyday defence, the classical way',  tint: '#E7F1D6' },
    { id: 'digestion',       name: 'Digestive Care',    blurb: 'Kindle agni, soothe the gut',           tint: '#F4EBCB' },
    { id: 'stress-sleep',    name: 'Stress & Sleep',    blurb: 'A calmer mind, deeper rest',           tint: '#E4ECD6' },
    { id: 'joint-care',      name: 'Joint & Muscle',    blurb: 'Move freely, naturally',               tint: '#F1E6C4' },
    { id: 'skin-care',       name: 'Skin Care',         blurb: 'Radiance through ritual',              tint: '#F3EBD4' },
    { id: 'hair-care',       name: 'Hair Care',         blurb: 'Rooted, nourished, strong',            tint: '#E6EFD2' },
    { id: 'womens-wellness', name: "Women's Wellness",  blurb: 'Balance through every phase',          tint: '#F2E7CB' },
    { id: 'mens-vitality',   name: "Men's Vitality",    blurb: 'Stamina and strength',                 tint: '#E2EBD2' },
    { id: 'liver-detox',     name: 'Liver & Detox',     blurb: 'Cleanse and restore',                  tint: '#EAF0D3' },
    { id: 'sugar-balance',   name: 'Sugar Balance',     blurb: 'Support healthy metabolism',           tint: '#EFE8C8' },
    { id: 'respiratory',     name: 'Respiratory Care',  blurb: 'Breathe easy, season to season',       tint: '#E5EDDA' },
    { id: 'teas-foods',      name: 'Teas & Foods',      blurb: 'Ayurveda for your kitchen',            tint: '#F3EACD' }
  ];

  var products = [
    /* ---------------- IMMUNITY ---------------- */
    {
      id: 'chyawanprash', name: 'Chyawanprash Special', short: 'Chyawan|prash', form: 'Avaleha',
      category: 'immunity', shape: 'jar', tone: 'forest',
      variants: [v('500g', '500 g', 349, 399), v('1kg', '1 kg', 649, 749)],
      badges: ['bestseller', 'seasonal'], dosha: ['vata', 'pitta', 'kapha'],
      tagline: 'Amla-rich rasayana for everyday immunity',
      description: 'Slow-cooked the classical way — fresh amla simmered with cow ghee, honey and a family of herbs described in the Charaka Samhita. A spoonful a day is one of Ayurveda’s oldest rituals for strength through the changing seasons.',
      benefits: ['Supports natural immunity through the seasons', 'Amla is a traditional source of vitamin C', 'A rasayana for energy and vitality'],
      ingredients: ['Amla (Emblica officinalis)', 'Ashwagandha', 'Pippali', 'Dashmool', 'Cow ghee', 'Honey'],
      usage: 'Adults: 1–2 teaspoons daily with warm milk. Children above 5 years: ½ teaspoon. Or as directed by your physician.'
    },
    {
      id: 'giloy-tablets', name: 'Giloy Tablets', short: 'Giloy', form: 'Tablets',
      category: 'immunity', shape: 'bottle', tone: 'leaf',
      variants: [v('60', '60 Tabs', 199, 229), v('120', '120 Tabs', 369, 429)],
      badges: ['trending'], dosha: ['vata', 'pitta', 'kapha'],
      tagline: 'Guduchi — the “root of immortality”',
      description: 'Guduchi (Tinospora cordifolia) is revered in Ayurveda as amrita. Each tablet carries a standardised extract of the stem, for daily resilience during seasonal change.',
      benefits: ['Traditionally used to support immunity', 'Helps the body cope with seasonal change', 'Gentle enough for daily use'],
      ingredients: ['Guduchi stem extract (Tinospora cordifolia)'],
      usage: '1–2 tablets twice daily after meals with water, or as directed by your physician.'
    },
    {
      id: 'tulsi-drops', name: 'Panch Tulsi Drops', short: 'Panch|Tulsi', form: 'Drops',
      category: 'immunity', shape: 'dropper', tone: 'forest',
      variants: [v('20ml', '20 ml', 149, 175), v('2x20ml', '2 × 20 ml', 279, 350)],
      badges: ['new'], dosha: ['vata', 'kapha'],
      tagline: 'Five sacred basils in one drop',
      description: 'A concentrate of five varieties of tulsi — Rama, Shyama, Vana, Kapoor and Marua. Add a few drops to warm water or tea for a fragrant daily ritual.',
      benefits: ['Traditionally used for respiratory comfort', 'Supports natural defences', 'Easy to add to water or tea'],
      ingredients: ['Rama tulsi', 'Shyama tulsi', 'Vana tulsi', 'Kapoor tulsi', 'Marua tulsi'],
      usage: '2–3 drops in a cup of warm water or tea, twice daily.'
    },
    {
      id: 'amla-juice', name: 'Amla Juice', short: 'Amla|Juice', form: 'Swaras',
      category: 'immunity', shape: 'tall', tone: 'sprout',
      variants: [v('500ml', '500 ml', 179, 199), v('1l', '1 L', 329, 379)],
      badges: [], dosha: ['pitta', 'vata'],
      tagline: 'Cold-pressed Indian gooseberry',
      description: 'Pressed from ripe Indian gooseberries with nothing added but what keeps it fresh. Amla is prized in Ayurveda as a cooling, rejuvenating fruit for skin, hair and digestion.',
      benefits: ['Traditional source of vitamin C', 'Supports digestion and metabolism', 'Cooling — balances pitta'],
      ingredients: ['Amla juice (Emblica officinalis)'],
      usage: '20–30 ml mixed with an equal quantity of water, on an empty stomach in the morning.'
    },
    {
      id: 'ayush-kadha', name: 'Ayush Kadha', short: 'Ayush|Kadha', form: 'Kwath',
      category: 'immunity', shape: 'box', tone: 'gold',
      variants: [v('100g', '100 g', 199, 240)],
      badges: ['seasonal'], dosha: ['vata', 'kapha'],
      tagline: 'Warming herbal decoction for cold days',
      description: 'A warming blend of tulsi, dalchini, sunthi and kali mirch, prepared the way it has been in Indian kitchens for generations. Simmer, sip and breathe.',
      benefits: ['Warming comfort in cold weather', 'Traditionally used for seasonal wellness', 'Made from whole kitchen spices'],
      ingredients: ['Tulsi', 'Dalchini (cinnamon)', 'Sunthi (dry ginger)', 'Kali mirch (black pepper)'],
      usage: 'Boil 3 g in 150 ml of water until reduced to half. Strain and sip warm, once or twice daily.'
    },

    /* ---------------- DIGESTION ---------------- */
    {
      id: 'triphala-tablets', name: 'Triphala Tablets', short: 'Triphala', form: 'Tablets',
      category: 'digestion', shape: 'bottle', tone: 'meadow',
      variants: [v('60', '60 Tabs', 169, 199), v('120', '120 Tabs', 299, 349)],
      badges: ['bestseller'], dosha: ['vata', 'pitta', 'kapha'],
      tagline: 'Three fruits for gentle daily cleansing',
      description: 'Amalaki, Bibhitaki and Haritaki in equal parts — Ayurveda’s best-known formula for regular digestion and gentle detoxification, balanced for all three doshas.',
      benefits: ['Supports regular bowel movement', 'Gentle, daily internal cleanse', 'Suitable for all body types'],
      ingredients: ['Amalaki (Emblica officinalis)', 'Bibhitaki (Terminalia bellirica)', 'Haritaki (Terminalia chebula)'],
      usage: '2 tablets at bedtime with warm water, or as directed by your physician.'
    },
    {
      id: 'triphala-churna', name: 'Triphala Churna', short: 'Triphala|Churna', form: 'Churna',
      category: 'digestion', shape: 'pouch', tone: 'forest',
      variants: [v('100g', '100 g', 99, 120), v('250g', '250 g', 219, 260)],
      badges: [], dosha: ['vata', 'pitta', 'kapha'],
      tagline: 'The classical powder, finely milled',
      description: 'The same three fruits in the traditional powder form, stone-ground for those who prefer the classical way of taking Triphala.',
      benefits: ['Supports digestion and elimination', 'Traditional eye-wash and gargle uses', 'Economical classical format'],
      ingredients: ['Amalaki', 'Bibhitaki', 'Haritaki'],
      usage: '½–1 teaspoon with warm water at bedtime.'
    },
    {
      id: 'hingwashtak-churna', name: 'Hingwashtak Churna', short: 'Hingwashtak', form: 'Churna',
      category: 'digestion', shape: 'jar', tone: 'gold',
      variants: [v('50g', '50 g', 119, 140)],
      badges: [], dosha: ['vata', 'kapha'],
      tagline: 'Eight-spice relief for gas and bloating',
      description: 'A classical blend led by hing (asafoetida) with ajwain, jeera and trikatu. Taken with the first morsel of a meal, it has long been used to kindle agni and ease bloating.',
      benefits: ['Traditionally used for gas and bloating', 'Kindles digestive fire (agni)', 'Classical formulation'],
      ingredients: ['Hing (asafoetida)', 'Ajwain', 'Jeera', 'Sunthi', 'Pippali', 'Kali mirch', 'Saindhava lavana'],
      usage: '½ teaspoon mixed with the first morsel of rice and ghee, or with warm water after meals.'
    },
    {
      id: 'avipattikar-churna', name: 'Avipattikar Churna', short: 'Avipattikar', form: 'Churna',
      category: 'digestion', shape: 'pouch', tone: 'sprout',
      variants: [v('100g', '100 g', 139, 160)],
      badges: ['trending'], dosha: ['pitta'],
      tagline: 'Cooling support for acidity',
      description: 'A pitta-pacifying classical formula described in the Bhaishajya Ratnavali, used to cool and settle the stomach after spicy or heavy food.',
      benefits: ['Traditionally used for acidity and heartburn', 'Cools excess pitta', 'Supports comfortable digestion'],
      ingredients: ['Trivrit', 'Amalaki', 'Musta', 'Vidanga', 'Ela (cardamom)', 'Mishri'],
      usage: '½–1 teaspoon with water before meals, or as directed by your physician.'
    },
    {
      id: 'isabgol', name: 'Isabgol Husk', short: 'Isabgol', form: 'Husk',
      category: 'digestion', shape: 'box', tone: 'meadow',
      variants: [v('100g', '100 g', 129, 150), v('200g', '200 g', 239, 280)],
      badges: [], dosha: ['vata', 'pitta'],
      tagline: 'Pure psyllium for gentle regularity',
      description: 'Clean, sieved psyllium husk — a natural source of soluble fibre that supports comfortable, regular digestion.',
      benefits: ['Natural source of dietary fibre', 'Supports regularity', 'Gentle on the stomach'],
      ingredients: ['Psyllium husk (Plantago ovata)'],
      usage: '1–2 teaspoons in a glass of water or milk at bedtime. Drink plenty of water through the day.'
    },

    /* ---------------- STRESS & SLEEP ---------------- */
    {
      id: 'ashwagandha-tablets', name: 'Ashwagandha Tablets', short: 'Ashwa|gandha', form: 'Tablets',
      category: 'stress-sleep', shape: 'bottle', tone: 'forest',
      variants: [v('60', '60 Tabs', 249, 299), v('120', '120 Tabs', 459, 549)],
      badges: ['bestseller'], dosha: ['vata', 'kapha'],
      tagline: 'Calm energy and stress resilience',
      description: 'Ashwagandha root, Ayurveda’s premier adaptogen, for steady energy by day and restful sleep by night. Made from root only — never leaves.',
      benefits: ['Helps the body adapt to everyday stress', 'Supports strength and stamina', 'Promotes restful sleep'],
      ingredients: ['Ashwagandha root extract (Withania somnifera)'],
      usage: '1 tablet twice daily after meals with warm milk or water, or as directed by your physician.'
    },
    {
      id: 'brahmi-tablets', name: 'Brahmi Tablets', short: 'Brahmi', form: 'Tablets',
      category: 'stress-sleep', shape: 'bottle', tone: 'sprout',
      variants: [v('60', '60 Tabs', 199, 235)],
      badges: [], dosha: ['vata', 'pitta'],
      tagline: 'For focus, memory and a quiet mind',
      description: 'Brahmi (Bacopa monnieri) is the classical medhya rasayana — the herb of the intellect — traditionally taken by students and seekers for clarity and calm.',
      benefits: ['Traditionally used to support memory and focus', 'Calms a restless mind', 'Medhya rasayana for the intellect'],
      ingredients: ['Brahmi extract (Bacopa monnieri)'],
      usage: '1 tablet twice daily after meals, or as directed by your physician.'
    },
    {
      id: 'shankhpushpi-syrup', name: 'Shankhpushpi Syrup', short: 'Shankh|pushpi', form: 'Syrup',
      category: 'stress-sleep', shape: 'tall', tone: 'gold',
      variants: [v('200ml', '200 ml', 159, 180)],
      badges: [], dosha: ['vata', 'pitta'],
      tagline: 'A gentle brain tonic for the whole family',
      description: 'Shankhpushpi with brahmi and vacha in a pleasant syrup — a classical brain tonic enjoyed by children and adults alike.',
      benefits: ['Supports concentration', 'Soothes mental fatigue', 'Family-friendly taste'],
      ingredients: ['Shankhpushpi', 'Brahmi', 'Vacha', 'Mulethi'],
      usage: 'Adults: 2 teaspoons twice daily. Children: 1 teaspoon twice daily.'
    },
    {
      id: 'sukh-nidra', name: 'Sukh Nidra Tablets', short: 'Sukh|Nidra', form: 'Tablets',
      category: 'stress-sleep', shape: 'bottle', tone: 'meadow',
      variants: [v('30', '30 Tabs', 299, 349), v('60', '60 Tabs', 549, 649)],
      badges: ['new'], dosha: ['vata', 'pitta'],
      tagline: 'Drift off naturally — non-habit forming',
      description: 'Jatamansi, tagar and brahmi, three herbs Ayurveda has long turned to for the restless mind, blended for a natural wind-down at the end of the day.',
      benefits: ['Supports falling asleep naturally', 'Helps quieten a racing mind', 'Non-habit forming herbs'],
      ingredients: ['Jatamansi', 'Tagar', 'Brahmi', 'Ashwagandha'],
      usage: '1–2 tablets 30 minutes before bedtime with warm milk.'
    },

    /* ---------------- JOINT & MUSCLE ---------------- */
    {
      id: 'mahanarayan-tailam', name: 'Mahanarayan Tailam', short: 'Maha|narayan', form: 'Tailam',
      category: 'joint-care', shape: 'tall', tone: 'gold',
      variants: [v('100ml', '100 ml', 189, 215), v('200ml', '200 ml', 349, 399)],
      badges: ['bestseller'], dosha: ['vata'],
      tagline: 'Classical massage oil for joints and muscles',
      description: 'Over thirty herbs cooked into sesame oil by the classical taila-paka method. Warm a little and massage into stiff joints and tired muscles.',
      benefits: ['Soothes stiff joints and tired muscles', 'Classical taila-paka preparation', 'Ideal for abhyanga (self-massage)'],
      ingredients: ['Tila taila (sesame oil)', 'Bala', 'Ashwagandha', 'Shatavari', 'Dashmool', 'Rasna'],
      usage: 'Warm slightly and massage gently over the affected area for 10–15 minutes, followed by a warm compress. For external use only.'
    },
    {
      id: 'yograj-guggulu', name: 'Yograj Guggulu', short: 'Yograj|Guggulu', form: 'Tablets',
      category: 'joint-care', shape: 'bottle', tone: 'meadow',
      variants: [v('60', '60 Tabs', 219, 250)],
      badges: [], dosha: ['vata', 'kapha'],
      tagline: 'Classical guggulu for joint comfort',
      description: 'A time-honoured guggulu formulation from the Sharangdhara Samhita, traditionally used to support mobility and comfort in the joints.',
      benefits: ['Traditionally used for joint comfort', 'Supports flexibility and mobility', 'Classical guggulu base'],
      ingredients: ['Shuddha guggulu', 'Chitrak', 'Pippali', 'Triphala', 'Vidanga'],
      usage: '1–2 tablets twice daily after meals with warm water, or as directed by your physician.'
    },
    {
      id: 'pain-relief-balm', name: 'Vedanahar Balm', short: 'Vedanahar|Balm', form: 'Balm',
      category: 'joint-care', shape: 'tin', tone: 'forest',
      variants: [v('25g', '25 g', 129, 150)],
      badges: ['trending'], dosha: ['vata', 'kapha'],
      tagline: 'Warming herbal balm for aches',
      description: 'Wintergreen, eucalyptus, camphor and pudina in a clean balm base — a pocket-sized comfort for headaches, stiff necks and tired feet.',
      benefits: ['Fast warming comfort', 'For head, neck, back and feet', 'Pocket-size tin'],
      ingredients: ['Gandhapura (wintergreen) oil', 'Nilgiri (eucalyptus) oil', 'Karpoor (camphor)', 'Pudina satva (menthol)'],
      usage: 'Apply a small amount and rub gently. Avoid eyes and broken skin. For external use only.'
    },

    /* ---------------- SKIN CARE ---------------- */
    {
      id: 'kumkumadi-tailam', name: 'Kumkumadi Tailam', short: 'Kumkumadi|Tailam', form: 'Face Oil',
      category: 'skin-care', shape: 'dropper', tone: 'gold',
      variants: [v('15ml', '15 ml', 549, 649), v('30ml', '30 ml', 949, 1099)],
      badges: ['bestseller'], dosha: ['vata', 'pitta', 'kapha'],
      tagline: 'Saffron night elixir for radiant skin',
      description: 'The legendary beauty oil of Ayurveda — kumkuma (saffron), sandalwood, manjistha and lotus, infused in a light base. A few drops at night for a luminous, even-looking complexion.',
      benefits: ['For a radiant, even-looking complexion', 'Light, non-sticky finish', 'Suits all skin types'],
      ingredients: ['Kumkuma (saffron)', 'Chandan (sandalwood)', 'Manjistha', 'Lotus', 'Yashtimadhu'],
      usage: 'Warm 3–4 drops between fingertips and massage into clean skin at night. Patch test before first use.'
    },
    {
      id: 'neem-tulsi-face-wash', name: 'Neem Tulsi Face Wash', short: 'Neem|Tulsi', form: 'Face Wash',
      category: 'skin-care', shape: 'tube', tone: 'leaf',
      variants: [v('100ml', '100 ml', 179, 199)],
      badges: [], dosha: ['pitta', 'kapha'],
      tagline: 'Purifying daily cleanse for clear skin',
      description: 'Neem and tulsi, the two great purifiers of Ayurveda, in a gentle soap-free gel that cleans without stripping.',
      benefits: ['Purifies without over-drying', 'Helps control excess oil', 'Soap-free gentle gel'],
      ingredients: ['Neem', 'Tulsi', 'Aloe vera', 'Haldi'],
      usage: 'Massage onto damp face morning and night, rinse with water.'
    },
    {
      id: 'haldi-chandan-ubtan', name: 'Haldi Chandan Ubtan', short: 'Haldi|Chandan', form: 'Ubtan',
      category: 'skin-care', shape: 'jar', tone: 'gold',
      variants: [v('100g', '100 g', 249, 299)],
      badges: ['new'], dosha: ['pitta', 'kapha'],
      tagline: 'The bridal glow ritual, bottled',
      description: 'Besan, haldi, chandan and rose petals — the traditional Indian ubtan used before weddings and festivals for soft, bright skin.',
      benefits: ['Gently exfoliates', 'For soft, bright-looking skin', 'Traditional festive ritual'],
      ingredients: ['Besan (gram flour)', 'Haldi (turmeric)', 'Chandan (sandalwood)', 'Rose petal powder', 'Masoor dal'],
      usage: 'Mix 1–2 teaspoons with rose water or milk into a paste. Apply for 10 minutes, then scrub gently while rinsing. 2–3 times a week.'
    },
    {
      id: 'rose-water', name: 'Pure Rose Water', short: 'Gulab|Jal', form: 'Toner',
      category: 'skin-care', shape: 'tall', tone: 'meadow',
      variants: [v('100ml', '100 ml', 149, 175), v('200ml', '200 ml', 249, 299)],
      badges: [], dosha: ['pitta'],
      tagline: 'Steam-distilled from fresh rose petals',
      description: 'True gulab jal, steam-distilled from fresh petals. A cooling toner, a mist for hot afternoons and the base for every face pack.',
      benefits: ['Cooling, refreshing toner', 'Helps balance skin', 'Base for face packs'],
      ingredients: ['Rose distillate (Rosa damascena)'],
      usage: 'Apply with cotton after cleansing, or mist onto the face through the day.'
    },
    {
      id: 'aloe-vera-gel', name: 'Aloe Vera Gel', short: 'Aloe|Vera', form: 'Gel',
      category: 'skin-care', shape: 'tube', tone: 'sprout',
      variants: [v('150g', '150 g', 169, 199)],
      badges: [], dosha: ['pitta'],
      tagline: 'Soothing hydration for skin and hair',
      description: 'A cooling gel made from fresh aloe leaves — for sun-tired skin, post-shave calm or a light daily moisturiser.',
      benefits: ['Soothes and cools the skin', 'Light, non-greasy hydration', 'For face, body and hair'],
      ingredients: ['Aloe vera leaf juice', 'Cucumber extract', 'Vitamin E'],
      usage: 'Apply a thin layer to clean skin as often as needed.'
    },

    /* ---------------- HAIR CARE ---------------- */
    {
      id: 'bhringraj-hair-oil', name: 'Bhringraj Hair Oil', short: 'Bhringraj', form: 'Hair Oil',
      category: 'hair-care', shape: 'tall', tone: 'forest',
      variants: [v('100ml', '100 ml', 229, 260), v('200ml', '200 ml', 399, 460)],
      badges: ['bestseller'], dosha: ['pitta', 'vata'],
      tagline: 'The king of herbs for hair',
      description: 'Bhringraj, amla and brahmi slow-cooked in coconut and sesame oils. Warm, massage into the scalp and let the ritual do its work.',
      benefits: ['Nourishes scalp and roots', 'Traditionally used for strong, thick hair', 'Relaxing scalp-massage ritual'],
      ingredients: ['Bhringraj', 'Amla', 'Brahmi', 'Coconut oil', 'Tila taila (sesame oil)'],
      usage: 'Massage into the scalp, leave for at least an hour or overnight, then wash. 2–3 times a week.'
    },
    {
      id: 'amla-reetha-shampoo', name: 'Amla Reetha Shikakai Shampoo', short: 'Amla|Reetha', form: 'Shampoo',
      category: 'hair-care', shape: 'tall', tone: 'sprout',
      variants: [v('200ml', '200 ml', 249, 299)],
      badges: [], dosha: ['vata', 'pitta', 'kapha'],
      tagline: 'The grandmother’s hair wash, made easy',
      description: 'The three classic hair-washing fruits — amla, reetha and shikakai — in a mild, everyday shampoo.',
      benefits: ['Gentle everyday cleansing', 'Leaves hair soft and manageable', 'Traditional hair-wash herbs'],
      ingredients: ['Amla', 'Reetha (soapnut)', 'Shikakai', 'Hibiscus'],
      usage: 'Lather on wet hair, massage and rinse well.'
    },

    /* ---------------- WOMEN'S WELLNESS ---------------- */
    {
      id: 'shatavari-tablets', name: 'Shatavari Tablets', short: 'Shatavari', form: 'Tablets',
      category: 'womens-wellness', shape: 'bottle', tone: 'gold',
      variants: [v('60', '60 Tabs', 229, 265), v('120', '120 Tabs', 429, 499)],
      badges: ['bestseller'], dosha: ['vata', 'pitta'],
      tagline: 'Nourishment through every stage of life',
      description: 'Shatavari — “she who possesses a hundred roots” — is Ayurveda’s foremost herb for women, traditionally used for hormonal balance and vitality.',
      benefits: ['Traditionally used for hormonal balance', 'Supports vitality and strength', 'Cooling and nourishing'],
      ingredients: ['Shatavari root extract (Asparagus racemosus)'],
      usage: '1 tablet twice daily after meals with warm milk, or as directed by your physician.'
    },
    {
      id: 'ashokarishta', name: 'Ashokarishta', short: 'Ashok|arishta', form: 'Arishta',
      category: 'womens-wellness', shape: 'tall', tone: 'forest',
      variants: [v('450ml', '450 ml', 219, 250)],
      badges: [], dosha: ['pitta', 'kapha'],
      tagline: 'Classical tonic for menstrual wellness',
      description: 'A naturally fermented arishta built around the bark of the Ashoka tree, traditionally used for menstrual comfort and regularity.',
      benefits: ['Traditionally used for menstrual comfort', 'Supports regular cycles', 'Naturally fermented classical tonic'],
      ingredients: ['Ashoka bark', 'Dhataki pushpa', 'Musta', 'Jeeraka', 'Amalaki'],
      usage: '15–20 ml with an equal quantity of water after meals, twice daily.'
    },

    /* ---------------- MEN'S VITALITY ---------------- */
    {
      id: 'shilajit-resin', name: 'Himalayan Shilajit Resin', short: 'Shilajit', form: 'Resin',
      category: 'mens-vitality', shape: 'jar', tone: 'forest',
      variants: [v('20g', '20 g', 799, 999)],
      badges: ['trending'], dosha: ['vata', 'kapha'],
      tagline: 'Purified mineral pitch from high altitude',
      description: 'Shodhita (purified) shilajit resin, the mineral-rich pitch that seeps from Himalayan rock — a classical rasayana for stamina and strength.',
      benefits: ['Traditionally used for stamina and strength', 'Rich in naturally occurring fulvic acid', 'Purified by the classical shodhana method'],
      ingredients: ['Shuddha shilajit'],
      usage: 'Dissolve a pea-sized portion (300–500 mg) in warm milk or water, once daily.'
    },
    {
      id: 'kaunch-beej-churna', name: 'Kaunch Beej Churna', short: 'Kaunch|Beej', form: 'Churna',
      category: 'mens-vitality', shape: 'pouch', tone: 'gold',
      variants: [v('100g', '100 g', 249, 280)],
      badges: [], dosha: ['vata'],
      tagline: 'Velvet bean for vigour',
      description: 'Seeds of Mucuna pruriens, processed in the classical way and finely powdered — a traditional vajikarana herb for vigour and vitality.',
      benefits: ['Traditionally used for vigour and vitality', 'Supports strength', 'Classical vajikarana herb'],
      ingredients: ['Kaunch beej (Mucuna pruriens) seed powder'],
      usage: '½ teaspoon with warm milk twice daily, or as directed by your physician.'
    },
    {
      id: 'safed-musli', name: 'Safed Musli Capsules', short: 'Safed|Musli', form: 'Capsules',
      category: 'mens-vitality', shape: 'bottle', tone: 'meadow',
      variants: [v('60', '60 Caps', 349, 399)],
      badges: [], dosha: ['vata', 'pitta'], stock: false,
      tagline: 'Strength and stamina, the Ayurvedic way',
      description: 'Safed musli root, long valued in Ayurveda for strength and stamina, in easy vegetarian capsules.',
      benefits: ['Supports strength and stamina', 'Vegetarian capsules', 'Traditional rasayana herb'],
      ingredients: ['Safed musli root extract (Chlorophytum borivilianum)'],
      usage: '1 capsule twice daily with milk, or as directed by your physician.'
    },

    /* ---------------- LIVER & DETOX ---------------- */
    {
      id: 'liver-care-tablets', name: 'Liver Care Tablets', short: 'Liver|Care', form: 'Tablets',
      category: 'liver-detox', shape: 'bottle', tone: 'leaf',
      variants: [v('60', '60 Tabs', 279, 320)],
      badges: [], dosha: ['pitta', 'kapha'],
      tagline: 'Bhumi amla, kutki and punarnava for the liver',
      description: 'Classical hepatic herbs — bhumi amla, kutki, kalmegh and punarnava — to support the liver in its daily work of cleansing.',
      benefits: ['Supports healthy liver function', 'Aids natural detoxification', 'Supports digestion and appetite'],
      ingredients: ['Bhumi amla', 'Kutki', 'Kalmegh', 'Punarnava', 'Makoy'],
      usage: '1–2 tablets twice daily after meals, or as directed by your physician.'
    },
    {
      id: 'bhumi-amla-churna', name: 'Bhumi Amla Churna', short: 'Bhumi|Amla', form: 'Churna',
      category: 'liver-detox', shape: 'pouch', tone: 'sprout',
      variants: [v('100g', '100 g', 129, 150)],
      badges: [], dosha: ['pitta', 'kapha'],
      tagline: 'A single-herb classic for liver health',
      description: 'Whole-plant Phyllanthus niruri, shade-dried and finely powdered — a bitter, cooling herb long used to support the liver.',
      benefits: ['Traditionally used for liver health', 'Cooling and bitter — calms pitta', 'Single-herb purity'],
      ingredients: ['Bhumi amla whole plant (Phyllanthus niruri)'],
      usage: '½ teaspoon with water twice daily after meals.'
    },

    /* ---------------- SUGAR BALANCE ---------------- */
    {
      id: 'madhu-santulan', name: 'Madhu Santulan Tablets', short: 'Madhu|Santulan', form: 'Tablets',
      category: 'sugar-balance', shape: 'bottle', tone: 'forest',
      variants: [v('60', '60 Tabs', 299, 349), v('120', '120 Tabs', 549, 649)],
      badges: ['trending'], dosha: ['kapha'],
      tagline: 'Gudmar, jamun and karela for metabolic balance',
      description: 'Gudmar — the “sugar destroyer” — with jamun seed, karela and vijaysar, to support healthy blood sugar levels alongside a balanced diet. Not a substitute for prescribed medication.',
      benefits: ['Supports healthy blood sugar as part of a balanced diet', 'Supports metabolism', 'Classical kapha-balancing herbs'],
      ingredients: ['Gudmar', 'Jamun seed', 'Karela', 'Vijaysar', 'Methi'],
      usage: '1–2 tablets twice daily before meals. Consult your physician if you are on diabetes medication.'
    },
    {
      id: 'karela-jamun-juice', name: 'Karela Jamun Juice', short: 'Karela|Jamun', form: 'Juice',
      category: 'sugar-balance', shape: 'tall', tone: 'leaf',
      variants: [v('500ml', '500 ml', 199, 230), v('1l', '1 L', 349, 420)],
      badges: [], dosha: ['kapha', 'pitta'],
      tagline: 'Bitter gourd and jamun, pressed together',
      description: 'Karela and jamun, the two bitters most trusted in Indian homes, pressed together into a morning tonic for metabolic balance.',
      benefits: ['Supports healthy glucose metabolism', 'Bitter taste balances kapha', 'Convenient morning tonic'],
      ingredients: ['Karela (bitter gourd) juice', 'Jamun juice'],
      usage: '30 ml with an equal quantity of water on an empty stomach in the morning.'
    },

    /* ---------------- RESPIRATORY ---------------- */
    {
      id: 'vasaka-tulsi-syrup', name: 'Vasaka Tulsi Cough Syrup', short: 'Vasaka|Tulsi', form: 'Syrup',
      category: 'respiratory', shape: 'tall', tone: 'sprout',
      variants: [v('100ml', '100 ml', 119, 135), v('200ml', '200 ml', 199, 230)],
      badges: ['seasonal'], dosha: ['kapha', 'vata'],
      tagline: 'Soothing herbal syrup for cough and throat',
      description: 'Vasaka, tulsi and mulethi in a honey-sweet syrup that soothes the throat and helps loosen cough. Non-drowsy.',
      benefits: ['Soothes an irritated throat', 'Helps loosen cough', 'Non-drowsy herbal formula'],
      ingredients: ['Vasaka (Adhatoda vasica)', 'Tulsi', 'Mulethi', 'Kantakari', 'Honey'],
      usage: 'Adults: 2 teaspoons three times a day. Children: 1 teaspoon three times a day.'
    },
    {
      id: 'anu-tailam', name: 'Anu Tailam', short: 'Anu|Tailam', form: 'Nasya Oil',
      category: 'respiratory', shape: 'dropper', tone: 'meadow',
      variants: [v('10ml', '10 ml', 99, 115), v('25ml', '25 ml', 179, 210)],
      badges: [], dosha: ['vata', 'kapha'],
      tagline: 'Classical nasal drops for a clear head',
      description: 'The nasya oil of the Ashtanga Hridayam — a daily practice for clear nasal passages, a light head and calm senses.',
      benefits: ['Traditionally used for nasal congestion', 'Part of the daily nasya ritual', 'Classical formulation'],
      ingredients: ['Jivanti', 'Devdaru', 'Bilva', 'Tila taila (sesame oil)'],
      usage: '2 drops in each nostril in the morning on an empty stomach. Warm the bottle slightly before use.'
    },
    {
      id: 'sitopaladi-churna', name: 'Sitopaladi Churna', short: 'Sitopaladi', form: 'Churna',
      category: 'respiratory', shape: 'jar', tone: 'leaf',
      variants: [v('50g', '50 g', 119, 140)],
      badges: ['seasonal'], dosha: ['kapha', 'pitta'],
      tagline: 'Sweet classical powder for chest comfort',
      description: 'Mishri, vanshlochan, pippali, ela and dalchini — the gentle five-ingredient classic for seasonal cough and chest comfort, taken with honey.',
      benefits: ['Traditionally used for seasonal cough', 'Gentle enough for children', 'Classical five-ingredient formula'],
      ingredients: ['Mishri', 'Vanshlochan', 'Pippali', 'Ela (cardamom)', 'Dalchini (cinnamon)'],
      usage: '½ teaspoon mixed with honey, two to three times a day.'
    },

    /* ---------------- TEAS & FOODS ---------------- */
    {
      id: 'tulsi-green-tea', name: 'Tulsi Green Tea', short: 'Tulsi|Green Tea', form: 'Tea',
      category: 'teas-foods', shape: 'box', tone: 'leaf',
      variants: [v('25', '25 Bags', 199, 240)],
      badges: ['new'], dosha: ['kapha', 'vata'],
      tagline: 'Holy basil meets fine green tea',
      description: 'Three kinds of tulsi blended with delicate green tea — a calming, antioxidant-rich cup to replace your second coffee.',
      benefits: ['Calming, antioxidant-rich cup', 'A gentle alternative to coffee', 'Individually sealed bags'],
      ingredients: ['Green tea', 'Rama tulsi', 'Krishna tulsi', 'Vana tulsi'],
      usage: 'Steep one bag in hot (not boiling) water for 2–3 minutes. 2–3 cups a day.'
    },
    {
      id: 'bilona-ghee', name: 'Bilona Cow Ghee', short: 'Bilona|Ghee', form: 'Ghee',
      category: 'teas-foods', shape: 'jar', tone: 'gold',
      variants: [v('500ml', '500 ml', 899, 999), v('1l', '1 L', 1699, 1899)],
      badges: [], dosha: ['vata', 'pitta'],
      tagline: 'Hand-churned from curd, the traditional way',
      description: 'Made by the bilona method — curd is hand-churned into butter, then slowly simmered into golden, grainy ghee. In Ayurveda, ghee is the carrier that takes herbs deep into the tissues.',
      benefits: ['Traditional bilona process', 'Rich aroma and granular texture', 'Classical anupana (herb carrier)'],
      ingredients: ['Cow milk ghee'],
      usage: 'Use in cooking, over rice and rotis, or 1 teaspoon with warm milk at night.'
    },
    {
      id: 'golden-milk', name: 'Haldi Golden Milk Mix', short: 'Golden|Milk', form: 'Mix',
      category: 'teas-foods', shape: 'jar', tone: 'meadow',
      variants: [v('100g', '100 g', 249, 280)],
      badges: ['trending'], dosha: ['kapha', 'vata'],
      tagline: 'Haldi, ashwagandha and spices for bedtime',
      description: 'Turmeric with black pepper, ashwagandha, cinnamon and cardamom — stir into warm milk for the bedtime cup Indian grandmothers swear by.',
      benefits: ['Warm, comforting bedtime ritual', 'Turmeric with black pepper', 'Ready in a minute'],
      ingredients: ['Haldi (turmeric)', 'Kali mirch (black pepper)', 'Ashwagandha', 'Dalchini', 'Ela', 'Sunthi'],
      usage: 'Stir 1 teaspoon into a cup of warm milk. Sweeten with jaggery if you like.'
    },
    {
      id: 'jaggery-powder', name: 'Desi Jaggery Powder', short: 'Jaggery', form: 'Gur',
      category: 'teas-foods', shape: 'pouch', tone: 'gold',
      variants: [v('500g', '500 g', 119, 140)],
      badges: [], dosha: ['vata', 'pitta'],
      tagline: 'Chemical-free gur from sugarcane',
      description: 'Sugarcane juice, slowly boiled and powdered — no chemicals used in clarification. A mineral-rich swap for refined sugar in tea, sweets and golden milk.',
      benefits: ['A traditional alternative to refined sugar', 'No chemicals used in clarification', 'Dissolves easily'],
      ingredients: ['Sugarcane jaggery'],
      usage: 'Use in place of sugar, spoon for spoon.'
    }
  ];

  window.SATYANAND_CATALOG = { categories: categories, products: products };
})();
