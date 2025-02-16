import { readPdf } from './read-pdf';
import { groupTextItemsIntoLines } from './group-text-items-into-lines';
import { groupLinesIntoSections } from './group-lines-into-sections';
import { extractResumeFromSections } from './extract-resume-from-sections';

/**
 * Resume parser util that parses a resume from a resume pdf file
 *
 * Note: The parser algorithm only works for single column resume in English language
 */
export const parseResumeFromPdf = async (fileBuffer: Buffer) => {
  // Step 1. Read a pdf resume file into text items to prepare for processing
  const textItems = await readPdf(fileBuffer);

  // Step 2. Group text items into lines
  const lines = groupTextItemsIntoLines(textItems);

  // Step 3. Group lines into sections
  const sections = groupLinesIntoSections(lines);

  // Step 4. Extract resume from sections
  const resume = extractResumeFromSections(sections);

  return resume;
};

export default parseResumeFromPdf;
