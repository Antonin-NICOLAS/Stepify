const mongoose = require('mongoose');
const Reward = require('./Reward');
//.env
require('dotenv').config()

mongoose.connect(/*MONGODB*/ process.env.MONGO_VERCEL_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("mongoDB connected")
});

const rewards = [
    // Bronze Tier
    {
        name: {
            fr: 'Marcheur en herbe',
            en: 'Beginner Walker',
            es: 'Caminante principiante',
            de: 'Anfänger-Wanderer'
        },
        description: {
            fr: 'Fais 5 000 pas en un jour.',
            en: 'Take 5,000 steps in one day.',
            es: 'Da 5.000 pasos en un día.',
            de: 'Mache 5.000 Schritte an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821762/steps-bronze_ceh8zt.png',
        criteria: 'steps',
        tier: 'bronze',
        target: 5000,
    },
    {
        name: {
            fr: 'Marcheur régulier',
            en: 'Regular Walker',
            es: 'Caminante regular',
            de: 'Regelmäßiger Wanderer'
        },
        description: {
            fr: 'Fais 5000 pas pendant 7 jours consécutifs.',
            en: 'Take 5,000 steps for 7 consecutive days.',
            es: 'Da 5.000 pasos durante 7 días consecutivos.',
            de: 'Mache 5.000 Schritte an 7 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821782/steps-time-bronze_oawfnf.png',
        criteria: 'steps-time',
        tier: 'bronze',
        time: 7,
        target: 5000,
    },
    {
        name: {
            fr: 'Explorateur débutant',
            en: 'Beginner Explorer',
            es: 'Explorador principiante',
            de: 'Anfänger-Entdecker'
        },
        description: {
            fr: 'Parcours 3 km en un jour.',
            en: 'Walk 3 km in one day.',
            es: 'Camina 3 km en un día.',
            de: 'Gehe 3 km an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821174/distance-bronze_gii8mk.png',
        criteria: 'distance',
        tier: 'bronze',
        target: 3,
    },
    {
        name: {
            fr: 'Randonneur débutant',
            en: 'Beginner Hiker',
            es: 'Excursionista principiante',
            de: 'Anfänger-Wanderer'
        },
        description: {
            fr: 'Parcours 3 km par jour pendant 7 jours consécutifs.',
            en: 'Walk 3 km per day for 7 consecutive days.',
            es: 'Camina 3 km por día durante 7 días consecutivos.',
            de: 'Gehe 3 km pro Tag an 7 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821173/distance-time-bronze_srrve1.png',
        criteria: 'distance-time',
        tier: 'bronze',
        time: 7,
        target: 3,
    },
    {
        name: {
            fr: 'Brûleur de calories novice',
            en: 'Novice Calorie Burner',
            es: 'Quemador de calorías novato',
            de: 'Anfänger-Kalorienverbrenner'
        },
        description: {
            fr: 'Brûle 200 calories en une journée.',
            en: 'Burn 200 calories in one day.',
            es: 'Quema 200 calorías en un día.',
            de: 'Verbrenne 200 Kalorien an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747820851/calories-bronze_sgi7yy.png',
        criteria: 'calories',
        tier: 'bronze',
        target: 200,
    },
    {
        name: {
            fr: 'Brûleur régulier',
            en: 'Regular Burner',
            es: 'Quemador regular',
            de: 'Regelmäßiger Verbrenner'
        },
        description: {
            fr: 'Brûle 200 calories par jour pendant 7 jours consécutifs.',
            en: 'Burn 200 calories per day for 7 consecutive days.',
            es: 'Quema 200 calorías por día durante 7 días consecutivos.',
            de: 'Verbrenne 200 Kalorien pro Tag an 7 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747820877/calories-time-bronze_sfcqra.png',
        criteria: 'calories-time',
        tier: 'bronze',
        time: 7,
        target: 200,
    },
    {
        name: {
            fr: 'Série de 3 jours',
            en: '3-Day Streak',
            es: 'Racha de 3 días',
            de: '3-Tage-Serie'
        },
        description: {
            fr: 'Atteins ton objectif quotidien pendant 3 jours consécutifs.',
            en: 'Reach your daily goal for 3 consecutive days.',
            es: 'Alcanza tu objetivo diario durante 3 días consecutivos.',
            de: 'Erreiche dein Tagesziel an 3 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821961/streak-bronze_ixmj61.png',
        criteria: 'streak',
        tier: 'bronze',
        target: 3,
    },

    // Silver Tier
    {
        name: {
            fr: 'Marcheur expérimenté',
            en: 'Experienced Walker',
            es: 'Caminante experimentado',
            de: 'Erfahrener Wanderer'
        },
        description: {
            fr: 'Fais 10 000 pas en un jour.',
            en: 'Take 10,000 steps in one day.',
            es: 'Da 10.000 pasos en un día.',
            de: 'Mache 10.000 Schritte an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821848/steps-silver_d6jlmu.png',
        criteria: 'steps',
        tier: 'silver',
        target: 10000,
    },
    {
        name: {
            fr: 'Marathonien hebdomadaire',
            en: 'Weekly Marathoner',
            es: 'Maratonista semanal',
            de: 'Wöchentlicher Marathonläufer'
        },
        description: {
            fr: 'Fais 10 000 pas pendant 14 jours consécutifs.',
            en: 'Take 10,000 steps for 14 consecutive days.',
            es: 'Da 10.000 pasos durante 14 días consecutivos.',
            de: 'Mache 10.000 Schritte an 14 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821918/steps-time-silver_fr80f4.png',
        criteria: 'steps-time',
        tier: 'silver',
        time: 14,
        target: 10000,
    },
    {
        name: {
            fr: 'Explorateur intermédiaire',
            en: 'Intermediate Explorer',
            es: 'Explorador intermedio',
            de: 'Fortgeschrittener Entdecker'
        },
        description: {
            fr: 'Parcours 5 km en un jour.',
            en: 'Walk 5 km in one day.',
            es: 'Camina 5 km en un día.',
            de: 'Gehe 5 km an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821274/distance-silver_n4jmvy.png',
        criteria: 'distance',
        tier: 'silver',
        target: 5,
    },
    {
        name: {
            fr: 'Randonneur régulier',
            en: 'Regular Hiker',
            es: 'Excursionista regular',
            de: 'Regelmäßiger Wanderer'
        },
        description: {
            fr: 'Parcours 5 km par jour pendant 14 jours consécutifs.',
            en: 'Walk 5 km per day for 14 consecutive days.',
            es: 'Camina 5 km por día durante 14 días consecutivos.',
            de: 'Gehe 5 km pro Tag an 14 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821274/distance-time-silver_wcgy10.png',
        criteria: 'distance-time',
        tier: 'silver',
        time: 14,
        target: 5,
    },
    {
        name: {
            fr: 'Brûleur de calories intermédiaire',
            en: 'Intermediate Calorie Burner',
            es: 'Quemador de calorías intermedio',
            de: 'Fortgeschrittener Kalorienverbrenner'
        },
        description: {
            fr: 'Brûle 400 calories en une journée.',
            en: 'Burn 400 calories in one day.',
            es: 'Quema 400 calorías en un día.',
            de: 'Verbrenne 400 Kalorien an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747820986/calories-silver_kpkcn7.png',
        criteria: 'calories',
        tier: 'silver',
        target: 400,
    },
    {
        name: {
            fr: 'Brûleur constant',
            en: 'Steady Burner',
            es: 'Quemador constante',
            de: 'Stetiger Verbrenner'
        },
        description: {
            fr: 'Brûle 300 calories par jour pendant 14 jours consécutifs.',
            en: 'Burn 300 calories per day for 14 consecutive days.',
            es: 'Quema 300 calorías por día durante 14 días consecutivos.',
            de: 'Verbrenne 300 Kalorien pro Tag an 14 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821047/calories-time-silver_odubed.png',
        criteria: 'calories-time',
        tier: 'silver',
        time: 14,
        target: 300,
    },
    {
        name: {
            fr: 'Série de 7 jours',
            en: '7-Day Streak',
            es: 'Racha de 7 días',
            de: '7-Tage-Serie'
        },
        description: {
            fr: 'Atteins ton objectif quotidien pendant 7 jours consécutifs.',
            en: 'Reach your daily goal for 7 consecutive days.',
            es: 'Alcanza tu objetivo diario durante 7 días consecutivos.',
            de: 'Erreiche dein Tagesziel an 7 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747822162/streak-silver_xze8zr.png',
        criteria: 'streak',
        tier: 'silver',
        target: 7,
    },

    // Gold Tier
    {
        name: {
            fr: 'Marcheur expert',
            en: 'Expert Walker',
            es: 'Caminante experto',
            de: 'Experten-Wanderer'
        },
        description: {
            fr: 'Fais 20 000 pas en un jour.',
            en: 'Take 20,000 steps in one day.',
            es: 'Da 20.000 pasos en un día.',
            de: 'Mache 20.000 Schritte an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821782/steps-gold_u19ck1.png',
        criteria: 'steps',
        tier: 'gold',
        target: 20000,
    },
    {
        name: {
            fr: 'Marathonien mensuel',
            en: 'Monthly Marathoner',
            es: 'Maratonista mensual',
            de: 'Monatlicher Marathonläufer'
        },
        description: {
            fr: 'Fais 10 000 pas pendant 30 jours consécutifs.',
            en: 'Take 10,000 steps for 30 consecutive days.',
            es: 'Da 10.000 pasos durante 30 días consecutivos.',
            de: 'Mache 10.000 Schritte an 30 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821916/steps-time-gold_lq4bne.png',
        criteria: 'steps-time',
        tier: 'gold',
        time: 30,
        target: 10000,
    },
    {
        name: {
            fr: 'Explorateur avancé',
            en: 'Advanced Explorer',
            es: 'Explorador avanzado',
            de: 'Fortgeschrittener Entdecker'
        },
        description: {
            fr: 'Parcours 10 km en un jour.',
            en: 'Walk 10 km in one day.',
            es: 'Camina 10 km en un día.',
            de: 'Gehe 10 km an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821266/distance-gold_rdzdtm.png',
        criteria: 'distance',
        tier: 'gold',
        target: 10,
    },
    {
        name: {
            fr: 'Randonneur assidu',
            en: 'Dedicated Hiker',
            es: 'Excursionista dedicado',
            de: 'Engagierter Wanderer'
        },
        description: {
            fr: 'Parcours 7 km par jour pendant 30 jours consécutifs.',
            en: 'Walk 7 km per day for 30 consecutive days.',
            es: 'Camina 7 km por día durante 30 días consecutivos.',
            de: 'Gehe 7 km pro Tag an 30 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821268/distance-time-gold_myseao.png',
        criteria: 'distance-time',
        tier: 'gold',
        time: 30,
        target: 7,
    },
    {
        name: {
            fr: 'Brûleur de calories expert',
            en: 'Expert Calorie Burner',
            es: 'Quemador de calorías experto',
            de: 'Experten-Kalorienverbrenner'
        },
        description: {
            fr: 'Brûle 600 calories en une journée.',
            en: 'Burn 600 calories in one day.',
            es: 'Quema 600 calorías en un día.',
            de: 'Verbrenne 600 Kalorien an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747820999/calories-gold_lmmrna.png',
        criteria: 'calories',
        tier: 'gold',
        target: 600,
    },
    {
        name: {
            fr: 'Brûleur discipliné',
            en: 'Disciplined Burner',
            es: 'Quemador disciplinado',
            de: 'Disziplinierter Verbrenner'
        },
        description: {
            fr: 'Brûle 400 calories par jour pendant 30 jours consécutifs.',
            en: 'Burn 400 calories per day for 30 consecutive days.',
            es: 'Quema 400 calorías por día durante 30 días consecutivos.',
            de: 'Verbrenne 400 Kalorien pro Tag an 30 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747820988/calories-time-gold_kychru.png',
        criteria: 'calories-time',
        tier: 'gold',
        time: 30,
        target: 400,
    },
    {
        name: {
            fr: 'Série de 30 jours',
            en: '30-Day Streak',
            es: 'Racha de 30 días',
            de: '30-Tage-Serie'
        },
        description: {
            fr: 'Atteins ton objectif quotidien pendant 30 jours consécutifs.',
            en: 'Reach your daily goal for 30 consecutive days.',
            es: 'Alcanza tu objetivo diario durante 30 días consecutivos.',
            de: 'Erreiche dein Tagesziel an 30 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747822161/streak-gold_t3avou.png',
        criteria: 'streak',
        tier: 'gold',
        target: 30,
    },

    // Platinum Tier
    {
        name: {
            fr: 'Marcheur professionnel',
            en: 'Professional Walker',
            es: 'Caminante profesional',
            de: 'Professioneller Wanderer'
        },
        description: {
            fr: 'Fais 30 000 pas en un jour.',
            en: 'Take 30,000 steps in one day.',
            es: 'Da 30.000 pasos en un día.',
            de: 'Mache 30.000 Schritte an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821870/steps-platinum_poye4o.png',
        criteria: 'steps',
        tier: 'platinum',
        target: 30000,
    },
    {
        name: {
            fr: 'Marathonien trimestriel',
            en: 'Quarterly Marathoner',
            es: 'Maratonista trimestral',
            de: 'Vierteljährlicher Marathonläufer'
        },
        description: {
            fr: 'Fais 10 000 pas pendant 90 jours consécutifs.',
            en: 'Take 10,000 steps for 90 consecutive days.',
            es: 'Da 10.000 pasos durante 90 días consecutivos.',
            de: 'Mache 10.000 Schritte an 90 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821953/steps-time-platinum_xpknmz.png',
        criteria: 'steps-time',
        tier: 'platinum',
        time: 90,
        target: 10000,
    },
    {
        name: {
            fr: 'Explorateur professionnel',
            en: 'Professional Explorer',
            es: 'Explorador profesional',
            de: 'Professioneller Entdecker'
        },
        description: {
            fr: 'Parcours 21 km en un jour (un semi-marathon).',
            en: 'Walk 21 km in one day (a half-marathon).',
            es: 'Camina 21 km en un día (un medio maratón).',
            de: 'Gehe 21 km an einem Tag (ein Halbmarathon).'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821133/distance-platinum_ce0a64.png',
        criteria: 'distance',
        tier: 'platinum',
        target: 21,
    },
    {
        name: {
            fr: 'Randonneur professionnel',
            en: 'Professional Hiker',
            es: 'Excursionista profesional',
            de: 'Professioneller Wanderer'
        },
        description: {
            fr: 'Parcours 10 km par jour pendant 90 jours consécutifs.',
            en: 'Walk 10 km per day for 90 consecutive days.',
            es: 'Camina 10 km por día durante 90 días consecutivos.',
            de: 'Gehe 10 km pro Tag an 90 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821327/distance-time-platinum_ud6nd0.png',
        criteria: 'distance-time',
        tier: 'platinum',
        time: 90,
        target: 10,
    },
    {
        name: {
            fr: 'Brûleur de calories professionnel',
            en: 'Professional Calorie Burner',
            es: 'Quemador de calorías profesional',
            de: 'Professioneller Kalorienverbrenner'
        },
        description: {
            fr: 'Brûle 1000 calories en une journée.',
            en: 'Burn 1,000 calories in one day.',
            es: 'Quema 1.000 calorías en un día.',
            de: 'Verbrenne 1.000 Kalorien an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821004/calories-platinum_uvkxnn.png',
        criteria: 'calories',
        tier: 'platinum',
        target: 1000,
    },
    {
        name: {
            fr: 'Brûleur intensif',
            en: 'Intensive Burner',
            es: 'Quemador intensivo',
            de: 'Intensiver Verbrenner'
        },
        description: {
            fr: 'Brûle 500 calories par jour pendant 90 jours consécutifs.',
            en: 'Burn 500 calories per day for 90 consecutive days.',
            es: 'Quema 500 calorías por día durante 90 días consecutivos.',
            de: 'Verbrenne 500 Kalorien pro Tag an 90 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821048/calories-time-platinum_xrqcmq.png',
        criteria: 'calories-time',
        tier: 'platinum',
        time: 90,
        target: 500,
    },
    {
        name: {
            fr: 'Série de 90 jours',
            en: '90-Day Streak',
            es: 'Racha de 90 días',
            de: '90-Tage-Serie'
        },
        description: {
            fr: 'Atteins ton objectif quotidien pendant 90 jours consécutifs.',
            en: 'Reach your daily goal for 90 consecutive days.',
            es: 'Alcanza tu objetivo diario durante 90 días consecutivos.',
            de: 'Erreiche dein Tagesziel an 90 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747822191/streak-platinum_x20vd4.png',
        criteria: 'streak',
        tier: 'platinum',
        target: 90,
    },

    // Diamond Tier
    {
        name: {
            fr: 'Ultra-marcheur',
            en: 'Ultra Walker',
            es: 'Ultra caminante',
            de: 'Ultra-Wanderer'
        },
        description: {
            fr: 'Fais 50 000 pas en un jour.',
            en: 'Take 50,000 steps in one day.',
            es: 'Da 50.000 pasos en un día.',
            de: 'Mache 50.000 Schritte an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821784/steps-diamond_rl4cku.png',
        criteria: 'steps',
        tier: 'diamond',
        target: 50000,
    },
    {
        name: {
            fr: 'Marathonien annuel',
            en: 'Yearly Marathoner',
            es: 'Maratonista anual',
            de: 'Jährlicher Marathonläufer'
        },
        description: {
            fr: 'Fais 10 000 pas pendant 365 jours consécutifs.',
            en: 'Take 10,000 steps for 365 consecutive days.',
            es: 'Da 10.000 pasos durante 365 días consecutivos.',
            de: 'Mache 10.000 Schritte an 365 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821821/steps-time-diamond_grihx3.png',
        criteria: 'steps-time',
        tier: 'diamond',
        time: 365,
        target: 10000,
    },
    {
        name: {
            fr: 'Ultra-explorateur',
            en: 'Ultra Explorer',
            es: 'Ultra explorador',
            de: 'Ultra-Entdecker'
        },
        description: {
            fr: 'Parcours 42 km en un jour (un marathon).',
            en: 'Walk 42 km in one day (a marathon).',
            es: 'Camina 42 km en un día (un maratón).',
            de: 'Gehe 42 km an einem Tag (ein Marathon).'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821125/distance-diamond_mpfoln.png',
        criteria: 'distance',
        tier: 'diamond',
        target: 42,
    },
    {
        name: {
            fr: 'Ultra-randonneur',
            en: 'Ultra Hiker',
            es: 'Ultra excursionista',
            de: 'Ultra-Wanderer'
        },
        description: {
            fr: 'Parcours 15 km par jour pendant 365 jours consécutifs.',
            en: 'Walk 15 km per day for 365 consecutive days.',
            es: 'Camina 15 km por día durante 365 días consecutivos.',
            de: 'Gehe 15 km pro Tag an 365 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821283/distance-time-diamond_t74iwi.png',
        criteria: 'distance-time',
        tier: 'diamond',
        time: 365,
        target: 15,
    },

    {
        name: {
            fr: 'Ultra brûleur de calories',
            en: 'Ultra Calorie Burner',
            es: 'Ultra quemador de calorías',
            de: 'Ultra-Kalorienverbrenner'
        },
        description: {
            fr: 'Brûle 2000 calories en une journée.',
            en: 'Burn 2,000 calories in one day.',
            es: 'Quema 2.000 calorías en un día.',
            de: 'Verbrenne 2.000 Kalorien an einem Tag.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821004/calories-diamond_kdkshq.png',
        criteria: 'calories',
        tier: 'diamond',
        target: 2000,
    },
    {
        name: {
            fr: 'Ultra-brûleur',
            en: 'Ultra Burner',
            es: 'Ultra quemador',
            de: 'Ultra-Verbrenner'
        },
        description: {
            fr: 'Brûle 600 calories par jour pendant 365 jours consécutifs.',
            en: 'Burn 600 calories per day for 365 consecutive days.',
            es: 'Quema 600 calorías por día durante 365 días consecutivos.',
            de: 'Verbrenne 600 Kalorien pro Tag an 365 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747820966/calories-time-diamond_hsdgrm.png',
        criteria: 'calories-time',
        tier: 'diamond',
        time: 365,
        target: 600,
    },
    {
        name: {
            fr: 'Série légendaire',
            en: 'Legendary Streak',
            es: 'Racha legendaria',
            de: 'Legendäre Serie'
        },
        description: {
            fr: 'Atteins ton objectif quotidien pendant 365 jours consécutifs.',
            en: 'Reach your daily goal for 365 consecutive days.',
            es: 'Alcanza tu objetivo diario durante 365 días consecutivos.',
            de: 'Erreiche dein Tagesziel an 365 aufeinanderfolgenden Tagen.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747822164/streak-diamond_yedprc.png',
        criteria: 'streak',
        tier: 'diamond',
        target: 365,
    },
    // LEVELS
    {
        name: {
            fr: 'Niveau 5 atteint',
            en: 'Level 5 Reached',
            es: 'Nivel 5 alcanzado',
            de: 'Level 5 erreicht'
        },
        description: {
            fr: 'Atteins le niveau 5.',
            en: 'Reach level 5.',
            es: 'Alcanza el nivel 5.',
            de: 'Erreiche Level 5.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747830852/level-bronze_npekzx.png',
        criteria: 'level',
        tier: 'bronze',
        target: 5,
    },
    {
        name: {
            fr: 'Niveau 10 atteint',
            en: 'Level 10 Reached',
            es: 'Nivel 10 alcanzado',
            de: 'Level 10 erreicht'
        },
        description: {
            fr: 'Atteins le niveau 10.',
            en: 'Reach level 10.',
            es: 'Alcanza el nivel 10.',
            de: 'Erreiche Level 10.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747830863/level-silver_hdly7e.png',
        criteria: 'level',
        tier: 'silver',
        target: 10,
    },
    {
        name: {
            fr: 'Niveau 20 atteint',
            en: 'Level 20 Reached',
            es: 'Nivel 20 alcanzado',
            de: 'Level 20 erreicht'
        },
        description: {
            fr: 'Atteins le niveau 20.',
            en: 'Reach level 20.',
            es: 'Alcanza el nivel 20.',
            de: 'Erreiche Level 20.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747830863/level-gold_rtijjo.png',
        criteria: 'level',
        tier: 'gold',
        target: 20,
    },
    {
        name: {
            fr: 'Niveau 30 atteint',
            en: 'Level 30 Reached',
            es: 'Nivel 30 alcanzado',
            de: 'Level 30 erreicht'
        },
        description: {
            fr: 'Atteins le niveau 30.',
            en: 'Reach level 30.',
            es: 'Alcanza el nivel 30.',
            de: 'Erreiche Level 30.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747830865/level-platinum_vlg9kx.png',
        criteria: 'level',
        tier: 'platinum',
        target: 30,
    },
    {
        name: {
            fr: 'Niveau 50 atteint',
            en: 'Level 50 Reached',
            es: 'Nivel 50 alcanzado',
            de: 'Level 50 erreicht'
        },
        description: {
            fr: 'Atteins le niveau 50.',
            en: 'Reach level 50.',
            es: 'Alcanza el nivel 50.',
            de: 'Erreiche Level 50.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747830863/level-diamond_h54vqi.png',
        criteria: 'level',
        tier: 'diamond',
        target: 50,
    },
    // CUSTOM GOALS
    {
        name: {
            fr: 'Premier objectif',
            en: 'First Goal',
            es: 'Primer objetivo',
            de: 'Erstes Ziel'
        },
        description: {
            fr: 'Atteins ton premier objectif personnalisé.',
            en: 'Reach your first custom goal.',
            es: 'Alcanza tu primer objetivo personalizado.',
            de: 'Erreiche dein erstes individuelles Ziel.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821377/heart-bronze_zgne4e.png',
        criteria: 'customgoal',
        tier: 'bronze',
        target: 1,
    },
    {
        name: {
            fr: 'Objectif confirmé',
            en: 'Confirmed Goal',
            es: 'Objetivo confirmado',
            de: 'Bestätigtes Ziel'
        },
        description: {
            fr: 'Atteins 5 objectifs personnalisés.',
            en: 'Reach 5 custom goals.',
            es: 'Alcanza 5 objetivos personalizados.',
            de: 'Erreiche 5 individuelle Ziele.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821562/heart-silver_i9ewcu.png',
        criteria: 'customgoal',
        tier: 'silver',
        target: 5,
    },
    {
        name: {
            fr: 'Objectif expert',
            en: 'Expert Goal',
            es: 'Objetivo experto',
            de: 'Expertenziel'
        },
        description: {
            fr: 'Atteins 10 objectifs personnalisés.',
            en: 'Reach 10 custom goals.',
            es: 'Alcanza 10 objetivos personalizados.',
            de: 'Erreiche 10 individuelle Ziele.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821569/heart-gold_v2onua.png',
        criteria: 'customgoal',
        tier: 'gold',
        target: 10,
    },
    {
        name: {
            fr: 'Objectif maître',
            en: 'Master Goal',
            es: 'Objetivo maestro',
            de: 'Meisterziel'
        },
        description: {
            fr: 'Atteins 20 objectifs personnalisés.',
            en: 'Reach 20 custom goals.',
            es: 'Alcanza 20 objetivos personalizados.',
            de: 'Erreiche 20 individuelle Ziele.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821572/heart-platinum_sqhzkl.png',
        criteria: 'customgoal',
        tier: 'platinum',
        target: 20,
    },
    {
        name: {
            fr: 'Objectif légendaire',
            en: 'Legendary Goal',
            es: 'Objetivo legendario',
            de: 'Legendäres Ziel'
        },
        description: {
            fr: 'Atteins 50 objectifs personnalisés.',
            en: 'Reach 50 custom goals.',
            es: 'Alcanza 50 objetivos personalizados.',
            de: 'Erreiche 50 individuelle Ziele.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821585/heart-diamond_dbswnl.png',
        criteria: 'customgoal',
        tier: 'diamond',
        target: 50,
    },
    // Défis (challenges)
    {
        name: {
            fr: 'Premier défi',
            en: 'First Challenge',
            es: 'Primer desafío',
            de: 'Erste Herausforderung'
        },
        description: {
            fr: 'Complete ton premier défi.',
            en: 'Complete your first challenge.',
            es: 'Completa tu primer desafío.',
            de: 'Schließe deine erste Herausforderung ab.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747833303/challenge-bronze_nzfeyn.png',
        criteria: 'challenges',
        tier: 'bronze',
        target: 1,
    },
    {
        name: {
            fr: 'Défieur confirmé',
            en: 'Confirmed Challenger',
            es: 'Desafiador confirmado',
            de: 'Bestätigter Herausforderer'
        },
        description: {
            fr: 'Complete 5 défis.',
            en: 'Complete 5 challenges.',
            es: 'Completa 5 desafíos.',
            de: 'Schließe 5 Herausforderungen ab.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747833305/challenge-silver_bs04dx.png',
        criteria: 'challenges',
        tier: 'silver',
        target: 5,
    },
    {
        name: {
            fr: 'Expert en défis',
            en: 'Challenge Expert',
            es: 'Experto en desafíos',
            de: 'Herausforderungs-Experte'
        },
        description: {
            fr: 'Complete 10 défis.',
            en: 'Complete 10 challenges.',
            es: 'Completa 10 desafíos.',
            de: 'Schließe 10 Herausforderungen ab.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747833304/challenge-gold_nakp4k.png',
        criteria: 'challenges',
        tier: 'gold',
        target: 10,
    },
    {
        name: {
            fr: 'Maître des défis',
            en: 'Challenge Master',
            es: 'Maestro de desafíos',
            de: 'Herausforderungs-Meister'
        },
        description: {
            fr: 'Complete 20 défis.',
            en: 'Complete 20 challenges.',
            es: 'Completa 20 desafíos.',
            de: 'Schließe 20 Herausforderungen ab.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747833305/challenge-platinum_bx0dmn.png',
        criteria: 'challenges',
        tier: 'platinum',
        target: 20,
    },
    {
        name: {
            fr: 'Légende des défis',
            en: 'Challenge Legend',
            es: 'Leyenda de desafíos',
            de: 'Herausforderungs-Legende'
        },
        description: {
            fr: 'Complete 50 défis.',
            en: 'Complete 50 challenges.',
            es: 'Completa 50 desafíos.',
            de: 'Schließe 50 Herausforderungen ab.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747833305/challenge-diamond_h7cv9n.png',
        criteria: 'challenges',
        tier: 'diamond',
        target: 50,
    },

    // Défis sur temps (challenges-time)
    {
        name: {
            fr: 'Défieur hebdomadaire',
            en: 'Weekly Challenger',
            es: 'Desafiador semanal',
            de: 'Wöchentlicher Herausforderer'
        },
        description: {
            fr: 'Complete un défi par semaine pendant 4 semaines consécutives.',
            en: 'Complete one challenge per week for 4 consecutive weeks.',
            es: 'Completa un desafío por semana durante 4 semanas consecutivas.',
            de: 'Schließe eine Herausforderung pro Woche für 4 aufeinanderfolgende Wochen ab.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747833622/challenge-time-bronze_y1npal.png',
        criteria: 'challenges-time',
        tier: 'bronze',
        time: 4,
        target: 1,
    },
    {
        name: {
            fr: 'Défieur mensuel',
            en: 'Monthly Challenger',
            es: 'Desafiador mensual',
            de: 'Monatlicher Herausforderer'
        },
        description: {
            fr: 'Complete un défi par semaine pendant 12 semaines consécutives.',
            en: 'Complete one challenge per week for 12 consecutive weeks.',
            es: 'Completa un desafío por semana durante 12 semanas consecutivas.',
            de: 'Schließe eine Herausforderung pro Woche für 12 aufeinanderfolgende Wochen ab.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747833627/challenge-time-silver_xydxs6.png',
        criteria: 'challenges-time',
        tier: 'silver',
        time: 12,
        target: 1,
    },
    {
        name: {
            fr: 'Défieur trimestriel',
            en: 'Quarterly Challenger',
            es: 'Desafiador trimestral',
            de: 'Vierteljährlicher Herausforderer'
        },
        description: {
            fr: 'Complete un défi par semaine pendant 24 semaines consécutives.',
            en: 'Complete one challenge per week for 24 consecutive weeks.',
            es: 'Completa un desafío por semana durante 24 semanas consecutivas.',
            de: 'Schließe eine Herausforderung pro Woche für 24 aufeinanderfolgende Wochen ab.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747833624/challenge-time-gold_ihxq4o.png',
        criteria: 'challenges-time',
        tier: 'gold',
        time: 24,
        target: 1,
    },
    {
        name: {
            fr: 'Défieur semestriel',
            en: 'Biannual Challenger',
            es: 'Desafiador semestral',
            de: 'Halbjährlicher Herausforderer'
        },
        description: {
            fr: 'Complete un défi par semaine pendant 36 semaines consécutives.',
            en: 'Complete one challenge per week for 36 consecutive weeks.',
            es: 'Completa un desafío por semana durante 36 semanas consecutivas.',
            de: 'Schließe eine Herausforderung pro Woche für 36 aufeinanderfolgende Wochen ab.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747833626/challenge-time-platinum_lajuvm.png',
        criteria: 'challenges-time',
        tier: 'platinum',
        time: 36,
        target: 1,
    },
    {
        name: {
            fr: 'Défieur annuel',
            en: 'Yearly Challenger',
            es: 'Desafiador anual',
            de: 'Jährlicher Herausforderer'
        },
        description: {
            fr: 'Complete un défi par semaine pendant 52 semaines consécutives.',
            en: 'Complete one challenge per week for 52 consecutive weeks.',
            es: 'Completa un desafío por semana durante 52 semanas consecutivas.',
            de: 'Schließe eine Herausforderung pro Woche für 52 aufeinanderfolgende Wochen ab.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747833624/challenge-time-diamond_vsg2sk.png',
        criteria: 'challenges-time',
        tier: 'diamond',
        time: 52,
        target: 1,
    },
    // Classement (rank)
    {
        name: {
            fr: 'Top 10',
            en: 'Top 10',
            es: 'Top 10',
            de: 'Top 10'
        },
        description: {
            fr: 'Atteins le top 10 du classement.',
            en: 'Reach the top 10 of the ranking.',
            es: 'Alcanza el top 10 del ranking.',
            de: 'Erreiche die Top 10 der Rangliste.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821492/rank-bronze_agrpwh.png',
        criteria: 'rank',
        tier: 'bronze',
        target: 10,
    },
    {
        name: {
            fr: 'Top 5',
            en: 'Top 5',
            es: 'Top 5',
            de: 'Top 5'
        },
        description: {
            fr: 'Atteins le top 5 du classement.',
            en: 'Reach the top 5 of the ranking.',
            es: 'Alcanza el top 5 del ranking.',
            de: 'Erreiche die Top 5 der Rangliste.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821748/rank-silver_xjw5lk.png',
        criteria: 'rank',
        tier: 'silver',
        target: 5,
    },
    {
        name: {
            fr: 'Top 3',
            en: 'Top 3',
            es: 'Top 3',
            de: 'Top 3'
        },
        description: {
            fr: 'Atteins le top 3 du classement.',
            en: 'Reach the top 3 of the ranking.',
            es: 'Alcanza el top 3 del ranking.',
            de: 'Erreiche die Top 3 der Rangliste.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821664/rank-gold_e3klt9.png',
        criteria: 'rank',
        tier: 'gold',
        target: 3,
    },
    {
        name: {
            fr: 'Top 2',
            en: 'Top 2',
            es: 'Top 2',
            de: 'Top 2'
        },
        description: {
            fr: 'Atteins le top 2 du classement.',
            en: 'Reach the top 2 of the ranking.',
            es: 'Alcanza el top 2 del ranking.',
            de: 'Erreiche die Top 2 der Rangliste.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821761/rank-platinum_bmw66u.png',
        criteria: 'rank',
        tier: 'platinum',
        target: 2,
    },
    {
        name: {
            fr: 'Numéro 1',
            en: 'Number 1',
            es: 'Número 1',
            de: 'Nummer 1'
        },
        description: {
            fr: 'Devient numéro 1 du classement.',
            en: 'Become number 1 in the ranking.',
            es: 'Conviértete en el número 1 del ranking.',
            de: 'Werde Nummer 1 in der Rangliste.'
        },
        iconUrl: 'https://res.cloudinary.com/dpqhhckyj/image/upload/v1747821608/rank-diamond_fyljfb.png',
        criteria: 'rank',
        tier: 'diamond',
        target: 1,
    },
        //TODO: friends rewards
    {
        name: {
            fr: 'Timide',
            en: 'Shy',
            es: 'Tímido',
            de: 'Schüchtern'
        },
        description: {
            fr: 'Tu as réussi à te faire 1 ami.',
            en: 'Your first friend!',
            es: '¡Tu primer amigo!',
            de: 'Dein erster Freund!'
        },
        iconUrl: '',
        criteria: 'friend',
        tier: 'bronze',
        target: 1,
    },
    {
        name: {
            fr: 'Sociable',
            en: 'Sociable',
            es: 'Sociable',
            de: 'Sozial'
        },
        description: {
            fr: 'Tu as réussi à te faire 3 amis.',
            en: 'You have 3 friends now!',
            es: '¡Ahora tienes 3 amigos!',
            de: 'Du hast jetzt 3 Freunde!'
        },
        iconUrl: '',
        criteria: 'friend',
        tier: 'silver',
        target: 3,
    },
    {
        name: {
            fr: 'Populaire',
            en: 'Popular',
            es: 'Popular',
            de: 'Beliebt'
        },
        description: {
            fr: 'Tu as maintenant 5 amis ! Bel entourage !',
            en: 'You have 5 friends now! Great entourage!',
            es: 'Tienes 5 amigos ahora! Gran entorno!',
            de: 'Du hast jetzt 5 Freunde! Großartige Umgebung!'
        },
        iconUrl: '',
        criteria: 'friend',
        tier: 'gold',
        target: 5,
    },
    {
        name: {
            fr: 'Mondial',
            en: 'Global',
            es: 'Global',
            de: 'Global'
        },
        description: {
            fr: 'Tu as maintenant 10 amis ! De quoi être motivé tous les jours.',
            en: 'You have 10 friends now! Enough to be motivated every day.',
            es: '¡Ahora tienes 10 amigos! Suficiente para estar motivado todos los días.',
            de: 'Du hast jetzt 10 Freunde! Genug, um jeden Tag motiviert zu sein.'
        },
        iconUrl: '',
        criteria: 'friend',
        tier: 'platinum',
        target: 10,
    },
    {
        name: {
            fr: 'Star de Stepify',
            en: 'Star of Stepify',
            es: 'Star de Stepify',
            de: 'Star von Stepify'
        },
        description: {
            fr: '20 amis ! Tu es le roi du réseau !',
            en: '20 friends! You are the king of the network!',
            es: '¡20 amigos! Eres el rey de la red!',
            de: '20 Freunde! Du bist der König des Netzwerks!'
        },
        iconUrl: '',
        criteria: 'friend',
        tier: 'diamond',
        target: 20,
    },
];

async function seedRewards() {
    try {
        await Reward.deleteMany();
        await Reward.insertMany(rewards);
        console.log('Rewards successfully inserted!');
    } catch (err) {
        console.error('Error inserting rewards:', err);
    } finally {
        mongoose.connection.close();
    }
}

seedRewards();