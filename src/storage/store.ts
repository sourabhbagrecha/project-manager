import Project, { PROJECT_TYPE } from "../models/project.js";
import { CStorage } from "../models/storage.js";

export class ProjectStorage extends CStorage<Project> {
    private projects: Project[];
    private static instance: ProjectStorage;
    private constructor() {
      super();
      this.projects = [];
    }
  
    static getInstance() {
      if (this.instance) {
        return this.instance;
      }
      return (this.instance = new ProjectStorage());
    }
  
    get getProjects() {
      return this.projects;
    }
  
    set addProject(project: Project) {
      this.projects.push(project);
      this.updateListeners();
    }
  
    setProjectStatus(id: string, status: PROJECT_TYPE) {
      const project = this.projects.find(p => p.id === parseFloat(id));
      if(project && project.status !== status) {
        project!.status = status;
        this.updateListeners();
      }
    }
  
    updateListeners() {
      for (let listenerFunction of this.listeners) {
        listenerFunction(this.projects.slice());
      }
    }
  }
  
export const store = ProjectStorage.getInstance();
  