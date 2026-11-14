export interface ChapterItem {
  id: string;
  number: string;
  title: string;
  summary: string;
  keyPoints: string[];
  sampleTag: string;
}

export const INSIDE_TOPICS: ChapterItem[] = [
  {
    id: "principles",
    number: "01",
    title: "Natural Wellness Principles",
    summary: "Foundational concepts of holistic body balance, sleep, hydration, and nutritional harmony without sensationalism.",
    keyPoints: [
      "The role of natural balance in daily vigor",
      "Historical foundations of West African botanicals",
      "Responsible self-care vs. medical diagnosis boundaries"
    ],
    sampleTag: "Foundations"
  },
  {
    id: "ingredients",
    number: "02",
    title: "Traditional Ingredients & Common Uses",
    summary: "Clear profiles of accessible Nigerian & African herbs, roots, and spices, documenting their historical uses.",
    keyPoints: [
      "Detailed profiles: Moringa, Ginger, Cloves, Garlic, Hibiscus (Zobo)",
      "Traditional home culinary & infusion traditions",
      "What each plant genuinely supports in daily nourishment"
    ],
    sampleTag: "Botanical Profiles"
  },
  {
    id: "preparation",
    number: "03",
    title: "Simple Preparation & Storage Guidance",
    summary: "Practical hygiene, decoction temperatures, infusion timing, and safe storage methods for preserving freshness.",
    keyPoints: [
      "Decoction vs. warm infusion: proper water temperatures",
      "Safe storage: glass vs. plastic, refrigeration timelines",
      "Hygiene standards to avoid mold and bacterial contamination"
    ],
    sampleTag: "Best Practices"
  },
  {
    id: "safety",
    number: "04",
    title: "Safety Precautions & Possible Risks",
    summary: "Crucial instructions to protect your body against overuse, toxic combinations, and unverified concoctions.",
    keyPoints: [
      "Recognizing dosage limits: why 'more' is not better",
      "Avoiding toxic mixtures and unverified street brews",
      "Identifying allergic responses and body sensitivities"
    ],
    sampleTag: "Safety First"
  },
  {
    id: "medical-care",
    number: "05",
    title: "Situations Where Professional Medical Care Is Essential",
    summary: "Clear boundaries identifying when home herbs must stop and urgent clinical care must take precedence.",
    keyPoints: [
      "Red-flag symptoms requiring emergency hospital care",
      "Chronic condition warnings (hypertension, diabetes, kidney issues)",
      "Why traditional remedies can never replace laboratory diagnostics"
    ],
    sampleTag: "Clinical Boundaries"
  },
  {
    id: "questions",
    number: "06",
    title: "Questions to Ask Before Using a Natural Remedy",
    summary: "A practical 7-point personal screening checklist before boiling, brewing, or ingesting any traditional remedy.",
    keyPoints: [
      "Is the botanical source verified and unadulterated?",
      "Could this interact with any daily prescribed pills?",
      "Have I discussed this with my doctor or pharmacist?"
    ],
    sampleTag: "Checklist"
  },
  {
    id: "lifestyle",
    number: "07",
    title: "General Lifestyle & Wellness Habits",
    summary: "Sustainable daily routines including proper rest, hydration, stress moderation, and wholesome local foods.",
    keyPoints: [
      "Circadian rest and practical stress reduction in busy cities",
      "Hydration protocols with clean water and herbal infusions",
      "Incorporating fiber-rich Nigerian vegetables into everyday meals"
    ],
    sampleTag: "Daily Habits"
  },
  {
    id: "reference",
    number: "08",
    title: "Helpful Reference Checklist",
    summary: "A quick-reference lookup index and printable summary sheet for fast consultation in your kitchen.",
    keyPoints: [
      "Quick botanical temperature & ratio cheat sheet",
      "Local market sourcing verification questions",
      "Doctor appointment discussion prompt sheet"
    ],
    sampleTag: "Quick Reference"
  }
];

export const BENEFITS = [
  {
    title: "Organize Confusing Information",
    description: "Replace unverified social media forwards and hearsay with one orderly, structured educational guide."
  },
  {
    title: "Understand Common Preparation Methods",
    description: "Learn safe boiling temperatures, steeping times, and proper glass storage to protect freshness and hygiene."
  },
  {
    title: "Identify Important Safety Questions",
    description: "Equip yourself with the right caution checkpoints before introducing any traditional remedy into your home."
  },
  {
    title: "Keep Useful Notes in One Convenient PDF",
    description: "Carry a neat digital handbook directly on your Android phone, iPhone, or laptop without cumbersome papers."
  }
];

export const TARGET_AUDIENCE = [
  {
    title: "Curious Adults",
    desc: "Adults seeking genuine, balanced knowledge about traditional wellness and native botanical heritage."
  },
  {
    title: "Organized Learners",
    desc: "Individuals tired of chaotic WhatsApp broadcasts who want a neat, single-source reference manual."
  },
  {
    title: "Family Caregivers",
    desc: "Mothers, fathers, and guardians looking for safe hygiene, soothing kitchen infusions, and caution guidelines."
  },
  {
    title: "Safety-Conscious Readers",
    desc: "People who respect natural herbs but prioritize health safety, correct dosage, and medical verification."
  }
];

export const FAQS = [
  {
    question: "What format is the product?",
    answer: "Herbal Guide is delivered as a high-resolution, universal digital PDF document. It is formatted for effortless reading on smartphones, tablets, laptops, and desktop computers, and can also be printed if you prefer a physical copy."
  },
  {
    question: "How will I receive the PDF?",
    answer: "You receive immediate access! As soon as your payment of ₦3,000 is confirmed via Paystack (Debit Card, Bank Transfer, USSD, or OPay) or Selar, you get an instant download button on your screen for your verified PDF handbook."
  },
  {
    question: "Can I read it on my phone?",
    answer: "Yes, absolutely. The PDF is specifically optimized for mobile-first readers. The text is crisp and readable on Android and iPhone devices without needing to constantly zoom in."
  },
  {
    question: "Can I share or resell the PDF?",
    answer: "No. Your purchase grants a personal, non-transferable license for you and your immediate household. Reselling, unauthorized re-distribution, or public file sharing is strictly prohibited under Nigerian copyright law."
  },
  {
    question: "Do you offer refunds?",
    answer: "Because Herbal Guide is an instantly delivered digital document that cannot be returned once downloaded, purchases are generally final. However, if you experience any technical download defect or file corruption, our support line will promptly replace the file or assist you."
  },
  {
    question: "How can I contact support?",
    answer: "Customer support is directly available via email at aladesunloyeemmanuel@gmail.com. Our team responds promptly to assist you with order confirmation, download links, or questions."
  }
];

export const AUTHOR_INFO = {
  name: "Prince Emmanuel",
  title: "Natural Wellness Researcher & Educator",
  email: "aladesunloyeemmanuel@gmail.com",
  bio: "Prince Emmanuel is a Nigerian natural wellness educator and botanical researcher dedicated to documenting traditional West African home practices. Over the past 8 years, he has focused on cataloging indigenous botanical remedies, promoting safety protocols, and helping individuals make conscious, well-informed wellness decisions.",
  reason: "I created Herbal Guide because too many families in our communities are misled by chaotic internet claims, dangerous unmetered concoctions, and extreme commercial promises. Our ancestral botanical heritage is rich and has been used over time effectively for wellness, but it must be practiced with clarity, hygiene, and strict respect for modern medical boundaries."
};

export interface AilmentRemedy {
  id: number;
  name: string;
  tag: string;
  herbs: string;
  method: string;
  note: string;
  details: string;
}

export const AILMENTS_REMEDIES_LIST: AilmentRemedy[] = [
  {
    id: 1,
    name: "Infection",
    tag: "Systemic Care",
    herbs: "Garlic, Clove, Neem (Dongoyaro), Ginger & Turmeric",
    method: "Antimicrobial Hot Decoction & Steeped Tincture",
    note: "Traditional broad-spectrum cleansing formulation targeting persistent bacterial, fungal, and systemic yeast imbalances.",
    details: "Contains exact boiled clove-garlic liquid proportions, timing of morning intake on an empty stomach, and duration limits to protect healthy gut flora."
  },
  {
    id: 2,
    name: "Barrenness",
    tag: "Reproductive & Womb",
    herbs: "Gongronema (Utazi), Scent Leaf, Guava Leaves & African Walnut",
    method: "Womb Cleansing & Ovulation Decoction",
    note: "Ancient West African womb-strengthening blend designed to cleanse the fallopian tract, nourish the uterine lining, and support ovulation.",
    details: "Explains cycle-matched herbal administration (days 1 to 14 of the menstrual cycle), brewing temperature, and warm morning cup schedules."
  },
  {
    id: 3,
    name: "Diabetes",
    tag: "Metabolic Support",
    herbs: "Bitter Leaf (Vernonia Amygdalina), Moringa Leaves & Guava Leaf",
    method: "Cold Squeeze Extraction & Gentle Simmer",
    note: "Natural pancreatic-supportive bitter compounds shown to slow glucose absorption, ease insulin resistance, and support healthy sugar levels.",
    details: "Details how to properly extract raw bitter leaf juice without over-diluting active polyphenols, plus guidelines on testing blood sugar while using herbs."
  },
  {
    id: 4,
    name: "Eye Disease",
    tag: "Sensory Health",
    herbs: "Moringa Oleifera, Beta-Carotene Wild Greens & Eyebright Infusions",
    method: "Oral Nutrient Broths & External Steam Cleansing",
    note: "Traditional ocular micro-circulation support delivering dense bioflavonoids, antioxidants, and soothing compresses to relieve strain and dry eyes.",
    details: "Highlights strict hygiene protocols: zero non-sterile liquids into the eyes, using only filtered oral infusions and herbal steam baths."
  },
  {
    id: 5,
    name: "H,P,V / Herpes",
    tag: "Immune Defense",
    herbs: "Neem Bark, Licorice Root, Lemon Grass & Clove Essential Wash",
    method: "Antiviral Systemic Tonic & Soothing Topical Rinse",
    note: "Dual-action protocol combining internal immune-boosting bitter teas with cooling external herbal sitz washes to suppress viral breakouts.",
    details: "Step-by-step instructions for preparing the cooling sitz bath to alleviate burning, plus immune-strengthening dietary protocols."
  },
  {
    id: 6,
    name: "H,I,V",
    tag: "Immune Strength",
    herbs: "Moringa Pods, Phyllanthus (Chanca Piedra), Ginger & Baobab Fruit",
    method: "Nutritional Vitality Tea & Appetite Stimulant Soup",
    note: "Traditional immune-fortifying and stamina-restoring botanical broths designed to stimulate appetite, nourish white blood cells, and combat chronic fatigue.",
    details: "Emphasizes strict safety: formulated strictly as supportive wellness nutrition alongside medical care, avoiding liver-stressing decoctions."
  },
  {
    id: 7,
    name: "Fertility Cleanser for Men & Women",
    tag: "Reproductive & Womb",
    herbs: "Alligator Pepper, Tetrapleura (Prekese), Aidan Fruit & Cloves",
    method: "Spiced Pelvic Warm Infusion",
    note: "Full-body reproductive detox that purges pelvic stagnation, clears residual menstrual clots, restores hormonal rhythm, and boosts fertility readiness.",
    details: "Complete boiling ratio for Aidan fruit, optimal steeping duration, and a 21-day couple detox calendar."
  },
  {
    id: 8,
    name: "Fibroid",
    tag: "Reproductive & Womb",
    herbs: "Turmeric Root, Ginger, Guava Leaf & Castor Oil External Compresses",
    method: "Estrogen-Balancing Brew & Pelvic Warm Compress",
    note: "Botanical anti-inflammatory routine aimed at metabolizing excess estrogen, reducing pelvic fullness, and curbing heavy menstrual bleeding.",
    details: "Covers dietary triggers that accelerate fibroid growth, anti-inflammatory root extracts, and soothing warm castor oil compress instructions."
  },
  {
    id: 9,
    name: "Halitosis (Mouth Odour)",
    tag: "Oral Wellness",
    herbs: "Clove Buds (Kanafuru), Fresh Mint, Guava Leaves & Saltwater Gargle",
    method: "Antiseptic Oral Rinse & Digestive Bitter Drink",
    note: "Targeted two-step therapy eliminating oral sulfur bacteria with natural eugenol clove gargles while calming stomach acid imbalances.",
    details: "Daily 3-minute clove gargle formula, tongue brushing technique with botanical astringents, and digestive enzymes for lasting fresh breath."
  },
  {
    id: 10,
    name: "High Blood Pressure",
    tag: "Cardiovascular",
    herbs: "Hibiscus Sabdariffa (Zobo Calyx), Fresh Garlic, Ginger & Beetroot",
    method: "Unsweetened Calyx Infusion & Macerated Garlic Water",
    note: "Natural ACE-inhibiting and diuretic herbs that promote vascular elasticity, relax arterial tension, and support balanced systolic readings.",
    details: "Explains how to brew medicinal Zobo WITHOUT sugar or artificial flavors, garlic maceration ratios, and how to safely track your BP readings."
  },
  {
    id: 11,
    name: "Hormonal Imbalance",
    tag: "Reproductive & Womb",
    herbs: "Fenugreek, Cinnamon Bark, Scent Leaf & Bitter Kola",
    method: "Endocrine Regulating Tea",
    note: "Balances the estrogen-to-progesterone ratio to eliminate irregular periods, severe PMS, acne, mood swings, and unexpected weight fluctuations.",
    details: "Weekly hormone alignment timetable, water temperature limits for delicate leaves, and lifestyle habits that stabilize adrenal balance."
  },
  {
    id: 12,
    name: "Asthma",
    tag: "Respiratory",
    herbs: "Ginger Root, Garlic, Pure Wild Honey & Eucalyptus Steam",
    method: "Bronchial Soothing Syrup & Medicinal Steam Inhalation",
    note: "Traditional antispasmodic and expectorant blend that loosens stubborn bronchial mucus, expands airway passages, and soothes wheezing.",
    details: "Formulation for homemade ginger-honey bronchial syrup, night-time chest rubs, and identifying home environmental allergens."
  },
  {
    id: 13,
    name: "Insomnia",
    tag: "Daily Relief & Nervous",
    herbs: "Chamomile, Lemon Grass, Passionflower & Nutmeg Warm Milk/Tea",
    method: "Sedative Evening Infusion",
    note: "Natural nervous-system relaxant that quiets mental anxiety, eases muscular tightness, and promotes deep REM sleep without grogginess.",
    details: "30-minute bedtime botanical routine, ideal room temperature, and avoiding stimulating afternoon herbs."
  },
  {
    id: 14,
    name: "Kidney Disease",
    tag: "Metabolic Support",
    herbs: "Corn Silk, Dandelion Root, Stinging Nettle & Waterleaf",
    method: "Gentle Renal Diuretic Broth",
    note: "Nourishing, low-potassium botanical tonics that flush excess uric acid, reduce water retention, and gently support renal filtering.",
    details: "Crucial kidney safety boundaries: herbs that must NEVER be taken when creatinine is elevated, and exact fluid measurement guidelines."
  },
  {
    id: 15,
    name: "Migraine(s)",
    tag: "Daily Relief & Nervous",
    herbs: "Fresh Ginger Root, Peppermint Essential Oil & Feverfew",
    method: "Cranial Tension Relief Tea & Temple Compress",
    note: "Natural prostaglandin-inhibiting roots that calm cranial blood vessel spasm, relieve throbbing temple pain, and alleviate nausea.",
    details: "Immediate-response ginger tea recipe at first sign of an aura, temple massage techniques, and hydration triggers."
  },
  {
    id: 16,
    name: "Miscarriage",
    tag: "Reproductive & Womb",
    herbs: "Red Raspberry Leaf, Velvet Tamarind, African Nutmeg & Bone Broth",
    method: "Uterine Restorative Decoction & Nutrient Tonic",
    note: "Pre-conception uterine wall fortification and post-loss herbal nourishment to heal tissues, restore blood iron, and build physical resilience.",
    details: "Healing schedule after pregnancy loss, foods that strengthen uterine tone, and emotional restoration practices."
  },
  {
    id: 17,
    name: "Pain Relief",
    tag: "Daily Relief & Pain",
    herbs: "Turmeric (Curcumin), Black Pepper, Willow Bark & Ginger",
    method: "Golden Anti-Inflammatory Milk / Decoction",
    note: "Natural COX-2 inhibiting herbal remedy providing powerful relief for arthritis, joint inflammation, backache, and chronic muscular tension.",
    details: "The vital role of black pepper piperine to increase turmeric absorption by 2,000%, and how to prepare warm external joint poultices."
  },
  {
    id: 18,
    name: "Pile (Hemorrhoids)",
    tag: "Daily Relief & Digestive",
    herbs: "Scent Leaf (Efirin), Bitter Leaf, Tetrapleura (Prekese) & Aloe Vera",
    method: "Astringent Leaf Extract & Warm Herbal Sitz Soak",
    note: "Fast-acting double therapy that shrinks swollen anal veins, eliminates painful bowel movements, curbs rectal bleeding, and relieves itching.",
    details: "Daily 15-minute warm herbal sitz bath instructions, high-fiber indigenous food list, and avoiding chronic straining."
  },
  {
    id: 19,
    name: "Prostate Enlargement",
    tag: "Men's Health",
    herbs: "Saw Palmetto, Pumpkin Seeds, Stinging Nettle Root & Zinc Greens",
    method: "Glandular Decongestant Tea & Raw Seed Protocol",
    note: "Targeted botanical blend designed to inhibit 5-alpha reductase, reduce nighttime frequent urination, and improve bladder emptying.",
    details: "Daily therapeutic pumpkin seed intake, water cutoff rules at night, and prostate-protecting antioxidant foods."
  },
  {
    id: 20,
    name: "Semen / Sperm Booster",
    tag: "Men's Health",
    herbs: "Mondia Whitei, Velvet Bean (Mucuna Pruriens), Fenugreek & Tiger Nut",
    method: "Spermatogenic Botanical Drink & Vitality Milk",
    note: "Traditional testosterone and spermatogenic booster proven over centuries to improve sperm count, volume, motility, and reproductive stamina.",
    details: "The 60-day sperm regeneration cycle, exact herb-to-liquid measurements, and testicular cooling practices."
  },
  {
    id: 21,
    name: "Severe Cough",
    tag: "Respiratory",
    herbs: "Bitter Kola (Orogbo), Raw Honey, Ginger & Lemon Juice",
    method: "Traditional Soothing Linctus",
    note: "Potent traditional throat coat and antimicrobial expectorant that quells dry persistent coughing, clears phlegm, and eases chest tightness.",
    details: "Step-by-step extraction of Bitter Kola and pure honey syrup, safe spoons-per-day limits, and steam clearing methods."
  },
  {
    id: 22,
    name: "Stroke",
    tag: "Cardiovascular",
    herbs: "Ginkgo Biloba, Moringa, Garlic, Cayenne Pepper & Lemon Infusion",
    method: "Circulatory Revitalization Infusion",
    note: "Supportive recovery protocol aimed at breaking down arterial plaques, stimulating peripheral nerve circulation, and restoring limb mobility.",
    details: "Safe rehabilitation exercises, foods that thin sluggish blood naturally, and strict warnings on coordinating with medical blood thinners."
  },
  {
    id: 23,
    name: "Toothache",
    tag: "Daily Relief & Pain",
    herbs: "Whole Clove Buds, Clove Oil, Guava Leaf & Sea Salt",
    method: "Rapid Eugenol Numbing Rinse & Direct Bud Compress",
    note: "Instant localized dental anesthetic and antibacterial rinse that numbs throbbing nerve pain, reduces gum swelling, and prevents infection.",
    details: "How to crush and position clove buds directly on the affected molar for immediate relief, and safe gum-strengthening mouthwash."
  },
  {
    id: 24,
    name: "Tuberculosis",
    tag: "Respiratory",
    herbs: "Garlic (Allicin), Neem Leaf, Ginger & Nutrient-Dense Soups",
    method: "High-Allicin Pulmonary Soup & Steam Routine",
    note: "Immune-boosting lung fortifier high in natural allicin designed to support pulmonary recovery, alleviate night sweats, and rebuild body weight.",
    details: "Must be used as supportive nutritional therapy alongside prescribed medical treatments, with strict hygiene and recovery food plans."
  },
  {
    id: 25,
    name: "Typhoid & Malaria",
    tag: "Infections & Immunity",
    herbs: "Dongoyaro (Neem) Leaves & Bark, Lemon Grass, Pawpaw Leaf & Lime",
    method: "Traditional Agbo Iba Febrile Decoction & Steam Bath",
    note: "The revered West African anti-fever formulation that breaks stubborn fevers, flushes malaria parasites, restores bitter taste, and recharges energy.",
    details: "Exact boiling timetable so leaves do not turn excessively bitter or harsh, body steam bath protocol, and gut recovery fluids."
  },
  {
    id: 26,
    name: "Urinary Tract Infection (UTI)",
    tag: "Infections & Immunity",
    herbs: "Corn Silk, Guava Leaves, Cranberry/Hibiscus & Garlic Cloves",
    method: "Bladder Cleansing Infusion",
    note: "Gentle urinary flush that clears burning sensations during urination, cleanses the urethral tract, and stops bacteria adhering to the bladder wall.",
    details: "High-volume hydration schedule, timing of the infusions across 7 days, and avoiding high-sugar beverages that feed bacteria."
  },
  {
    id: 27,
    name: "Weak Erection",
    tag: "Men's Health",
    herbs: "Mondia Whitei (Isirigun), Bitter Kola, Cloves, Ginger & Tiger Nut",
    method: "Nitric Oxide Root Maceration & Vitality Tonic",
    note: "Natural blood vessel dilator and male virility tonic that increases pelvic blood flow, elevates natural testosterone, and restores erection firmness.",
    details: "Recipe for overnight root maceration, daily dosage cup size, and cardiovascular foods that support healthy arterial flow."
  },
  {
    id: 28,
    name: "Weight Loss",
    tag: "Metabolic Support",
    herbs: "Green Tea, Ginger, Lemon, Cinnamon Bark & Apple Cider Vinegar / Lime",
    method: "Thermogenic Morning Metabolism Elixir",
    note: "Natural metabolic booster that activates thermogenesis, curbs artificial food cravings, flushes water weight, and trims abdominal fat.",
    details: "Morning empty-stomach routine, optimal water-to-lemon ratio to safeguard tooth enamel, and balanced West African portion control."
  },
  {
    id: 29,
    name: "Ulcer",
    tag: "Digestive & Gastro",
    herbs: "Unripe Plantain, Cabbage Water, Licorice Root & Pure Aloe Vera Gel",
    method: "Mucosal Healing Cold Soak & Mild Infusion",
    note: "Gentle gastrointestinal healing protocol that neutralizes stomach acid, forms a protective shield over irritated mucosa, and repairs ulcer wounds.",
    details: "The renowned unripe plantain flour/water soak technique, timing before meals to prevent acid burning, and the list of acidic foods to strictly avoid."
  }
];

