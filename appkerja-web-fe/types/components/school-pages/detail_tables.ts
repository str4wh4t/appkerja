
type ProgressReport = {
    code: string;
    sub: string;
    grad: string;
    marks: string;
    remarks: string;
    statuscolor: string;
    remarkcolor: string;
    
};

type TeacherSkill = {
    code: string;
    sub: string;
    grad: string;
    marks: string;
    statuscolor: string;
};

type StudentProgressReport = {
    code: string;
    sub: string;
    grad: string;
    marks: string;
    remarks: string;
    statuscolor: string;
    remarkcolor: string;
    
};

export type { ProgressReport,TeacherSkill,StudentProgressReport};