export interface UserSkill {
  id: string;
  name: string;
  proficiency: SkillProficiency;
  category?: SkillCategory;
  verified?: boolean;
}

export enum SkillProficiency {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum SkillCategory {
  TECHNICAL = 'TECHNICAL',
  COMMUNICATION = 'COMMUNICATION',
  LEADERSHIP = 'LEADERSHIP',
  PHYSICAL = 'PHYSICAL',
  CREATIVE = 'CREATIVE',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
}
