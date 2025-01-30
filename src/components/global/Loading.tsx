const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-xl mb-4 font-bold">LOADING...</p>
      <div className="w-60 h-6 bg-white rounded border-2 border-gray-800 p-[2px]">
        <div className="flex h-full gap-[2px]">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-full w-full bg-gray-800"
              style={{
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
