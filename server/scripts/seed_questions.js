import '../models/associations.js';
import Question from '../models/Question.js';
import { connectDB, sequelize } from '../configs/db.js';

const questions = [
    {
        text: "A 45-year-old male presents with sudden onset of severe chest pain radiating to the back. BP is 180/110 mmHg. What is the most likely diagnosis?",
        options: ["Myocardial Infarction", "Aortic Dissection", "Pulmonary Embolism", "Pneumothorax"],
        correctOption: 1,
        explanation: {
            correct: "The sudden onset of tearing chest pain radiating to the back in a hypertensive patient is classic for Aortic Dissection.",
            whyOthersWrong: "MI usually presents with pressure-like pain not radiating to back. PE presents with pleuritic pain and dyspnea.",
            keyTakeaway: "Aortic dissection should be suspected in any patient with severe chest pain and high blood pressure.",
            clinicalRelevance: "Immediate CT angiography is required for diagnosis."
        },
        type: "case-based"
    },
    {
        text: "Which of the following is the most common cause of community-acquired pneumonia?",
        options: ["Staphylococcus aureus", "Haemophilus influenzae", "Streptococcus pneumoniae", "Mycoplasma pneumoniae"],
        correctOption: 2,
        explanation: {
            correct: "Streptococcus pneumoniae remains the most common cause of CAP globally.",
            whyOthersWrong: "S. aureus is less common and often post-viral. Mycoplasma causes atypical pneumonia.",
            keyTakeaway: "Streptococcus pneumoniae is the #1 cause of CAP.",
            clinicalRelevance: "Empiric treatment usually covers this organism."
        },
        type: "standard"
    },
    {
        text: "A 25-year-old female presents with fatigue and pale conjunctiva. Her CBC shows microcytic hypochromic anemia. Which is the most likely diagnosis?",
        options: ["Vitamin B12 deficiency", "Folate deficiency", "Iron deficiency anemia", "Aplastic anemia"],
        correctOption: 2,
        explanation: {
            correct: "Iron deficiency anemia is the most common cause of microcytic hypochromic anemia.",
            whyOthersWrong: "B12 and Folate cause macrocytic anemia. Aplastic anemia is normocytic.",
            keyTakeaway: "Microcytic hypochromic = Iron deficiency until proven otherwise.",
            clinicalRelevance: "Ferritin level is the most sensitive test."
        },
        type: "case-based"
    },
    {
        text: "What is the drug of choice for the treatment of anaphylactic shock?",
        options: ["Dopamine", "Epinephrine", "Norepinephrine", "Atropine"],
        correctOption: 1,
        explanation: {
            correct: "Epinephrine (Adrenaline) is the definitive treatment for anaphylaxis.",
            whyOthersWrong: "Dopamine is used in cardiogenic shock. Norepinephrine in septic shock.",
            keyTakeaway: "Epinephrine 0.3-0.5mg IM is the first-line treatment.",
            clinicalRelevance: "Always give IM in the lateral thigh."
        },
        type: "standard"
    },
    {
        text: "In a patient with suspected meningitis, which sign is elicited by passive flexion of the neck resulting in flexion of the hips and knees?",
        options: ["Kernig's sign", "Brudzinski's sign", "Babinski's sign", "Murphy's sign"],
        correctOption: 1,
        explanation: {
            correct: "Brudzinski's sign is flexion of the hips prompted by passive flexion of the neck.",
            whyOthersWrong: "Kernig's is pain on knee extension with hip flexed. Murphy's is for cholecystitis.",
            keyTakeaway: "Brudzinski and Kernig are traditional signs of meningeal irritation.",
            clinicalRelevance: "These signs have high specificity but low sensitivity."
        },
        type: "standard"
    },
    {
        text: "Which of the following is the primary site of absorption for Vitamin B12?",
        options: ["Stomach", "Duodenum", "Jejunum", "Terminal Ileum"],
        correctOption: 3,
        explanation: {
            correct: "Vitamin B12 is absorbed in the terminal ileum after binding to Intrinsic Factor.",
            whyOthersWrong: "Iron is absorbed in duodenum. Folate in jejunum.",
            keyTakeaway: "Terminal ileal disease (like Crohn's) leads to B12 deficiency.",
            clinicalRelevance: "B12 absorption requires R-protein and IF."
        },
        type: "standard"
    },
    {
        text: "A 60-year-old smoker presents with painless gross hematuria. What is the most likely diagnosis?",
        options: ["Urinary tract infection", "Renal stones", "Bladder cancer", "Prostatitis"],
        correctOption: 2,
        explanation: {
            correct: "Painless gross hematuria in an older smoker is bladder cancer until proven otherwise.",
            whyOthersWrong: "UTI and stones usually present with pain. Prostatitis has obstructive symptoms.",
            keyTakeaway: "Hematuria + Smoking + Older age = High risk of malignancy.",
            clinicalRelevance: "Cystoscopy is the gold standard for diagnosis."
        },
        type: "case-based"
    },
    {
        text: "What is the characteristic ECG finding in a patient with Wolff-Parkinson-White (WPW) syndrome?",
        options: ["ST elevation", "Delta wave", "U wave", "Prolonged QT interval"],
        correctOption: 1,
        explanation: {
            correct: "The delta wave reflects pre-excitation via an accessory pathway (Bundle of Kent).",
            whyOthersWrong: "ST elevation is for ischemia. U wave for hypokalemia.",
            keyTakeaway: "Short PR interval + Delta wave = WPW.",
            clinicalRelevance: "Avoid AV nodal blockers in these patients."
        },
        type: "standard"
    },
    {
        text: "Which hormone is primarily responsible for the 'fight or flight' response?",
        options: ["Insulin", "Cortisol", "Epinephrine", "Thyroxine"],
        correctOption: 2,
        explanation: {
            correct: "Epinephrine (and norepinephrine) mediate the acute stress response.",
            whyOthersWrong: "Cortisol is for chronic stress. Insulin regulates glucose.",
            keyTakeaway: "Adrenal medulla secretes catecholamines for immediate response.",
            clinicalRelevance: "Acts on alpha and beta receptors."
        },
        type: "standard"
    },
    {
        text: "A child presents with a 'barking' cough and inspiratory stridor. What is the most likely diagnosis?",
        options: ["Ashtma", "Croup (Laryngotracheobronchitis)", "Epiglottitis", "Bronchiolitis"],
        correctOption: 1,
        explanation: {
            correct: "Croup, caused by parainfluenza virus, classically presents with a 'seal-like' barking cough.",
            whyOthersWrong: "Epiglottitis is high fever and drooling. Asthma is wheezing.",
            keyTakeaway: "Steeple sign on X-ray is characteristic of Croup.",
            clinicalRelevance: "Dexamethasone is the treatment of choice."
        },
        type: "case-based"
    }
];

const seed = async () => {
    try {
        await connectDB();
        // Force sync for fresh tables if needed, or just create
        await sequelize.sync();
        await Question.bulkCreate(questions);
        console.log("SUCCESS: 10 Questions seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("SEEDING ERROR:", error.message);
        process.exit(1);
    }
};

seed();
