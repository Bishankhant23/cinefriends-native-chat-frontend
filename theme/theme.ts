export const palette = {
  khaki: "#CBBD93",
  cream: "#FAE8B4",
  mutedBrown: "#80775C",
  deepBrown: "#574A24",

  darkBg: "#0F0E0B", 
  darkSurface: "#1C1B17", 
  darkElevated: "#2A2922", 
  
  white: "#FFFFFF",
  offWhite: "#F5F2E9",
  gray400: "#706D63",
  gray500: "#A39B8A",
  
  success: "#4ADE80",
  danger: "#F87171",
  whatsappGreen: "#25D366",
};

export const colors = {
  primary: palette.khaki,      
  primaryContrast: palette.darkBg,
  accent: palette.mutedBrown,
  
  background: palette.darkBg,     
  surface: palette.darkSurface,   
  elevated: palette.darkElevated,
  
  textPrimary: palette.offWhite,    
  textSecondary: palette.gray500,   
  textTertiary: palette.gray400,    
  
  border: "#2D2B24",
  subtle: palette.darkElevated,
  
  success: palette.success,
  danger: palette.danger,
};

const theme = { palette, colors };
export type Theme = typeof theme;
export default theme;
