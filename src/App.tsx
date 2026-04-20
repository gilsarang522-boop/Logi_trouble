import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { ArrowLeft, Loader2, RefreshCw, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Define the Scenario Type and Data
type Scenario = {
  id: string;
  badge: string;
  title: string;
  description: string;
  colorHex: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'A',
    badge: '시나리오 A',
    title: '파업 직격탄',
    description: "내일 오전 6시 주력 운송사가 '오늘부터 파업 돌입'을 통보했다. 오늘 처리해야 할 출고 물량이 평소의 1.5배.",
    colorHex: '#a92226'
  },
  {
    id: 'B',
    badge: '시나리오 B',
    title: '태풍 직격',
    description: "태풍 예보로 제주·남해안 배송이 3일간 전면 중단 예정. 해당 지역 납기 약속 물량이 200건.",
    colorHex: '#1d6ebc'
  },
  {
    id: 'C',
    badge: '시나리오 C',
    title: '반품 폭발',
    description: "반품 건수가 갑자기 전월 대비 300% 급증. 콜센터가 마비 수준이고 창고 공간도 부족.",
    colorHex: '#be6510'
  }
];

export default function App() {
  const [step, setStep] = useState<'select' | 'form' | 'result'>('select');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [inputs, setInputs] = useState({
    action1: '',
    action2: '',
    action3: ''
  });
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setStep('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = async () => {
    if (!inputs.action1.trim() || !inputs.action2.trim() || !inputs.action3.trim()) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    setStep('result');
    setIsLoading(true);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `당신은 '용마로지스'의 수석 물류 트러블슈팅 전문가입니다. 
사용자가 다음 물류 위기 상황 시나리오에 대해 대응 방안을 작성했습니다.
물류 실무 관점에서 실현 가능성, 고객 만족도, 리스크 관리, 그리고 비용 효율성 측면을 고려하여 구체적이고 날카로운 피드백을 제공해주세요.
현실적인 조언을 아끼지 말고 전문가의 시선에서 객관적으로 평가해야 합니다.

반드시 다음 3가지 섹션을 포함하여 Markdown 형식으로 깔끔하게 정리해주세요:
1. 💡 **잘된 점 (강점 및 긍정적 측면)**
2. ⚠️ **보완할 점 (간과된 리스크 및 개선 방향)**
3. 🎯 **수석 전문가의 종합 평가 및 Action Item 제안**

[위기 시나리오: ${selectedScenario?.title}]
${selectedScenario?.description}

[사용자 대응 방안]
1. 처음 1시간 즉시 행동:
${inputs.action1}

2. 고객 대응 방법:
${inputs.action2}

3. 재발 방지 대책:
${inputs.action3}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt
      });

      setAnalysis(response.text || '분석 결과를 생성하지 못했습니다.');
    } catch (err) {
      console.error(err);
      setError('분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('select');
    setSelectedScenario(null);
    setInputs({ action1: '', action2: '', action3: '' });
    setAnalysis('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen text-slate-800 bg-[#F8FAFC]">
      {/* Header */}
      <nav className="h-16 px-4 md:px-10 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-10 opacity-95 backdrop-blur shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-blue-900 uppercase">
            Yongma Logis
          </span>
        </div>
        {step !== 'select' ? (
          <button 
            onClick={handleReset}
            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            처음으로
          </button>
        ) : (
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-500">
            <span>Dashboard</span>
            <span className="text-blue-600">Troubleshooting</span>
            <span>History</span>
          </div>
        )}
      </nav>

      <main className="flex-1 p-4 md:p-10 flex flex-col max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: SELECT SCENARIO */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <header className="mb-8">
                <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full uppercase tracking-wider">
                  Scenario Analysis
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2 underline decoration-blue-500 underline-offset-4">
                  물류 트러블슈팅: 위기를 기회로
                </h1>
                <p className="text-slate-500 max-w-2xl">
                  아래 3가지 위기 시나리오 중 하나를 선택하고, 당신만의 대응 전략을 수립해보세요.<br className="hidden md:block" />
                  제출 후 AI 수석 전문가의 상세한 피드백을 받을 수 있습니다.
                </p>
              </header>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {SCENARIOS.map((s, idx) => (
                  <div 
                    key={s.id} 
                    onClick={() => handleSelectScenario(s)}
                    className="bg-white border-2 border-transparent p-6 rounded-2xl card-shadow hover:border-slate-200 transition-all cursor-pointer text-slate-400 group flex flex-col h-full"
                  >
                    <span className="text-xs font-bold uppercase mb-2 block text-blue-600 transition-colors">Scenario 0{idx + 1}</span>
                    <h3 className="text-lg font-bold text-slate-700 mb-2 group-hover:text-slate-900 transition-colors">{s.title}</h3>
                    <p className="text-sm leading-relaxed mb-6 flex-grow whitespace-pre-wrap">{s.description}</p>
                    <button className="w-full py-3 font-semibold text-sm text-blue-600 bg-blue-50 opacity-0 group-hover:opacity-100 transition-all border border-blue-100 rounded-xl flex items-center justify-center gap-2 mt-auto">
                      AI 앱에서 선택하기
                    </button>
                  </div>
                ))}
              </section>

              <div className="mt-8 bg-white border border-slate-200 p-6 rounded-2xl card-shadow flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                <span className="text-sm font-semibold text-slate-900">작성 항목:</span>
                <span className="flex flex-wrap justify-center items-center gap-3 text-sm text-slate-600">
                  <span className="px-2 py-1 bg-slate-100 rounded">① 처음 1시간 즉시 행동</span>
                  <span className="px-2 py-1 bg-slate-100 rounded">② 고객 대응 방법</span>
                  <span className="px-2 py-1 bg-slate-100 rounded">③ 재발 방지 대책</span>
                </span>
                <span className="hidden md:inline font-bold text-blue-500">→</span>
                <span className="md:hidden font-bold text-blue-500">↓</span>
                <span className="text-sm font-bold text-blue-600">AI가 분석해드립니다</span>
              </div>
            </motion.div>
          )}

          {/* STEP 2: FORM */}
          {step === 'form' && selectedScenario && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto w-full"
            >
              <button 
                onClick={() => setStep('select')}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                시나리오 다시 선택하기
              </button>

              <div className="active-scenario border-2 p-6 rounded-2xl card-shadow transition-all relative mb-8">
                <div className="absolute top-4 right-4 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase mb-2 block">{selectedScenario.badge}</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{selectedScenario.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedScenario.description}</p>
              </div>

              <div className="space-y-6">
                <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 card-shadow flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">1</span>
                      처음 1시간 즉시 행동
                    </h4>
                    <span className="text-xs text-slate-400 hidden sm:block">Action Plan</span>
                  </div>
                  <textarea 
                    value={inputs.action1}
                    onChange={(e) => setInputs(prev => ({...prev, action1: e.target.value}))}
                    placeholder="위기 발생 직후 1시간 내에 취할 구체적인 행동과 지시사항을 작성하세요. (예: 예비 배송 차량 투입 등)"
                    className="flex-1 w-full h-32 p-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-slate-700 placeholder-slate-300 transition-all text-[15px]"
                  />
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 card-shadow flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">2</span>
                      고객 대응 방법
                    </h4>
                    <span className="text-xs text-slate-400 hidden sm:block">Customer Relations</span>
                  </div>
                  <textarea 
                    value={inputs.action2}
                    onChange={(e) => setInputs(prev => ({...prev, action2: e.target.value}))}
                    placeholder="피해를 입거나 입을 소지가 있는 고객(화주 및 수령인)에게 어떻게 안내하고 소통할 것인지 작성하세요."
                    className="flex-1 w-full h-32 p-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-slate-700 placeholder-slate-300 transition-all text-[15px]"
                  />
                </section>

                <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 card-shadow flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">3</span>
                      재발 방지 대책
                    </h4>
                    <span className="text-xs text-slate-400 hidden sm:block">Prevention</span>
                  </div>
                  <textarea 
                    value={inputs.action3}
                    onChange={(e) => setInputs(prev => ({...prev, action3: e.target.value}))}
                    placeholder="사태가 진정된 후, 유사한 문제가 다시 발생하지 않도록 하기 위한 구조적, 프로세스적 개선 방안을 작성하세요."
                    className="flex-1 w-full h-32 p-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-slate-700 placeholder-slate-300 transition-all text-[15px]"
                  />
                </section>

                <div className="flex justify-end pt-4 pb-8">
                  <button
                    onClick={handleAnalyze}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-xl shadow-lg shadow-blue-200 flex items-center space-x-2 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span>AI 분석 요청하기</span>
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: RESULT */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto w-full"
            >
              <button 
                onClick={() => { setError(''); setStep('form'); }}
                className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                답변 수정하기
              </button>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900">AI 전문가가 분석 중입니다...</h3>
                    <p className="text-slate-500">제출된 내용을 바탕으로 객관적이고 다각적인 평가를 진행하고 있습니다.</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 text-red-900 p-8 rounded-2xl flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                  <h3 className="text-xl font-bold">{error}</h3>
                  <button 
                    onClick={() => { setError(''); setStep('form'); }}
                    className="mt-4 px-6 py-2 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg font-medium transition-colors"
                  >
                    돌아가기
                  </button>
                </div>
              ) : (
                <div className="space-y-8 pb-12">
                  <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden card-shadow">
                    <div className="bg-blue-50 border-b border-slate-200 px-6 py-5 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-blue-600" />
                      <h2 className="font-bold text-xl text-blue-900">수석 전문가 분석 리포트</h2>
                    </div>
                    
                    <div className="flex flex-col md:flex-row border-b border-slate-100 bg-slate-50/50">
                      <div className="p-5 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
                        <span className="text-sm font-semibold text-slate-500 mb-1">대상 시나리오</span>
                        <span className="text-slate-900 font-bold">{selectedScenario?.badge} - {selectedScenario?.title}</span>
                      </div>
                      <div className="p-5 md:w-2/3 flex flex-col justify-center">
                        <p className="text-sm text-slate-600 line-clamp-2">{selectedScenario?.description}</p>
                      </div>
                    </div>

                    <div className="p-6 md:p-10 bg-white">
                      <div className="markdown-body">
                        <ReactMarkdown>{analysis}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Summary of user inputs */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 card-shadow text-sm">
                    <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                       Submitted Actions Summary
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className="font-bold text-slate-800 mr-2">1. 처음 1시간:</span>
                        <span className="text-slate-600">{inputs.action1}</span>
                      </div>
                      <div className="w-full h-px bg-slate-200" />
                      <div>
                        <span className="font-bold text-slate-800 mr-2">2. 고객 대응:</span>
                        <span className="text-slate-600">{inputs.action2}</span>
                      </div>
                      <div className="w-full h-px bg-slate-200" />
                      <div>
                        <span className="font-bold text-slate-800 mr-2">3. 재발 방지:</span>
                        <span className="text-slate-600">{inputs.action3}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-8">
                    <button
                      onClick={handleReset}
                      className="px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <RefreshCw className="w-5 h-5" />
                      다른 시나리오 도전하기
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="p-6 text-center text-xs text-slate-400 uppercase tracking-widest border-t border-slate-200 mt-auto bg-white">
        © 2026 Yongma Logis Operations. All Rights Reserved.
      </footer>
    </div>
  );
}
