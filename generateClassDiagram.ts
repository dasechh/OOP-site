// filepath: /c:/Users/kosar/OneDrive/Рабочий стол/volodin from zero/generateClassDiagram.ts
import { Project, StructureKind } from "ts-morph";
import * as fs from "fs";

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
});

const classes = project.getSourceFiles().flatMap((sourceFile) =>
  sourceFile.getClasses().map((cls) => ({
    name: cls.getName(),
    properties: cls.getProperties().map((prop) => ({
      name: prop.getName(),
      type: prop.getType().getText(),
      visibility: prop.getScope(),
    })),
    methods: cls.getMethods().map((method) => ({
      name: method.getName(),
      returnType: method.getReturnType().getText(),
      visibility: method.getScope(),
    })),
    extends: cls.getBaseClass()?.getName(),
    implements: cls.getImplements().map((impl) => impl.getText()),
  }))
);

const plantUmlContent = `
@startuml
${classes
  .map(
    (cls) => `
  class ${cls.name} ${cls.extends ? `extends ${cls.extends}` : ""} ${
      cls.implements.length > 0 ? `implements ${cls.implements.join(", ")}` : ""
    } {
    ${cls.properties
      .map((prop) => `${prop.visibility} ${prop.name}: ${prop.type}`)
      .join("\n")}
    ${cls.methods
      .map((method) => `${method.visibility} ${method.name}(): ${method.returnType}`)
      .join("\n")}
  }
`
  )
  .join("\n")}
@enduml
`;

fs.writeFileSync("classDiagram.puml", plantUmlContent);
console.log("PlantUML class diagram generated in classDiagram.puml");