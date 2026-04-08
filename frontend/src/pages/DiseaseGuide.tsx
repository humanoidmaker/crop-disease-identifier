import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Pill, Shield, Leaf } from 'lucide-react';

const DISEASES = [
  {
    name: 'Bacterial Blight',
    description: 'A bacterial disease that causes water-soaked lesions on leaves, which later turn brown and dry. Commonly affects rice, cotton, and beans. Spread through contaminated seeds, water splash, and wind-driven rain.',
    symptoms: ['Water-soaked leaf spots', 'Yellow halos around lesions', 'Leaf wilting and drying', 'Oozing bacterial exudate in humid conditions'],
    treatment: 'Apply copper-based bactericides (copper hydroxide or copper sulfate). Remove and destroy infected plant parts. Avoid overhead irrigation to reduce moisture on leaves.',
    prevention: ['Use disease-free certified seeds', 'Practice crop rotation with non-host crops for 2-3 years', 'Avoid working with plants when they are wet', 'Ensure proper drainage in the field', 'Apply copper sprays preventively during humid conditions'],
    affected_crops: 'Rice, Cotton, Beans, Tomato, Pepper',
  },
  {
    name: 'Leaf Rust',
    description: 'A fungal disease caused by Puccinia species. Characterized by orange-brown pustules on leaf surfaces. Can cause significant yield losses in cereal crops if left untreated.',
    symptoms: ['Orange-brown pustules on leaf surface', 'Yellow spots on upper leaf surface', 'Premature leaf drop', 'Reduced grain filling'],
    treatment: 'Apply fungicides such as propiconazole, tebuconazole, or azoxystrobin. Remove heavily infected leaves. Ensure adequate plant nutrition with potassium and phosphorus.',
    prevention: ['Plant rust-resistant varieties when available', 'Remove volunteer plants and crop debris after harvest', 'Apply preventive fungicide at first signs of infection', 'Monitor weather conditions favorable for rust development', 'Maintain balanced nutrition'],
    affected_crops: 'Wheat, Barley, Corn, Soybean, Coffee',
  },
  {
    name: 'Powdery Mildew',
    description: 'A widespread fungal disease causing white powdery coating on leaf surfaces. Thrives in warm, dry conditions with high humidity. Reduces photosynthesis and weakens plants.',
    symptoms: ['White powdery patches on leaves', 'Yellowing of affected leaves', 'Leaf curling and distortion', 'Stunted growth'],
    treatment: 'Apply sulfur-based fungicides or potassium bicarbonate. Neem oil can be effective for organic management. Remove heavily infected leaves and destroy them.',
    prevention: ['Ensure proper air circulation with adequate plant spacing', 'Avoid excessive nitrogen fertilization', 'Water at the base of plants, not overhead', 'Plant resistant varieties when available'],
    affected_crops: 'Wheat, Grapes, Cucurbits, Peas, Roses',
  },
  {
    name: 'Leaf Spot',
    description: 'A common fungal disease causing circular to irregular spots on leaves. Various fungi can cause leaf spots, including Cercospora, Septoria, and Alternaria species.',
    symptoms: ['Circular brown/dark spots on leaves', 'Concentric rings within spots', 'Yellow halos around spots', 'Premature leaf drop'],
    treatment: 'Apply broad-spectrum fungicides (chlorothalonil, mancozeb). Remove infected leaves promptly. Ensure good air circulation around plants.',
    prevention: ['Practice crop rotation to break disease cycle', 'Remove plant debris after harvest', 'Avoid overhead watering', 'Space plants properly for airflow', 'Apply mulch to prevent soil splash onto leaves'],
    affected_crops: 'Tomato, Pepper, Strawberry, Apple, Banana',
  },
  {
    name: 'Mosaic Virus',
    description: 'A viral disease causing mottled light and dark green patterns on leaves. Transmitted by insect vectors (aphids, whiteflies) and through mechanical contact. No chemical cure exists.',
    symptoms: ['Mottled green/yellow leaf pattern', 'Leaf puckering and distortion', 'Stunted plant growth', 'Reduced fruit quality and yield'],
    treatment: 'No chemical cure exists for viral diseases. Remove and destroy infected plants immediately. Control insect vectors (aphids, whiteflies) with insecticides or neem oil.',
    prevention: ['Use virus-free certified seeds and transplants', 'Control aphids and whiteflies which spread the virus', 'Remove and destroy infected plants immediately', 'Sanitize tools between plants', 'Plant virus-resistant varieties', 'Use reflective mulch to repel aphids'],
    affected_crops: 'Tobacco, Tomato, Cucumber, Pepper, Beans',
  },
  {
    name: 'Early Blight',
    description: 'A fungal disease caused by Alternaria solani. Creates concentric ring patterns (target spots) on leaves. Commonly affects solanaceous crops, especially in warm, humid conditions.',
    symptoms: ['Concentric ring "target" spots on lower leaves', 'Yellowing around spots', 'Progressive leaf death from bottom up', 'Dark lesions on stems'],
    treatment: 'Apply fungicides containing chlorothalonil, mancozeb, or copper. Remove lower infected leaves. Stake plants to improve air circulation.',
    prevention: ['Practice 3-year crop rotation', 'Mulch around plants to prevent soil splash', 'Water at the base of plants in the morning', 'Remove plant debris at end of season'],
    affected_crops: 'Tomato, Potato, Eggplant, Pepper',
  },
  {
    name: 'Late Blight',
    description: 'A devastating oomycete disease caused by Phytophthora infestans. Famous for causing the Irish Potato Famine. Spreads rapidly in cool, wet conditions and can destroy entire fields.',
    symptoms: ['Large, water-soaked lesions on leaves', 'White fuzzy growth on leaf undersides', 'Brown/black stem lesions', 'Rapid plant collapse in wet conditions'],
    treatment: 'Apply systemic fungicides (metalaxyl, dimethomorph) immediately. Remove and destroy severely infected plants. Harvest any remaining healthy produce quickly.',
    prevention: ['Plant certified disease-free seed potatoes/transplants', 'Avoid overhead irrigation', 'Ensure good air circulation', 'Scout fields regularly during cool, wet weather', 'Destroy volunteer plants and cull piles'],
    affected_crops: 'Potato, Tomato',
  },
  {
    name: 'Anthracnose',
    description: 'A fungal disease caused by Colletotrichum species. Creates sunken, dark lesions on fruits, leaves, and stems. Thrives in warm, humid conditions with frequent rainfall.',
    symptoms: ['Sunken, dark lesions on fruits/leaves', 'Salmon-pink spore masses in lesions', 'Leaf tip dieback', 'Fruit rot and premature drop'],
    treatment: 'Apply fungicides containing azoxystrobin, chlorothalonil, or copper. Prune and remove infected plant parts. Avoid overhead watering.',
    prevention: ['Use disease-free seeds and resistant varieties', 'Practice crop rotation', 'Remove and destroy crop residues', 'Avoid working with wet plants', 'Apply protective fungicide during warm, humid weather'],
    affected_crops: 'Mango, Banana, Beans, Pepper, Strawberry, Grapes',
  },
  {
    name: 'Downy Mildew',
    description: 'An oomycete disease causing yellowish patches on upper leaf surfaces with a grayish-purple fuzzy growth on undersides. Thrives in cool, moist conditions.',
    symptoms: ['Yellow-green patches on upper leaf surface', 'Gray-purple fuzzy growth on leaf undersides', 'Leaf curling and browning', 'Stunted growth'],
    treatment: 'Apply fungicides such as metalaxyl, fosetyl-Al, or copper-based products. Remove infected leaves. Improve air circulation around plants.',
    prevention: ['Plant resistant varieties', 'Ensure proper plant spacing', 'Water at the base of plants in the morning', 'Remove crop debris after harvest', 'Use drip irrigation instead of overhead sprinklers'],
    affected_crops: 'Grapes, Cucurbits, Lettuce, Onion, Spinach',
  },
];

export default function DiseaseGuide() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-7 h-7 text-primary-700" />
        <h1 className="text-2xl font-bold text-slate-800">Disease Guide</h1>
      </div>
      <p className="text-slate-600">Reference guide for all detectable crop diseases with symptoms, treatments, and prevention tips.</p>

      <div className="space-y-3">
        {DISEASES.map((disease) => (
          <div key={disease.name} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === disease.name ? null : disease.name)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-primary-700" />
                <div>
                  <h3 className="font-semibold text-slate-800">{disease.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{disease.affected_crops}</p>
                </div>
              </div>
              {expanded === disease.name ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expanded === disease.name && (
              <div className="px-6 pb-6 border-t border-slate-100 pt-4 space-y-4">
                <p className="text-sm text-slate-600">{disease.description}</p>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Symptoms</h4>
                  <ul className="space-y-1">
                    {disease.symptoms.map((s, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                    <Pill className="w-4 h-4 text-primary-700" /> Treatment
                  </h4>
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                    <p className="text-sm text-primary-900">{disease.treatment}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                    <Shield className="w-4 h-4 text-green-600" /> Prevention
                  </h4>
                  <ul className="space-y-1">
                    {disease.prevention.map((p, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-slate-400 pt-4">
        Built by <a href="https://www.humanoidmaker.com" className="text-primary-700 hover:underline" target="_blank" rel="noreferrer">Humanoid Maker</a>
      </p>
    </div>
  );
}
