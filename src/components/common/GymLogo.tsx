import React from 'react';
import { Dumbbell, Flame, Trophy, Crown, Shield, Zap } from 'lucide-react';
import { GymSettings } from '../../types';

interface GymLogoProps {
  settings: GymSettings;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const GymLogo: React.FC<GymLogoProps> = ({
  settings,
  size = 'md',
  showText = true,
  className = '',
}) => {
  const renderIcon = () => {
    const iconProps = {
      className: size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-14 h-14',
    };

    if (settings.logo?.startsWith('http') || settings.logo?.startsWith('data:image')) {
      return (
        <img
          src={settings.logo}
          alt={settings.name}
          className="w-full h-full object-contain p-0.5"
          referrerPolicy="no-referrer"
        />
      );
    }

    switch (settings.logo) {
      case 'flame':
        return <Flame {...iconProps} className={`${iconProps.className} text-lime-400`} />;
      case 'trophy':
        return <Trophy {...iconProps} className={`${iconProps.className} text-lime-400`} />;
      case 'crown':
        return <Crown {...iconProps} className={`${iconProps.className} text-lime-400`} />;
      case 'shield':
        return <Shield {...iconProps} className={`${iconProps.className} text-lime-400`} />;
      case 'zap':
        return <Zap {...iconProps} className={`${iconProps.className} text-lime-400`} />;
      case 'dumbbell':
      default:
        return <Dumbbell {...iconProps} className={`${iconProps.className} text-lime-400`} />;
    }
  };

  const containerSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-3xl',
  };

  const textSizes = {
    sm: 'text-sm font-black',
    md: 'text-lg font-black',
    lg: 'text-2xl font-black',
    xl: 'text-3xl font-black',
  };

  return (
    <div id="gym-logo-brand" className={`flex items-center gap-3 ${className}`}>
      <div className={`bg-lime-400/15 border border-lime-400/30 flex items-center justify-center shrink-0 overflow-hidden ${containerSizes[size]}`}>
        {renderIcon()}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`text-white tracking-tighter uppercase italic leading-tight ${textSizes[size]}`}>
            {settings.name}
          </span>
          {settings.tagline && size !== 'sm' && (
            <span className="text-[11px] text-lime-400 font-bold uppercase tracking-widest">
              {settings.tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
