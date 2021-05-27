import ProjectInput from "./components/project-input.js";
import ProjectList from "./components/project-list.js";
import { PROJECT_TYPE } from "./models/project.js";

const pi = new ProjectInput();

const activeProjectList = new ProjectList(PROJECT_TYPE.ACTIVE);
const finishedProjectList = new ProjectList(PROJECT_TYPE.FINISHED);

console.log(pi, activeProjectList, finishedProjectList)
