import { Loader2 } from 'lucide-react';

const Loading = ({ fullScreen = true, text = 'Memuat...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 className="w-10 h-10 text-[#0028B3] animate-spin mb-4" />
      {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="w-full flex justify-center p-8">{content}</div>;
};

export default Loading;
