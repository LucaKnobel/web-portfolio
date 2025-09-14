export type CareerEntry = {
    organizationName: string;
    organizationWebsite: string;
    title: string;
    employmentRate: string;
    period: { start: string; end: string };
    responsibilities: string[];
    keySkills: string[];
};

export type EducationEntry = {
    organizationName: string;
    organizationWebsite: string;
    title: string;
    studyMode: string;
    period: { start: string; end: string };
    keySkills: string[];
    finalGrade?: number | string;
};