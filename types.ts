
export interface Devotional {
  id: string;
  title: string;
  verse: string;
  reference: string;
  content: string;
  date: string;
  imageUrl: string;
}

export interface ReadingPlanDay {
  day: number;
  passages: string[];
  completed: boolean;
}

export interface VersePoster {
  id: string;
  text: string;
  reference: string;
  imageUrl: string;
}

export type AppTab = 'home' | 'bible' | 'audio' | 'posters';
