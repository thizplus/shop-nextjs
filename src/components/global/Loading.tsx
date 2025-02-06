
const Loading = () => {


  // กำหนดสีเริ่มต้นถ้าไม่มี config
  const primaryColor = '#000000';

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p
        className="text-xl mb-4 font-bold"
        style={{ color: primaryColor }}
      >
        LOADING...
      </p>
      <div
        className="w-60 h-10 bg-white rounded p-[2px]"
        style={{ borderColor: primaryColor, borderWidth: 2 }}
      >
        <div className="flex h-full gap-[3px]">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                height: '100%',
                width: '100%',
                backgroundColor: primaryColor,
                animation: `loadBlock 2s ease-in-out ${i * 0.2}s infinite`
              }}
            />
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes loadBlock {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Loading;
