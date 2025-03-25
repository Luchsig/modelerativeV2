import * as React from "react";

import { IconSvgProps } from "@/types";

export const Logo: React.FC<IconSvgProps> = ({ size = 36 }) => {
  const logoSrc = "/modelerative_logo_bright.png";

  return <img key={logoSrc} alt="Logo" src={logoSrc} width={size} />;
};
