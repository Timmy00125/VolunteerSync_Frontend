export interface Interest {
  id: string;
  name: string;
  category: InterestCategory;
}

export enum InterestCategory {
  ENVIRONMENT = 'ENVIRONMENT',
  EDUCATION = 'EDUCATION',
  HEALTH = 'HEALTH',
  COMMUNITY = 'COMMUNITY',
  TECHNOLOGY = 'TECHNOLOGY',
  ARTS = 'ARTS',
  SPORTS = 'SPORTS',
  ANIMALS = 'ANIMALS',
}
