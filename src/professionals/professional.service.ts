import parseResumeFromPdf from '@/shared/resume-parser';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfessionalsService {
async parseResume(fileBuffer: Buffer) {
  const parsedResume = await parseResumeFromPdf(fileBuffer);
  return parsedResume;
  }
}
