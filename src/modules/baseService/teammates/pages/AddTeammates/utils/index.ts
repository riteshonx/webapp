import * as yup from "yup";

export interface Data {
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  systemRole: string;
  companies: Array<number>;
  projects: Array<any>;
  deleteIcon?: any;
}

function createData(
  email: string,
  firstName: string,
  lastName: string,
  jobTitle: string,
  systemRole: string,
  companies: Array<number>,
  projects: Array<any>
): Data {
  return {
    email,
    firstName,
    lastName,
    jobTitle,
    systemRole,
    companies,
    projects,
  };
}

export type Order = "asc" | "desc";

interface HeadCell {
  id: keyof Data;
  label: string;
  required: boolean;
}

export const headCells: HeadCell[] = [
  {
    id: "email",
    label: "Email",
    required: true,
  },
  {
    id: "firstName",
    label: "First Name",
    required: true,
  },
  {
    id: "lastName",
    label: "Last Name",
    required: true,
  },

  {
    id: "jobTitle",
    label: "Job Title",
    required: false,
  },
  {
    id: "systemRole",
    label: "Slate Role",
    required: true,
  },
  {
    id: "companies",
    label: "Company",
    required: true,
  },
  {
    id: "projects",
    label: "Project (Project Role)",
    required: false,
  },
  {
    id: "deleteIcon",
    label: "",
    required: false,
  },
];

export const generateNValuedArray = (n: number) => {
  return Array.from(Array(n).keys());
};

export const generateNOrderedEmptyArrayObject = (n: number) => {
  const arr = Array(n).fill([]);
  const obj: any = {};
  for (const [key, value] of Object.entries(arr)) {
    obj[key] = value;
  }
  return obj;
};

export const generateNEmptyRows = (
  n: number,
  companyId: number,
  projectId: number
): any => {
  const companyIdValue = companyId ? [companyId] : [];
  const projectIdValue = projectId ? [projectId] : [];
  return Array(n).fill(
    createData("", "", "", "", "", companyIdValue, projectIdValue)
  );
};

declare module "yup" {
  interface ArraySchema<T> {
    unique(message: any, mapper: (a: T) => T): ArraySchema<T>;
  }
}

yup.addMethod(yup.array, "unique", function (message, mapper = (a: any) => a) {
  return this.test("unique", message, (list: any) => {
    const isDuplicate = list.length === new Set(list.map(mapper)).size;
    return isDuplicate;
  });
});

export const validationSchema = yup.object().shape({
  inviteUsers: yup.array().of(
    yup
      .object()
      .shape({
        email: yup
          .string()
          .email("Please enter a valid email address")
          .required("Email is required"),
        firstName: yup.string().trim().required("Enter first name"),
        lastName: yup.string().trim().required("Enter last name"),
        systemRole: yup.string().required("Please select a role"),
        companies: yup.array().of(yup.string()).min(1, "Select a company"),
        projects: yup.array().min(1, "Select a project")
      })
      .test(
        "unique",
        "Email must be unique",
        function validateUnique(currentPerson) {
          const otherPeople = this.parent.filter(
            (person: any) => person !== currentPerson
          );

          const isDuplicate = otherPeople.some(
            (otherPerson: any) => otherPerson.email === currentPerson.email
          );
          return isDuplicate
            ? this.createError({ path: `${this.path}.email` })
            : true;
        }
      )
  ),
});
