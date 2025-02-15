import type {
  ResumeSectionToLines,
  FeaturedSkill,
  ResumeSkills,
} from '../types';
import { getSectionLinesByKeywords } from '../extract-resume-from-sections/lib/get-section-lines';
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from '../extract-resume-from-sections/lib/bullet-points';

export const extractSkills = (sections: ResumeSectionToLines) => {
  const lines = getSectionLinesByKeywords(sections, ['skill']);
  const descriptionsLineIdx = getDescriptionsLineIdx(lines) ?? 0;
  const descriptionsLines = lines.slice(descriptionsLineIdx);
  const descriptions = getBulletPointsFromLines(descriptionsLines);

  const initialFeaturedSkill: FeaturedSkill = { skill: '', rating: 4 };
  const initialFeaturedSkills: FeaturedSkill[] = Array(6).fill({
    ...initialFeaturedSkill,
  });
  // Deep clone to avoid modifying the initialFeaturedSkills
  const featuredSkills = JSON.parse(JSON.stringify(initialFeaturedSkills));
  if (descriptionsLineIdx !== 0) {
    const featuredSkillsLines = lines.slice(0, descriptionsLineIdx);
    const featuredSkillsTextItems = featuredSkillsLines
      .flat()
      .filter((item) => item.text.trim())
      .slice(0, 6);
    for (let i = 0; i < featuredSkillsTextItems.length; i++) {
      featuredSkills[i].skill = featuredSkillsTextItems[i].text;
    }
  }

  const skills: ResumeSkills = {
    featuredSkills,
    descriptions,
  };

  return { skills };
};
