export enum PROJECT_TYPE {
  ACTIVE = "active",
  FINISHED = "finished",
}

interface IProject {
  id: number;
  title: string;
  description: string;
  people: number;
  status: PROJECT_TYPE;
}

export interface ValidateAble {
  value: string | number;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  max?: number;
  min?: number;
}

export default class Project implements IProject {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public people: number,
    public status: PROJECT_TYPE
  ) {}

  get peopleAssignedMessage(): string {
    return `${this.people} ${this.people > 1 ? "people" : "person"} assigned.`;
  }
}
