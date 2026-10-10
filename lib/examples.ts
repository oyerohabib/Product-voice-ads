import type { LanguageCode } from "./languages";
import type { ProductDraft } from "./schemas";

export type ProductExample = {
  id: string;
  category: string;
  product: ProductDraft;
  scripts: Record<LanguageCode, string>;
};

export const EMPTY_PRODUCT: ProductDraft = {
  name: "",
  description: "",
  price: "",
  sellingPoints: "",
  tone: "friendly",
};

export const PRODUCT_EXAMPLES: ProductExample[] = [
  {
    id: "solar-fan",
    category: "Electronics",
    product: {
      name: "Solar Rechargeable Standing Fan (16-inch)",
      description:
        "A 16-inch standing fan with a built-in rechargeable battery and a solar panel included. Runs up to 10 hours on a full charge, has 3 speed settings, a remote control and a USB port for charging phones.",
      price: "₦45,000",
      sellingPoints: "Keeps working during power cuts, solar panel included, quiet motor",
      tone: "energetic",
    },
    scripts: {
      en: "Power cut again? Don't sweat it. Meet the Solar Rechargeable Standing Fan, a sixteen-inch fan that keeps the breeze going when the lights go off. Charge it with the solar panel in the box and get up to ten hours of cool air. Three speeds, a handy remote, and a USB port to charge your phone too. All for forty-five thousand naira. Order yours today and stay cool all night.",
      fr: "Encore une coupure de courant ? Pas de panique. Voici le ventilateur sur pied solaire rechargeable de seize pouces, qui continue de souffler quand la lumière s'éteint. Rechargez-le avec le panneau solaire inclus et profitez de jusqu'à dix heures d'air frais. Trois vitesses, une télécommande et un port USB pour recharger votre téléphone. Le tout pour quarante-cinq mille nairas. Commandez le vôtre dès aujourd'hui et restez au frais toute la nuit.",
      zh: "又停电了？别担心。这款十六英寸太阳能充电落地扇，停电的时候照样给你送来凉风。包装里附带太阳能板，白天晒一晒，充满电就能连续使用长达十个小时。三档风速随心调，配有遥控器，躺着也能操作，还有USB接口，可以顺便给手机充电。现在只要四万五千奈拉。赶快下单，让每个夜晚都清凉舒适！",
    },
  },
  {
    id: "aso-oke",
    category: "Fashion",
    product: {
      name: "Handwoven Aso-Oke Wrapper Set",
      description:
        "Handwoven on traditional looms in Iseyin. The set includes a wrapper, a gele head tie and a shoulder sash. Available in six colourways, made for weddings, owambe and special occasions.",
      price: "₦68,000",
      sellingPoints: "Handmade by local weavers, complete three-piece set, six colourways",
      tone: "premium",
    },
    scripts: {
      en: "Some moments deserve more than ordinary. The Handwoven Aso-Oke Wrapper Set is woven by hand on traditional looms in Iseyin, made for weddings, owambe and every special occasion. Each set comes complete with a wrapper, a gele head tie and a shoulder sash, in six rich colourways. Wear the craft of local weavers, and wear it with pride. Sixty-eight thousand naira. Make your entrance unforgettable. Order yours today.",
      fr: "Certains moments méritent plus que l'ordinaire. L'ensemble pagne Aso-Oke tissé à la main est confectionné sur des métiers traditionnels à Iseyin, pour les mariages, les fêtes et toutes les grandes occasions. Chaque ensemble comprend un pagne, un foulard gele et une écharpe d'épaule, en six coloris somptueux. Portez le savoir-faire des tisserands locaux avec fierté. Soixante-huit mille nairas. Faites une entrée inoubliable. Commandez le vôtre dès aujourd'hui.",
      zh: "有些时刻，值得不同寻常的装扮。这套手工编织的阿索奥克传统服饰套装，由伊塞因的织匠在传统织机上一针一线织成，专为婚礼、派对和各种重要场合而设计。每套包含裹裙、盖莱头巾和披肩，共有六种华丽配色。穿上本地匠人的手艺，自信又体面。售价六万八千奈拉。让你的每一次出场都令人难忘，现在就下单吧。",
    },
  },
  {
    id: "shea-butter",
    category: "Beauty",
    product: {
      name: "Whipped Raw Shea Butter Cream (500g)",
      description:
        "Unrefined shea butter whipped with coconut oil into a soft, fragrance-free body cream. Absorbs quickly, suitable for dry skin, and comes in a 500g resealable jar.",
      price: "₦7,500",
      sellingPoints: "Fragrance-free, unrefined shea, large 500g jar",
      tone: "calm",
    },
    scripts: {
      en: "Take a moment for your skin. Our Whipped Raw Shea Butter Cream is made from unrefined shea, gently whipped with coconut oil into a soft, light cream. It's fragrance-free, absorbs quickly, and is suitable for dry skin, so you can use it every day without a second thought. Each resealable jar holds five hundred grams, so it lasts. Just seven thousand, five hundred naira. Treat your skin kindly. Order a jar today.",
      fr: "Prenez un moment pour votre peau. Notre crème au beurre de karité brut fouetté est faite de karité non raffiné, délicatement fouetté avec de l'huile de coco pour une texture douce et légère. Sans parfum, elle pénètre rapidement et convient aux peaux sèches, pour un usage au quotidien. Chaque pot refermable contient cinq cents grammes, de quoi durer longtemps. Seulement sept mille cinq cents nairas. Prenez soin de votre peau. Commandez votre pot dès aujourd'hui.",
      zh: "忙碌了一天，给肌肤一点温柔的时间。这款搅打生乳木果霜，选用未经精炼的乳木果脂，与椰子油一起轻轻搅打，质地柔软轻盈。不含香精，吸收迅速，适合干性肌肤，每天放心使用。每罐五百克，可重复密封，经久耐用。只需七千五百奈拉。好好爱护你的肌肤，今天就带一罐回家吧。",
    },
  },
  {
    id: "air-fryer",
    category: "Home & Kitchen",
    product: {
      name: "8-Litre Digital Air Fryer",
      description:
        "An 8-litre air fryer with a touch screen, 8 preset programmes and a non-stick basket that is dishwasher safe. Cooks chips, chicken and plantain with little or no oil.",
      price: "₦98,000",
      sellingPoints: "Family-size 8L basket, 8 presets, easy to clean",
      tone: "friendly",
    },
    scripts: {
      en: "Love fried food, but not all that oil? Say hello to the eight-litre Digital Air Fryer. It's big enough for the whole family, and it cooks chips, chicken and even plantain with little or no oil. Just tap the touch screen and pick one of eight presets. When you're done, the non-stick basket goes straight into the dishwasher. Ninety-eight thousand naira. Tasty meals, less mess. Get yours today.",
      fr: "Vous aimez la friture, mais pas toute cette huile ? Découvrez la friteuse à air numérique de huit litres. Assez grande pour toute la famille, elle cuit les frites, le poulet et même les bananes plantains avec peu ou pas d'huile. Touchez l'écran, choisissez l'un des huit programmes, et c'est parti. Ensuite, le panier antiadhésif passe directement au lave-vaisselle. Quatre-vingt-dix-huit mille nairas. Des plats savoureux, sans les tracas. Commandez la vôtre dès aujourd'hui.",
      zh: "喜欢吃炸的，又不想吃那么多油？试试这款八升数字空气炸锅吧。容量够大，全家人都够吃，薯条、鸡肉，甚至大蕉，都只需要很少的油，甚至不用油。轻点触摸屏，从八种预设程序里选一个就行。用完之后，不粘锅篮可以直接放进洗碗机。只要九万八千奈拉。美味少油，清洁省心，今天就带回家吧。",
    },
  },
  {
    id: "smartphone",
    category: "Phones",
    product: {
      name: "6.7-inch Android Smartphone, 8GB RAM / 256GB",
      description:
        "A 6.7-inch Android phone with 8GB of RAM, 256GB of storage, a 50MP main camera and a 5,000mAh battery with fast charging. Comes with a 12-month warranty.",
      price: "₦289,000",
      sellingPoints: "Big battery, 256GB storage, 12-month warranty",
      tone: "energetic",
    },
    scripts: {
      en: "Need a phone that keeps up with you? This six-point-seven-inch Android smartphone packs eight gigs of RAM and two hundred and fifty-six gigs of storage, so your apps, photos and videos all have room. Snap sharp shots with the fifty-megapixel camera, and power through the day on a five-thousand milliamp-hour battery with fast charging. Plus, you get a twelve-month warranty. Two hundred and eighty-nine thousand naira. Upgrade today.",
      fr: "Besoin d'un téléphone qui suit votre rythme ? Ce smartphone Android de six virgule sept pouces offre huit gigas de mémoire vive et deux cent cinquante-six gigas de stockage, pour vos applis, vos photos et vos vidéos. Prenez des photos nettes avec l'appareil de cinquante mégapixels, et tenez toute la journée grâce à la batterie de cinq mille milliampères-heure avec charge rapide. Garantie de douze mois incluse. Deux cent quatre-vingt-neuf mille nairas. Passez à la vitesse supérieure dès aujourd'hui.",
      zh: "想要一部跟得上你节奏的手机吗？这款六点七英寸安卓智能手机，配备八GB运行内存和二百五十六GB存储空间，应用、照片、视频统统装得下。五千万像素主摄，随手一拍就清晰；五千毫安时大电池，支持快充，一整天都够用。还享受十二个月保修。售价二十八万九千奈拉。现在就升级吧！",
    },
  },
  {
    id: "rice",
    category: "Groceries",
    product: {
      name: "Stone-Free Local Parboiled Rice (25kg)",
      description:
        "Nigerian-grown parboiled rice, cleaned and destoned so it is ready to cook. Long grains that stay separate after cooking. Packed in a sealed 25kg bag.",
      price: "₦52,000",
      sellingPoints: "Stone-free, grown in Nigeria, 25kg family bag",
      tone: "friendly",
    },
    scripts: {
      en: "Tired of picking stones out of your rice? Not anymore. Our Stone-Free Local Parboiled Rice is grown right here in Nigeria, then cleaned and destoned, so it's ready to cook straight from the bag. The long grains stay separate and fluffy, perfect for jollof, fried rice or a simple Sunday pot. It comes in a sealed twenty-five kilo family bag. Fifty-two thousand naira. Good rice, no stress. Order your bag today.",
      fr: "Marre de trier les cailloux dans votre riz ? C'est fini. Notre riz étuvé local sans cailloux est cultivé ici, au Nigeria, puis nettoyé et débarrassé de ses pierres, prêt à cuire dès la sortie du sac. Ses grains longs restent bien séparés, parfaits pour un jollof, un riz frit ou le repas du dimanche. Il est vendu en sac familial scellé de vingt-cinq kilos. Cinquante-deux mille nairas. Du bon riz, sans stress. Commandez votre sac dès aujourd'hui.",
      zh: "还在为米里挑石子发愁吗？现在不用了。这款无石子本地蒸谷米产自尼日利亚，经过清洗和去石处理，开袋就能直接下锅。米粒细长，煮好后粒粒分明，做乔洛夫饭、炒饭或者周末家常饭都很合适。采用二十五公斤家庭装密封袋。售价五万二千奈拉。好米不操心，今天就订一袋吧。",
    },
  },
];
