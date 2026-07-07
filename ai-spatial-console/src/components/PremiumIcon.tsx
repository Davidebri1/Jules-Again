import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Filter, DropShadow, Rect, Circle, G } from 'react-native-svg';

const PremiumWrapper = ({ size = 24, color = '#FFFFFF', children }: any) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="1" />
            <Stop offset="1" stopColor={color} stopOpacity="0.5" />
          </LinearGradient>
          <LinearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
            <Stop offset="0.5" stopColor="#aaaaaa" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0.6" />
          </LinearGradient>
          <Filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <DropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
          </Filter>
        </Defs>
        <G filter="url(#drop-shadow)">
          {/* Subtle metallic backplate for depth */}
          <Circle cx="12" cy="12" r="11" fill="url(#metal)" opacity="0.1" />
          <Circle cx="12" cy="12" r="11.5" stroke="url(#metal)" strokeWidth="0.5" opacity="0.3" />
          {children}
        </G>
      </Svg>
    </View>
  );
};

const IconShape = ({ path, size, color, fill = "none", strokeWidth = "1.5" }: any) => (
  <PremiumWrapper size={size} color={color}>
    <Path d={path} fill={fill} stroke="url(#grad1)" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </PremiumWrapper>
);

// Exports
export const X = (props: any) => <IconShape path="M18 6L6 18M6 6l12 12" {...props} />;
export const Search = (props: any) => <IconShape path="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" {...props} />;
export const Sparkles = (props: any) => <IconShape path="M12 3v18m9-9H3m14.485-6.364l-10.97 10.97m10.97 0L5.515 5.636" {...props} />;
export const Download = (props: any) => <IconShape path="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5-9v14" {...props} />;
export const Heart = (props: any) => <IconShape path="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" {...props} />;
export const ArrowUpRight = (props: any) => <IconShape path="M7 17L17 7M7 7h10v10" {...props} />;
export const User = (props: any) => <IconShape path="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" {...props} />;
export const Shield = (props: any) => <IconShape path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...props} />;
export const CreditCard = (props: any) => <IconShape path="M2 10h20M2 14h20M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" {...props} />;
export const Settings = (props: any) => <IconShape path="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" {...props} />;
export const Clock = (props: any) => <IconShape path="M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2" {...props} />;
export const Globe = (props: any) => <IconShape path="M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" {...props} />;
export const Mic = (props: any) => <IconShape path="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" {...props} />;
export const Send = (props: any) => <IconShape path="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" {...props} />;
export const EyeOff = (props: any) => <IconShape path="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" {...props} />;
export const Plus = (props: any) => <IconShape path="M12 5v14M5 12h14" {...props} />;
export const Paperclip = (props: any) => <IconShape path="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" {...props} />;
export const Hash = (props: any) => <IconShape path="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" {...props} />;
export const Brain = (props: any) => <IconShape path="M12 3a4 4 0 00-4 4v10a4 4 0 008 0V7a4 4 0 00-4-4zm-4 4a4 4 0 10-8 0v6a4 4 0 008 0V7zm8 0a4 4 0 118 0v6a4 4 0 01-8 0V7z" {...props} />;
export const FolderOpen = (props: any) => <IconShape path="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2zM2 10h20" {...props} />;
export const CheckSquare = (props: any) => <IconShape path="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" {...props} />;
export const Bell = (props: any) => <IconShape path="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0" {...props} />;
export const Code = (props: any) => <IconShape path="M16 18l6-6-6-6M8 6l-6 6 6 6M14 4l-4 16" {...props} />;
export const Mail = (props: any) => <IconShape path="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" {...props} />;
export const Apple = (props: any) => <IconShape path="M12 2.04C12.63 1.14 13.68.5 14.86.5c.07 1.18-.38 2.3-1.1 3.12-.7.83-1.84 1.4-2.92 1.3-.09-1.12.44-2.22 1.16-2.88zM17.06 19.5c-1.4 2.1-2.93 2.5-4.48 2.5-1.52 0-2.26-.88-4.22-.88-1.93 0-2.86.84-4.14.88-1.6-.04-3.3-1.46-4.75-3.56C-2.4 13.64-.1 8.53 2.15 8.53c1.47 0 2.45.9 3.65.9 1.18 0 2.56-.98 4.22-.98 1.47 0 3.03.62 4.14 1.84-3.58 1.94-2.88 6.47.46 8.04-.46 1.18-1.04 2.37-1.56 3.17z" {...props} />;
export const CheckCircle2 = (props: any) => <IconShape path="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" {...props} />;
export const ChevronLeft = (props: any) => <IconShape path="M15 18l-6-6 6-6" {...props} />;
export const MoreHorizontal = (props: any) => <IconShape path="M12 12h.01M19 12h.01M5 12h.01M12 12a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2zm-14 0a1 1 0 110-2 1 1 0 010 2z" fill="#FFF" {...props} />;
export const Layers = (props: any) => <IconShape path="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" {...props} />;
export const Zap = (props: any) => <IconShape path="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#grad1)" {...props} />;
export const Sliders = (props: any) => <IconShape path="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" {...props} />;
export const Building = (props: any) => <IconShape path="M4 22V2M20 22V2M12 22V2M4 12h16M4 7h16M4 17h16" {...props} />;
export const FileText = (props: any) => <IconShape path="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" {...props} />;
export const Image = (props: any) => <IconShape path="M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2zM21 15l-5-5L5 21M10.5 8.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" {...props} />;
export const Video = (props: any) => <IconShape path="M23 7l-7 5 7 5V7zM1 5h14v14H1z" {...props} />;
export const Upload = (props: any) => <IconShape path="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" {...props} />;
export const Folder = (props: any) => <IconShape path="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" {...props} />;
export const Database = (props: any) => <IconShape path="M12 5c-5.5 0-10 1.8-10 4s4.5 4 10 4 10-1.8 10-4-4.5-4-10-4zM12 12c-5.5 0-10 1.8-10 4s4.5 4 10 4 10-1.8 10-4-4.5-4-10-4zM12 19c-5.5 0-10 1.8-10 4s4.5 4 10 4 10-1.8 10-4-4.5-4-10-4z" {...props} />;
export const DownloadCloud = (props: any) => <IconShape path="M8 17l4 4 4-4M12 12v9M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29" {...props} />;
export const MoreVertical = (props: any) => <IconShape path="M12 12h.01M12 19h.01M12 5h.01" strokeWidth="3" {...props} />;
export const Star = (props: any) => <IconShape path="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#grad1)" {...props} />;
export const Trash2 = (props: any) => <IconShape path="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" {...props} />;
export const Maximize2 = (props: any) => <IconShape path="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" {...props} />;
export const CopyPlus = (props: any) => <IconShape path="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2v-2M12 11h4M14 9v4M2 14h10V4H2z" {...props} />;
export const Link = (props: any) => <IconShape path="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" {...props} />;
