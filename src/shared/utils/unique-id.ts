let nanoid: any, generateOtp: any;

export const nanoIdAlphabet =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

import('nanoid')
  .then(({ customAlphabet }) => {
    nanoid = customAlphabet(nanoIdAlphabet);
    generateOtp = customAlphabet('0123456789', 4);
  })
  .catch((error) => {
    console.error('Error importing nanoid:', error);
  });

export const prefixes = {
  company: 'ck',
  companyProfile: 'cp',
  professionalProfile: 'pp',
  professional: 'pk',
  project: 'pj',
  projectRequest: 'pr',
  professionalEducation: 'pe',
  professionalExperience: 'px',
} as const;

export function newId(
  prefix: keyof typeof prefixes,
  length: number = 16,
): string {
  return [prefixes[prefix], nanoid(length)].join('_');
}

export function customUUID(length: number = 16): string {
  return nanoid(length);
}

export function generateUniqueOtp(): string {
  return generateOtp();
}
