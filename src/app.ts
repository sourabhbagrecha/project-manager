interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragStopHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum PROJECT_TYPE {
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

interface ValidateAble {
  value: string | number;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  max?: number;
  min?: number;
}

class Project implements IProject {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public people: number,
    public status: PROJECT_TYPE
  ) {}

  get peopleAssignedMessage(): string {
    return `${this.people} ${this.people > 1 ? "people" : "person"} assigned.`
  }
}

type Listener<T> = (items: T[]) => void;

class CStorage<T> {
  protected listeners: Listener<T>[] = [];

  addListener(fn: Listener<T>) {
    this.listeners.push(fn);
  }
}

class ProjectStorage extends CStorage<Project> {
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

const store = ProjectStorage.getInstance();

function validate(validateAbleInput: ValidateAble): boolean {
  let isValid = true;
  if (validateAbleInput.required) {
    isValid = isValid && validateAbleInput.value.toString().trim().length !== 0;
  }
  if (
    validateAbleInput.minLength != null &&
    typeof validateAbleInput.value === "string"
  ) {
    isValid =
      isValid && validateAbleInput.value.length >= validateAbleInput.minLength;
  }
  if (
    validateAbleInput.maxLength != null &&
    typeof validateAbleInput.value === "string"
  ) {
    isValid =
      isValid && validateAbleInput.value.length <= validateAbleInput.maxLength;
  }
  if (
    validateAbleInput.min != null &&
    typeof validateAbleInput.value === "number"
  ) {
    isValid = isValid && validateAbleInput.value >= validateAbleInput.min;
  }
  if (
    validateAbleInput.max != null &&
    typeof validateAbleInput.value === "number"
  ) {
    isValid = isValid && validateAbleInput.value <= validateAbleInput.max;
  }
  return isValid;
}

function AutoBind(
  _target: any,
  _property: string,
  descriptor: PropertyDescriptor
) {
  const ogMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = ogMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    newElementId?: string,
    insertAtStart?: boolean,
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild! as U;
    this.element.id = `${newElementId}`;

    this.attach(insertAtStart ?? true);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  constructor(hostId: string, private project: Project) {
    super("single-project", hostId, project.id.toString(), false);
    this.configure();
    this.renderContent();
  }

  configure() {
    this.element.draggable = true;
    this.element.style.backgroundColor = "white";
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
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
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
  dragLeaveHandler(event: DragEvent) {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove("droppable");
  }
}



class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
      !validate(titleValidateable) ||
      !validate(descriptionValidateable) ||
      !validate(peopleValidateable)
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

const pi = new ProjectInput();

const activeProjectList = new ProjectList(PROJECT_TYPE.ACTIVE);
const finishedProjectList = new ProjectList(PROJECT_TYPE.FINISHED);
