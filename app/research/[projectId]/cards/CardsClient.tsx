"use client";

import { useState, useEffect } from "react";

export default function CardsClient({ cards }: { cards: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Handle keyboard navigation (Right/Left arrows)
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

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // RTL: Swipe Left (positive diff in RTL means moving forward in next card)
    if (diff > 50) {
      nextCard();
    } else if (diff < -50) {
      prevCard();
    }
    setTouchStart(null);
  };

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === cards.length - 1;

  return (
    <>
    <div 
      className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-6 p-3 sm:p-6 md:p-8 print:hidden relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      dir="rtl"
    >
      
      {/* Print / PDF Button */}
      <button 
        onClick={() => window.print()}
        className="absolute top-3 sm:top-6 left-3 sm:left-6 z-50 bg-[#282a2f] hover:bg-gray-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors flex items-center gap-1.5 sm:gap-2 font-bold shadow-lg border border-[#3f4147] text-xs sm:text-sm"
      >
        <span className="material-symbols-outlined text-[16px] sm:text-[20px]">picture_as_pdf</span>
        <span className="hidden sm:inline">تصدير PDF</span>
      </button>

      {/* Desktop Previous Button (Right side in RTL) */}
      <button 
        onClick={prevCard}
        disabled={isFirst}
        className={`hidden md:flex w-14 lg:w-16 h-14 lg:h-16 shrink-0 items-center justify-center rounded-full bg-[#282a2f] hover:bg-[#3f4147] transition-all shadow-xl ${isFirst ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:scale-105 active:scale-95'}`}
      >
        <span className="material-symbols-outlined text-white text-3xl">chevron_right</span>
      </button>

      {/* Card Container */}
      <div className="flex-1 w-full max-w-5xl h-[78vh] sm:h-[82vh] md:h-[85vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col p-5 sm:p-8 md:p-12 transition-transform duration-300 relative overflow-y-auto border-2 sm:border-4 border-[#e8e6df]">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gray-100">
          <div 
            className="h-full bg-[#a1824a] transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>

        {currentCard.type === "chapter_title" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 my-auto">
            <div className="w-14 sm:w-20 h-14 sm:h-20 bg-[#a1824a] text-white rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg">
              {currentCard.index}
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#1b1d20] leading-tight px-2">
              {currentCard.title}
            </h2>
            <div className="flex items-center gap-2 bg-[#f8f8f5] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-gray-500 font-bold text-sm sm:text-xl mt-2 sm:mt-4 border border-[#e8e6df]">
              <span className="material-symbols-outlined text-base sm:text-2xl">schedule</span>
              {currentCard.estimatedMinutes} دقيقة
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center relative">
            <div className="flex items-center justify-between mb-4 sm:mb-8 flex-wrap gap-2">
              <span className="text-gray-400 font-bold text-sm sm:text-xl">
                المحور {currentCard.chIndex} • سؤال {currentCard.qIndex}
              </span>
              
              {currentCard.questionType === 'sensitive' && (
                <span className="bg-red-100 text-red-600 px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 font-bold text-xs sm:text-base shadow-sm border border-red-200">
                  <span className="material-symbols-outlined text-sm sm:text-base">warning</span> نقطة حساسة
                </span>
              )}
              {currentCard.questionType === 'viral' && (
                <span className="bg-purple-100 text-purple-600 px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1.5 font-bold text-xs sm:text-base shadow-sm border border-purple-200">
                  <span className="material-symbols-outlined text-sm sm:text-base">trending_up</span> فرصة للانتشار
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#1b1d20] leading-[1.4] sm:leading-[1.5] mb-4 sm:mb-8 font-serif">
              «{currentCard.question}»
            </h2>

            {currentCard.whyItMatters && (
              <div className="bg-[#f8f8f5] border-r-4 border-[#a1824a] p-3 sm:p-6 rounded-xl text-[#1b1d20] mb-4 sm:mb-8 text-xs sm:text-base md:text-lg shadow-sm whitespace-pre-wrap leading-relaxed">
                <span className="text-[#a1824a] font-bold flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-3">
                  <span className="material-symbols-outlined text-base sm:text-2xl">psychology</span>
                  توجيه للمذيع (بطاقة السؤال):
                </span>
                {currentCard.whyItMatters}
              </div>
            )}

            {currentCard.followUps && currentCard.followUps.length > 0 && (
              <div className="space-y-2 sm:space-y-4">
                <h3 className="font-bold text-gray-400 text-xs sm:text-base md:text-lg flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm sm:text-base">forum</span> تفرعات محتملة:
                </h3>
                {currentCard.followUps.map((fu: any) => (
                  <div key={fu.id} className="flex items-start gap-2 sm:gap-3 bg-gray-50 p-2.5 sm:p-4 rounded-lg sm:rounded-xl border border-gray-100">
                    <span className="material-symbols-outlined text-gray-400 text-sm sm:text-base mt-0.5">subdirectory_arrow_left</span>
                    <p className="text-xs sm:text-base md:text-lg text-gray-700 font-medium leading-relaxed">{fu.question}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Next Button (Left side in RTL) */}
      <button 
        onClick={nextCard}
        disabled={isLast}
        className={`hidden md:flex w-14 lg:w-16 h-14 lg:h-16 shrink-0 items-center justify-center rounded-full bg-[#a1824a] hover:bg-[#8b6e3e] transition-all shadow-xl ${isLast ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:scale-105 active:scale-95'}`}
      >
        <span className="material-symbols-outlined text-white text-3xl">chevron_left</span>
      </button>

      {/* Mobile Bottom Navigation Toolbar */}
      <div className="flex md:hidden items-center justify-between w-full max-w-sm px-4 py-2 bg-[#1b1d20] rounded-full shadow-lg border border-[#3f4147] mt-1 shrink-0">
        <button 
          onClick={prevCard}
          disabled={isFirst}
          className={`p-2 rounded-full text-white flex items-center ${isFirst ? 'opacity-30' : 'active:scale-90'}`}
        >
          <span className="material-symbols-outlined text-2xl">chevron_right</span>
          <span className="text-xs mr-1 font-bold">السابق</span>
        </button>

        <span className="text-gray-300 font-mono text-xs font-bold">
          {currentIndex + 1} / {cards.length}
        </span>

        <button 
          onClick={nextCard}
          disabled={isLast}
          className={`p-2 rounded-full text-[#a1824a] flex items-center ${isLast ? 'opacity-30' : 'active:scale-90'}`}
        >
          <span className="text-xs ml-1 font-bold text-white">التالي</span>
          <span className="material-symbols-outlined text-2xl">chevron_left</span>
        </button>
      </div>

      {/* Desktop Page indicator */}
      <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 font-bold text-sm bg-[#1b1d20] px-4 py-1.5 rounded-full shadow-lg border border-[#3f4147]">
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
              <h2 className="text-5xl font-bold text-[#1b1d20] leading-tight">
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

              <h2 className="text-4xl font-bold text-[#1b1d20] leading-[1.5] mb-8 font-serif">
                «{card.question}»
              </h2>

              {card.whyItMatters && (
                <div className="bg-gray-50 border-r-4 border-[#a1824a] p-6 rounded-xl text-gray-800 mb-8 text-lg whitespace-pre-wrap leading-relaxed">
                  <strong className="block text-[#a1824a] mb-2">بطاقة التوجيه للمذيع:</strong>
                  {card.whyItMatters}
                </div>
              )}

              {card.followUps && card.followUps.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-500 text-lg">تفرعات محتملة:</h3>
                  {card.followUps.map((fu: any) => (
                    <div key={fu.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-700">
                      {fu.question}
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
