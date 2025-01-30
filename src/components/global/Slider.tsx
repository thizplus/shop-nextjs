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
  const sliders = config?.displayConfig?.sliders || []; // ใช้ fallback หาก sliders ไม่มีข้อมูล

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={0}
      slidesPerView={1}
      navigation={true}
      pagination={{ clickable: true }}
      loop={true}
      autoplay={{
        delay: 2500, // 5 seconds
        disableOnInteraction: false, // จะไม่หยุด autoplay เมื่อผู้ใช้มีการ interact
        pauseOnMouseEnter: true, // หยุดเมื่อเมาส์ hover
      }}
    >
      {sliders.map((slide) => (
        <SwiperSlide key={slide.id}>
          <img src={slide.url} className="w-full" alt={`Slide ${slide.id}`} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Slider;
