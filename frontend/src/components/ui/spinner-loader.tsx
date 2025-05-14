import React from 'react';
import { Sparkles } from 'lucide-react'; // Using Sparkles for the "heartbeat" icon

interface SpinnerLoaderProps {
  text?: string | React.ReactNode;
  size?: number;
  iconSize?: number;
  iconColor?: string;
  spinnerColor?: string;
  spinnerWidth?: string;
  textColor?: string;
  textSize?: string;
  className?: string;
  thickness?: string;
  bgColorClass?: string;
  animationDuration?: string;
}

export const SpinnerLoader: React.FC<SpinnerLoaderProps> = ({
  text = "Loading...",
  size = 24, // Default: w-24 h-24 for the spinner container
  iconSize = 40, // Default Lucide icon size
  iconColor = "text-primary",
  spinnerColor = "from-purple-600 via-pink-600 to-blue-600",
  spinnerWidth = "border-[3px] md:border-3", // Responsive border width
  bgColorClass = 'bg-white',
  textColor = "text-slate-400",
  textSize = "text-sm md:text-base", // Responsive text size
  className = "",
  thickness = '4px',
  animationDuration = '1.5s',
}) => {
  const containerSizeClass = `w-${size} h-${size}`;

  // Style for the Sparkles icon with heartbeat animation
  const iconStyle: React.CSSProperties = {
    animation: 'heartbeat 1.2s infinite ease-in-out',
  };

  const spinnerStyle: React.CSSProperties = {
    animationDuration,
  };

  const innerMaskStyle = {
    top: thickness,
    right: thickness,
    bottom: thickness,
    left: thickness,
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative flex items-center justify-center ${containerSizeClass}`}>
        <div
          className={`absolute w-full h-full rounded-full ${spinnerWidth} ${spinnerColor} bg-gradient-to-tr border-t-transparent animate-spin`}
          style={spinnerStyle}
        />

        <div
          className={`absolute rounded-full ${bgColorClass}`}
          style={innerMaskStyle}
        ></div>

        <Sparkles
          size={iconSize}
          className={`absolute ${iconColor}`}
          style={iconStyle}
          strokeWidth={1}
        />
      </div>

      {text && (
        <p className={`mt-8 text-center px-10 font-light ${textSize} ${textColor}`}>
          {text}
        </p>
      )}
    </div>
  );
};
