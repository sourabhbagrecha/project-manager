enum PROJECT_TYPE {
  ACTIVE = "active",
  FINISHED = "finished",
}

interface IProject {
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
    public title: string,
    public description: string,
    public people: number,
    public status: PROJECT_TYPE
  ) {}
}

type Listener = (items: Project[]) => void;

class ProjectStorage {
  private projects: Project[];
  private listeners: Listener[] = [];
  private static instance: ProjectStorage;
  private constructor() {
    this.projects = [];
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    return (this.instance = new ProjectStorage());
  }

  addListener(fn: Listener) {
    this.listeners.push(fn);
  }

  get getProjects() {
    return this.projects;
  }

  set addProject(project: Project) {
    this.projects.push(project);
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
      isValid && validateAbleInput.value.length > validateAbleInput.minLength;
  }
  if (
    validateAbleInput.maxLength != null &&
    typeof validateAbleInput.value === "string"
  ) {
    isValid =
      isValid && validateAbleInput.value.length < validateAbleInput.maxLength;
  }
  if (
    validateAbleInput.min != null &&
    typeof validateAbleInput.value === "number"
  ) {
    isValid = isValid && validateAbleInput.value > validateAbleInput.min;
  }
  if (
    validateAbleInput.max != null &&
    typeof validateAbleInput.value === "number"
  ) {
    isValid = isValid && validateAbleInput.value < validateAbleInput.max;
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

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[] = [];

  constructor(private type: PROJECT_TYPE) {
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild! as HTMLFormElement;
    this.element.id = `${this.type}-projects`;

    this.attach();
    this.renderContent();
    store.addListener((projects: Project[]) => {
      this.assignedProjects = projects.filter((p) => p.status === this.type);
      this.renderProjects();
    });
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)!;
    listEl.innerHTML = "";
    for (let prjItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl!.appendChild(listItem);
    }
  }
}

class ProjectItem {
  constructor() {}
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement; // where we want to show the actual content.
  element: HTMLFormElement;
  inputElement: {
    title: HTMLInputElement;
    description: HTMLInputElement;
    people: HTMLInputElement;
  };

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild! as HTMLFormElement;
    this.element.id = "user-input";

    this.inputElement = {
      title: this.element.querySelector("#title")! as HTMLInputElement,
      description: this.element.querySelector(
        "#description"
      )! as HTMLInputElement,
      people: this.element.querySelector("#people")! as HTMLInputElement,
    };

    this.configure();
    this.attach();
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }

  private configure() {
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
