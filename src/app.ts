import ProjectInput from "./components/project-input";
import ProjectList from "./components/project-list";
import { PROJECT_TYPE } from "./models/project";

new ProjectInput();

new ProjectList(PROJECT_TYPE.ACTIVE);
new ProjectList(PROJECT_TYPE.FINISHED);
