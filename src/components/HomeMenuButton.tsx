import type { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
};

export default function HomeMenuButton({ icon, title, subtitle, onClick }: Props) {
  return (
    <button className="home-menu-button" type="button" onClick={onClick}>
      <span className="home-menu-icon">{icon}</span>
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </button>
  );
}
