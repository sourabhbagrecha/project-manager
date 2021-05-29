import AutoBind from "../decorators/AutoBind";
import Project, { PROJECT_TYPE, ValidateAble } from "../models/project";
import { store } from "../storage/store";
import { validateProject } from "../utils/validation";
import Component from "./base-component";

export default class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    inputElement: {
      title: HTMLInputElement;
      description: HTMLInputElement;
      people: HTMLInputElement;
    };
  
    constructor() {
      super("project-input", "app", "user-input", true)
  
      this.inputElement = {
        title: this.element.querySelector("#title")! as HTMLInputElement,
        description: this.element.querySelector(
          "#description"
        )! as HTMLInputElement,
        people: this.element.querySelector("#people")! as HTMLInputElement,
      };
  
      this.configure();
    }
  
    renderContent() {}
  
    configure() {
      this.element.addEventListener("submit", this.submitHandler);
    }
  
    private gatherUserInput(): [string, string, number] | void {
      const {
        title: { value: titleVal },
        description: { value: descriptionVal },
        people: { value: peopleVal },
      } = this.inputElement;
  
      const titleValidateable: ValidateAble = {
        value: titleVal,
        required: true,
        minLength: 3,
      };
      const descriptionValidateable: ValidateAble = {
        value: descriptionVal,
        required: true,
        minLength: 5,
      };
      const peopleValidateable: ValidateAble = {
        value: +peopleVal,
        required: true,
        min: 1,
        max: 10,
      };
  
      if (
        !validateProject(titleValidateable) ||
        !validateProject(descriptionValidateable) ||
        !validateProject(peopleValidateable)
      ) {
        alert("Invalid User Input");
        throw Error("Invalid User Input");
      }
  
      return [titleVal, descriptionVal, +peopleVal];
    }
  
    @AutoBind
    private submitHandler(e: Event) {
      e.preventDefault();
      const vals = this.gatherUserInput();
      if (vals) {
        const [title, description, people] = vals;
        store.addProject = new Project(
          (Math.random()*50000),
          title,
          description,
          people,
          PROJECT_TYPE.ACTIVE
        );
      }
    }
  }