import Component from './base-component';
import AutoBind from '../decorators/AutoBind';
import { Draggable } from '../models/drag-and-drop';
import Project from '../models/project';

export default class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    constructor(hostId: string, private project: Project) {
      super("single-project", hostId, project.id.toString(), false);
      this.configure();
      this.renderContent();
    }
  
    configure() {
      this.element.draggable = true;
      this.element.style.backgroundColor = "white";
      this.element.style.cursor = "move"
      this.element.addEventListener("dragstart", this.dragStartHandler);
    }
    
    @AutoBind
    dragStartHandler(event: DragEvent) {
      event.dataTransfer!.setData("text/plain", this.project.id.toString());
      event.dataTransfer!.effectAllowed = "move";
    }
  
    dragStopHandler() {
  
    }
  
    renderContent() {
      this.element.querySelector("h2")!.textContent = this.project.title;
      this.element.querySelector("h3")!.textContent = this.project.peopleAssignedMessage;
      this.element.querySelector("p")!.textContent = this.project.description;
    }
  }