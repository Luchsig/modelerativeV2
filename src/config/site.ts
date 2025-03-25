export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "modelerative",
  description: "Build beautiful architectures without restrictions.",
  navItems: [
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Rooms",
      href: "/rooms",
      secured: true,
    },
  ],
  navMenuItems: [
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Rooms",
      href: "/rooms",
      secured: true,
    },
  ],
  links: {
    github: "https://github.com/Luchsig",
  },
};
