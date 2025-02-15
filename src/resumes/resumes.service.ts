import { parseResumeFromPdf } from '@/resume-parser';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResumesService {
  async parseResume(fileBuffer: Buffer) {
    const parsedResume = await parseResumeFromPdf(fileBuffer);
    return parsedResume;
  }
}
