import { useMemo } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import './custom-swiper.css';
import { useConfigStore } from '@/stores/configStore';



const Slider = () => {
  const { config } = useConfigStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sliders = config?.displayConfig?.sliders || [];

  // ตรวจสอบว่ามีรูปภาพที่ใช้งานได้จริง
  const validSlides = useMemo(() =>
    sliders.filter(slide => slide.url && slide.id),
    [sliders]
  );

  // ถ้าไม่มีรูป return null เพื่อไม่ให้แสดง component
  if (validSlides.length === 0) {
    return null;
  }

  // ปรับ loop mode ตามจำนวนรูป
  const shouldLoop = validSlides.length > 1;

  return (
    <div className="slider-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={validSlides.length > 1}
        pagination={validSlides.length > 1 ? { clickable: true } : false}
        loop={shouldLoop}
        autoplay={shouldLoop ? {
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        } : false}
        className="w-full"
      >
        {validSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <img
              src={slide.url}
              className="w-full object-cover"
              alt={`Slide ${slide.id}`}
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;

                target.style.display = 'none';
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;
