
import React, { useState } from 'react';
import { CheckCircle, Circle, BookOpen, ChevronRight } from 'lucide-react';
import { ReadingPlanDay } from '../types';

const INITIAL_PLAN: ReadingPlanDay[] = [
  { day: 1, passages: ["Gênesis 1-3", "Mateus 1"], completed: true },
  { day: 2, passages: ["Gênesis 4-6", "Mateus 2"], completed: true },
  { day: 3, passages: ["Gênesis 7-9", "Mateus 3"], completed: false },
  { day: 4, passages: ["Gênesis 10-12", "Mateus 4"], completed: false },
  { day: 5, passages: ["Gênesis 13-15", "Mateus 5:1-20"], completed: false },
  { day: 6, passages: ["Gênesis 16-18", "Mateus 5:21-48"], completed: false },
  { day: 7, passages: ["Gênesis 19-21", "Mateus 6"], completed: false },
];

const BiblePlan: React.FC = () => {
  const [plan, setPlan] = useState<ReadingPlanDay[]>(INITIAL_PLAN);

  const toggleDay = (dayIndex: number) => {
    const newPlan = [...plan];
    newPlan[dayIndex].completed = !newPlan[dayIndex].completed;
    setPlan(newPlan);
  };

  const completedCount = plan.filter(d => d.completed).length;
  const progress = (completedCount / plan.length) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-amber-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="text-amber-600" />
              Plano Anual
            </h2>
            <p className="text-gray-500 mt-1">Sua jornada através das Escrituras</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-amber-600">{Math.round(progress)}%</span>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Concluído</p>
          </div>
        </div>
        
        <div className="w-full h-3 bg-amber-50 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-amber-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-4">
          {plan.map((day, idx) => (
            <div 
              key={day.day}
              onClick={() => toggleDay(idx)}
              className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${day.completed ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100 hover:border-amber-200'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`transition-colors ${day.completed ? 'text-amber-600' : 'text-gray-300'}`}>
                  {day.completed ? <CheckCircle className="w-6 h-6 fill-amber-100" /> : <Circle className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className={`font-semibold ${day.completed ? 'text-amber-900' : 'text-gray-700'}`}>Dia {day.day}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {day.passages.map(p => (
                      <span key={p} className="text-sm px-2 py-0.5 bg-white/50 rounded-md text-gray-600 border border-gray-100">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BiblePlan;
