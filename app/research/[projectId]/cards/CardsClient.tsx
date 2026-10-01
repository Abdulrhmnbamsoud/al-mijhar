"use client";

import { useState, useEffect } from "react";

export default function CardsClient({ cards }: { cards: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle keyboard navigation for testing (Right/Left arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        nextCard();
      } else if (e.key === "ArrowRight") {
        prevCard();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, cards.length]);

  const nextCard = () => {
    if (currentIndex < cards.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevCard = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === cards.length - 1;

  return (
    <>
    <div className="w-full h-full flex items-center justify-center gap-6 px-8 print:hidden">
      
      {/* Print / PDF Button */}
      <button 
        onClick={() => window.print()}
        className="absolute top-6 left-6 z-50 bg-[#282a2f] hover:bg-gray-700 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2 font-bold shadow-lg border border-[#3f4147]"
      >
        <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
        تصدير PDF
      </button>

      {/* Previous Button (Right side in RTL) */}
      <button 
        onClick={prevCard}
        disabled={isFirst}
        className={`w-16 h-16 shrink-0 flex items-center justify-center rounded-full bg-[#282a2f] hover:bg-[#3f4147] transition-all shadow-xl ${isFirst ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:scale-105 active:scale-95'}`}
      >
        <span className="material-symbols-outlined text-white text-3xl">chevron_right</span>
      </button>

      {/* Card Container */}
      <div className="flex-1 max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col p-12 transition-transform duration-300 relative overflow-y-auto border-4 border-[#e8e6df]">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100">
          <div 
            className="h-full bg-[#a1824a] transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        {currentCard.type === "chapter_title" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-[#a1824a] text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
              {currentCard.index}
            </div>
            <h2 className="text-6xl md:text-7xl font-bold text-[#1b1d20] leading-tight">
              {currentCard.title}
            </h2>
            <div className="flex items-center gap-2 bg-[#f8f8f5] px-4 py-2 rounded-lg text-gray-500 font-bold text-xl mt-4 border border-[#e8e6df]">
              <span className="material-symbols-outlined text-2xl">schedule</span>
              {currentCard.estimatedMinutes} دقيقة
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center relative">
            <div className="flex items-center justify-between mb-8">
              <span className="text-gray-400 font-bold text-xl">
                المحور {currentCard.chIndex} • سؤال {currentCard.qIndex}
              </span>
              
              {currentCard.questionType === 'sensitive' && (
                <span className="bg-red-100 text-red-600 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-lg shadow-sm border border-red-200">
                  <span className="material-symbols-outlined">warning</span> نقطة حساسة
                </span>
              )}
              {currentCard.questionType === 'viral' && (
                <span className="bg-purple-100 text-purple-600 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-lg shadow-sm border border-purple-200">
                  <span className="material-symbols-outlined">trending_up</span> فرصة للانتشار
                </span>
              )}
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-[#1b1d20] leading-[1.5] mb-8">
              {currentCard.question}
            </h2>

            {currentCard.whyItMatters && (
              <div className="bg-[#f8f8f5] border-r-4 border-[#a1824a] p-6 rounded-xl text-[#1b1d20] mb-8 text-xl shadow-sm">
                <span className="text-[#a1824a] font-bold flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-2xl">psychology</span>
                  توجيه سري للمذيع (تكتيك):
                </span>
                {currentCard.whyItMatters}
              </div>
            )}

            {currentCard.followUps && currentCard.followUps.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-400 text-xl flex items-center gap-2">
                  <span className="material-symbols-outlined">forum</span> تفرعات محتملة:
                </h3>
                {currentCard.followUps.map((fu: any) => (
                  <div key={fu.id} className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="material-symbols-outlined text-gray-400 mt-1">subdirectory_arrow_left</span>
                    <p className="text-xl text-gray-700 font-medium">{fu.question}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next Button (Left side in RTL) */}
      <button 
        onClick={nextCard}
        disabled={isLast}
        className={`w-16 h-16 shrink-0 flex items-center justify-center rounded-full bg-[#a1824a] hover:bg-[#8b6e3e] transition-all shadow-xl ${isLast ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:scale-105 active:scale-95'}`}
      >
        <span className="material-symbols-outlined text-white text-3xl">chevron_left</span>
      </button>

      {/* Page indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 font-bold text-sm bg-[#1b1d20] px-4 py-1.5 rounded-full shadow-lg border border-[#3f4147]">
        {currentIndex + 1} / {cards.length}
      </div>

    </div>

    {/* Print View (Hidden on Screen, Visible on Print) */}
    <div className="hidden print:block w-full bg-white text-black" dir="rtl">
      {cards.map((card, idx) => (
        <div key={idx} style={{ pageBreakAfter: 'always', minHeight: '100vh', paddingTop: '4rem' }} className="w-full flex flex-col items-center justify-center p-12 bg-white">
          {card.type === "chapter_title" ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-[#a1824a] text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto border-2 border-[#1b1d20]">
                {card.index}
              </div>
              <h2 className="text-6xl font-bold text-[#1b1d20] leading-tight">
                {card.title}
              </h2>
              <div className="text-gray-500 font-bold text-xl mt-4">
                الوقت المقدر: {card.estimatedMinutes} دقيقة
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8 border-b-2 border-gray-100 pb-4">
                <span className="text-gray-500 font-bold text-xl">
                  المحور {card.chIndex} • سؤال {card.qIndex}
                </span>
                {card.questionType === 'sensitive' && (
                  <span className="text-red-600 font-bold text-lg border-2 border-red-200 px-3 py-1 rounded-xl">نقطة حساسة</span>
                )}
                {card.questionType === 'viral' && (
                  <span className="text-purple-600 font-bold text-lg border-2 border-purple-200 px-3 py-1 rounded-xl">فرصة انتشار</span>
                )}
              </div>

              <h2 className="text-5xl font-bold text-[#1b1d20] leading-[1.5] mb-8">
                {card.question}
              </h2>

              {card.whyItMatters && (
                <div className="bg-gray-50 border-r-4 border-[#a1824a] p-6 rounded-xl text-[#1b1d20] mb-8 text-xl">
                  <span className="text-[#a1824a] font-bold block mb-2">توجيه سري (تكتيك):</span>
                  {card.whyItMatters}
                </div>
              )}

              {card.followUps && card.followUps.length > 0 && (
                <div className="space-y-4 mt-8 pt-8 border-t-2 border-dashed border-gray-200">
                  <h3 className="font-bold text-gray-400 text-xl">تفرعات محتملة:</h3>
                  {card.followUps.map((fu: any, fIdx: number) => (
                    <div key={fIdx} className="flex items-start gap-3 pl-4">
                      <span className="text-gray-400 font-bold">-</span>
                      <p className="text-xl text-gray-700 font-medium">{fu.question}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
    </>
  );
}
