export type DDay = {
  title: string;
  targetDate: string;
  label: string;
  icon: string;
  memo?: string;
};

export type Notice = {
  message: string;
  important: boolean;
  order: number;
};

export type AcademicEventCategory = '시험' | '행사' | '방학' | '학교생활' | '기타' | string;

export type AcademicEvent = {
  date: string;
  title: string;
  category: AcademicEventCategory;
  details?: string;
  order: number;
};

export type PointRank = {
  rank: number;
  displayName: string;
  totalPoints: number;
};

export type KioskData = {
  ok: true;
  generatedAt: string;
  timezone: 'Asia/Seoul';
  dday: DDay | null;
  notices: Notice[];
  academicEvents: AcademicEvent[];
  pointRanking: PointRank[];
};

export type KioskError = {
  ok: false;
  message: string;
};

export type KioskApiResponse = KioskData | KioskError;

export type CachedKioskData = {
  data: KioskData;
  savedAt: string;
};
