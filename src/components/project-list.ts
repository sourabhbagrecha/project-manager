import Component from "./base-component.js";
import ProjectItem from "./project-item.js";
import AutoBind from "../decorators/AutoBind.js";
import { DragTarget } from "../models/drag-and-drop.js";
import { store } from "../storage/store.js";
import Project, { PROJECT_TYPE } from "../models/project.js";

export default class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
    assignedProjects: Project[] = [];
  
    constructor(private type: PROJECT_TYPE) {
      super("project-list", "app", `${type}-projects`, false)
      this.renderContent();
      this.configure();
    }
  
    renderContent() {
      const listId = `${this.type}-projects-list`;
      this.element.querySelector("ul")!.id = listId;
      this.element.querySelector("h2")!.textContent =
        this.type?.toUpperCase() + " PROJECTS";
    }
  
    private renderProjects() {
      const listEl = document.getElementById(`${this.type}-projects-list`)!;
      listEl.innerHTML = "";
      for (let prjItem of this.assignedProjects) {
        new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
      }
    }
  
    configure() {
      this.element.addEventListener("dragover", this.dragOverHandler);
      this.element.addEventListener("drop", this.dropHandler)
      this.element.addEventListener("dragleave", this.dragLeaveHandler);
  
      store.addListener((projects: Project[]) => {
        this.assignedProjects = projects.filter((p) => p.status === this.type);
        this.renderProjects();
      });
    }
  
    @AutoBind
    dragOverHandler(event: DragEvent) {
      if(event.dataTransfer?.types[0] === "text/plain"){
        event.preventDefault();
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.add("droppable");
      }
    }
  
    @AutoBind
    dropHandler(event: DragEvent) {
      store.setProjectStatus(event.dataTransfer!.getData("text/plain"), this.type);
    }
    
    @AutoBind
    dragLeaveHandler(_: DragEvent) {
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.remove("droppable");
    }
  }