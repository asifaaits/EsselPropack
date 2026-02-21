import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Ellipse, Rect, G } from 'react-native-svg';

export const BodyOutline = () => (
  <G>
    {/* Head with subtle gradient effect */}
    <Circle cx={150} cy={35} r={22} fill="#2C3A47" stroke="#1a237e" strokeWidth={1.2} />
    <Circle cx={150} cy={35} r={18} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
    
    {/* Neck */}
    <Rect x={138} y={60} width={24} height={20} rx={8} fill="#2C3A47" stroke="#1a237e" strokeWidth={1.2} />
    
    {/* Shoulders and Upper Torso */}
    <Path 
      d="M105 85 Q105 75 120 75 L180 75 Q195 75 195 85 L200 100 Q200 110 190 110 L110 110 Q100 110 100 100 Z" 
      fill="#2C3A47" 
      stroke="#1a237e" 
      strokeWidth={1.2} 
    />
    
    {/* Chest/Abdomen */}
    <Rect x={120} y={108} width={60} height={55} rx={6} fill="#2C3A47" stroke="#1a237e" strokeWidth={1.2} />
    
    {/* Lower Abdomen */}
    <Rect x={118} y={160} width={64} height={45} rx={8} fill="#2C3A47" stroke="#1a237e" strokeWidth={1.2} />
    
    {/* Left Arm */}
    <Path 
      d="M100 100 L82 120 L72 190 Q68 210 68 215 L78 215 Q80 205 85 190 L100 130" 
      fill="#2C3A47" 
      stroke="#1a237e" 
      strokeWidth={1.2} 
    />
    
    {/* Right Arm */}
    <Path 
      d="M200 100 L218 120 L228 190 Q232 210 232 215 L222 215 Q220 205 215 190 L200 130" 
      fill="#2C3A47" 
      stroke="#1a237e" 
      strokeWidth={1.2} 
    />
    
    {/* Left Thigh */}
    <Rect x={113} y={200} width={34} height={75} rx={8} fill="#2C3A47" stroke="#1a237e" strokeWidth={1.2} />
    
    {/* Right Thigh */}
    <Rect x={153} y={200} width={34} height={75} rx={8} fill="#2C3A47" stroke="#1a237e" strokeWidth={1.2} />
    
    {/* Left Shin */}
    <Rect x={113} y={272} width={34} height={70} rx={6} fill="#2C3A47" stroke="#1a237e" strokeWidth={1.2} />
    
    {/* Right Shin */}
    <Rect x={153} y={272} width={34} height={70} rx={6} fill="#2C3A47" stroke="#1a237e" strokeWidth={1.2} />
    
    {/* Left Foot */}
    <Ellipse cx={125} cy={365} rx={18} ry={10} fill="#2C3A47" stroke="#1a237e" strokeWidth={1.2} />
    
    {/* Right Foot */}
    <Ellipse cx={175} cy={365} rx={18} ry={10} fill="#2C3A47" stroke="#1a237e" strokeWidth={1.2} />
    
    {/* Subtle anatomical details */}
    <Circle cx={150} cy={120} r={2} fill="rgba(255,255,255,0.2)" />
    <Circle cx={150} cy={170} r={2} fill="rgba(255,255,255,0.2)" />
  </G>
);

export const SelectedHighlight = ({ part }) => (
  <G>
    {/* Main highlight with gradient effect */}
    <Circle 
      cx={part.x} 
      cy={part.y} 
      r={part.r} 
      fill="rgba(26, 35, 126, 0.3)" 
      stroke="#1a237e" 
      strokeWidth={2.5} 
    />
    
    {/* Inner glow */}
    <Circle 
      cx={part.x} 
      cy={part.y} 
      r={part.r - 4} 
      fill="none" 
      stroke="rgba(255,255,255,0.5)" 
      strokeWidth={1} 
    />
    
    {/* Outer pulse ring */}
    <Circle 
      cx={part.x} 
      cy={part.y} 
      r={part.r + 6} 
      fill="none" 
      stroke="rgba(26, 35, 126, 0.3)" 
      strokeWidth={2} 
      strokeDasharray="4 4" 
    />
    
    {/* Checkmark indicator */}
    <Circle 
      cx={part.x - 8} 
      cy={part.y - 8} 
      r={8} 
      fill="#1a237e" 
      stroke="#fff" 
      strokeWidth={1.5} 
    />
    <Path 
      d={`M${part.x - 12} ${part.y - 8} L${part.x - 8} ${part.y - 4} L${part.x - 4} ${part.y - 12}`} 
      stroke="#fff" 
      strokeWidth={2} 
      fill="none" 
    />
  </G>
);