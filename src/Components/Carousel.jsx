import { useState, useEffect } from "react";

const Carousel = ({ slides, onSlideChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
  };

  // Call the onSlideChange callback whenever the currentIndex changes
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentIndex);
    }
  }, [currentIndex, onSlideChange]);

  // Determine if the buttons should be disabled
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex === slides.length - 1;

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="overflow-hidden mx-2">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              className={`min-w-full p-2 px-0 flex flex-col items-center justify-center  transition-transform duration-300 `}
              key={index}
            >
              <div className="max-w-xl border rounded-lg shadow-lg p-2 px-1 mx-0">
                {slide}
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={prevSlide}
        disabled={isPrevDisabled}
        className={`text-2xl absolute top-1/2 left-0 transform -translate-y-1/2 px-2 py-1 rounded-full shadow ${
          isPrevDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-white"
        }`}
      >
        {"<"}
      </button>
      <button
        onClick={nextSlide}
        disabled={isNextDisabled}
        className={`text-2xl absolute top-1/2 right-0 transform -translate-y-1/2 px-2 py-1 rounded-full shadow ${
          isNextDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-white"
        }`}
      >
        {">"}
      </button>
    </div>
  );
};

export default Carousel;
