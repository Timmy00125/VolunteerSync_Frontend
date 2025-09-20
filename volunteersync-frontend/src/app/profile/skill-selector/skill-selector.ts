import { Component, computed, inject, OnInit, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

// Models
import { Skill, SkillCategory, SkillLevel, SkillInput } from '../../shared/models/user.model';

// Services
import { ProfileService } from '../services/profile';

@Component({
  selector: 'app-skill-selector',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './skill-selector.html',
  styleUrls: [],
})
export class SkillSelector implements OnInit {
  private profileService = inject(ProfileService);

  // Input/Output
  initialSkills = input<Skill[]>([]);
  skillsChanged = output<Skill[]>();

  // Form Controls
  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  levelControl = new FormControl<SkillLevel>(SkillLevel.BEGINNER);

  // Component State
  currentSkills = signal<Skill[]>([]);
  availableSkills = signal<Skill[]>([]);
  isLoading = signal(false);

  // Constants
  skillCategories = Object.values(SkillCategory);
  skillLevels = Object.values(SkillLevel);

  // Computed
  filteredAvailableSkills = computed(() => {
    const search = this.searchControl.value?.toLowerCase() || '';
    const category = this.categoryControl.value;
    const current = this.currentSkills().map((s) => s.name.toLowerCase());

    return this.availableSkills().filter(
      (skill) =>
        !current.includes(skill.name.toLowerCase()) &&
        skill.name.toLowerCase().includes(search) &&
        (!category || skill.category === category)
    );
  });

  usedCategories = computed(() => {
    const categories = new Set(this.currentSkills().map((skill) => skill.category));
    return Array.from(categories).sort();
  });

  hasChanges = computed(() => {
    const initial = this.initialSkills();
    const current = this.currentSkills();

    if (initial.length !== current.length) return true;

    return !initial.every((initSkill) =>
      current.some(
        (currSkill) => currSkill.name === initSkill.name && currSkill.level === initSkill.level
      )
    );
  });

  ngOnInit(): void {
    this.currentSkills.set([...this.initialSkills()]);
    this.loadAvailableSkills();
  }

  loadAvailableSkills(): void {
    this.isLoading.set(true);
    this.profileService.getAvailableSkills().subscribe({
      next: (skills) => {
        this.availableSkills.set(skills);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading available skills:', error);
        this.isLoading.set(false);
      },
    });
  }

  onSkillSelected(skill: Skill): void {
    if (skill && this.levelControl.value) {
      this.addSkill(skill.name, skill.category, this.levelControl.value);
      this.searchControl.setValue('');
    }
  }

  addCustomSkill(): void {
    const searchValue = this.searchControl.value?.trim();
    const category = this.categoryControl.value as SkillCategory;
    const level = this.levelControl.value;

    if (searchValue && category && level) {
      this.addSkill(searchValue, category, level);
      this.searchControl.setValue('');
    }
  }

  addSkill(name: string, category: SkillCategory, level: SkillLevel): void {
    const existing = this.currentSkills().find((s) => s.name.toLowerCase() === name.toLowerCase());

    if (!existing) {
      const newSkill: Skill = {
        id: `temp-${Date.now()}`,
        name,
        category,
        level,
        verified: false,
      };

      this.currentSkills.update((skills) => [...skills, newSkill]);
    }
  }

  removeSkill(skillToRemove: Skill): void {
    this.currentSkills.update((skills) =>
      skills.filter((skill) => skill.id !== skillToRemove.id && skill.name !== skillToRemove.name)
    );
  }

  updateSkillLevel(skill: Skill, newLevel: SkillLevel): void {
    this.currentSkills.update((skills) =>
      skills.map((s) =>
        s.id === skill.id || s.name === skill.name ? { ...s, level: newLevel } : s
      )
    );
  }

  getSkillsByCategory(category: SkillCategory): Skill[] {
    return this.currentSkills().filter((skill) => skill.category === category);
  }

  canAddSkill(): boolean {
    const searchValue = this.searchControl.value?.trim();
    const category = this.categoryControl.value;
    const level = this.levelControl.value;

    return !!(searchValue && category && level);
  }

  onSave(): void {
    if (this.hasChanges()) {
      this.skillsChanged.emit(this.currentSkills());
    }
  }

  formatCategory(category: SkillCategory): string {
    return category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formatLevel(level: SkillLevel): string {
    return level.charAt(0) + level.slice(1).toLowerCase();
  }

  getCategoryIcon(category: SkillCategory): string {
    const icons: Record<SkillCategory, string> = {
      [SkillCategory.TECHNICAL]: 'computer',
      [SkillCategory.COMMUNICATION]: 'chat',
      [SkillCategory.LEADERSHIP]: 'group',
      [SkillCategory.PHYSICAL]: 'fitness_center',
      [SkillCategory.CREATIVE]: 'palette',
      [SkillCategory.ADMINISTRATIVE]: 'business_center',
    };
    return icons[category] || 'lightbulb';
  }
}
