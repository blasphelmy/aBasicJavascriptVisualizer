window.addEventListener("load", () => {
  initElements();
  run();
});

let runBtn;
let codeEditor;
let exampleInput;
let inputSection;
let inputString;
let outputSection;
let instructions;
let globalScope;

function initElements() {
  // Set elements
  runBtn = document.getElementById("runBtn");
  codeEditor = CodeMirror(document.getElementById("codeEditor"), {
    mode: "javascript",
    theme: "abcdef",
    tabSize: "4",
    lineNumbers: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
    lineWrapping: true,
    lineWiseCutCopy: true,
    autofocus: true,
  });
  exampleInput =
    "var global0 = 0;\nvar global1 = 0;\nvar global2 = 0;\n\nfunction changeGlobal() {\n\tglobal0 = 10;\n}\n\nfunction innerReassignment() {\n\tvar twoNum0 = 0;\n\ttwoNum0 = 2;\n}\n\nfunction containedScope() {\n\tvar containedNum = 0;\n\n\tfunction innerChangeGlobal() {\n\t\tglobal1 = 15;\n\t}\n\n\tinnerChangeGlobal();\n}\n\nglobal1 = 5;\nchangeGlobal();\ninnerReassignment();\ncontainedScope();";
  // Back tics
  codeEditor.doc.setValue(exampleInput);
  outputSection = document.getElementById("outputSection");

  // Add listeners
  runBtn.addEventListener("click", run, false);
}

function run() {
  inputString = codeEditor.getValue();
  instructions = parseInstructions(inputString);
  globalScope = new Scope("Global");
  buildScope(globalScope, instructions);
}

function parseInstructions(inputString) {
  // Split into lines
  let lines = inputString.split(/\n+/);

  // Trim exterior spaces/tabs
  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].trim();
  }

  // Remove empty lines ("")
  lines = lines.filter((ex) => ex != "");

  // Split lines into 'words' (individual instructions)
  let words = [];
  let delimiters = [" ", "=", ",", ";", "(", ")", "{", "}"];

  lines.forEach((line) => {
    let foot = 0;
    for (let i = 0; i <= line.length; i++) {
      if (delimiters.includes(line[i])) {
        if (i > foot) {
          let word = line.slice(foot, i);
          words.push(word);
        }
        if (line[i] != " ") {
          words.push(line[i]);
        }
        foot = i + 1;
      }
    }
  });

  // Remove instructions of empty space. May be redundant at this point
  words = words.filter((word) => word != " ");
  words = words.filter((word) => word != "");

  return words;
}

function buildScope(scope, instructions) {
  let variableKeywords = ["var", "let", "const"];
  for (let i = 0; i < instructions.length; i++) {
    // Parse Variable Declarations
    if (variableKeywords.includes(instructions[i])) {
      let newVariable = new Variable(instructions[i]);
      i++;
      newVariable.name = instructions[i];
      i++;
      if (instructions[i] == "=") i++;
      else {
        console.log("Expected assignment");
        return;
      }
      newVariable.value = instructions[i];
      scope.variables.push(newVariable);
    }

    // Store Function Instructions
    if (instructions[i] == "function") {
      // Get function name
      i++;
      let functionName = instructions[i];
      i++;

      // Check for parameters
      let inputParameters = [];
      if (instructions[i] == "(") i++;
      while (instructions[i] != ")") {
        inputParameters.push(instructions[i]);
        i++;
        if (instructions[i] == ",") i++;
      }

      if (instructions[i] == ")") i++;

      // Create new function
      if (instructions[i] == "{") {
        let newFunction = new Function(functionName);
        newFunction.scope = scope;
        if (inputParameters) {
          newFunction.inputParameters = inputParameters;
        }
        i++;
        newFunction.start = i;
        // Increment i until closing bracket, to finish building current frame
        let leftTracker = 1;
        let rightTracker = 0;

        while (leftTracker > rightTracker && i < instructions.length) {
          if (instructions[i] == "{") leftTracker++;
          if (instructions[i] == "}") rightTracker++;
          i++;
        }
        i--;
        newFunction.end = i - 1; // Right before closing bracket
        scope.functions.push(newFunction);
      }
    }

    // Add Variable Calls and Function Calls to Execution Queue
    scope.variables.forEach((variable) => {
      // Reassigns Variable Value
      if (instructions[i] == variable.name) {
        i++;
        if (instructions[i] == "=") i++;
        variable.value = instructions[i];
      }
    });

    scope.functions.forEach((fn) => {
      if (instructions[i] == fn.name) {
        i++;
        if (instructions[i] == "(") i++;
        if (instructions[i] == ")") {
          scope.executionQueue.push(fn);
        }
      }
    });
  }

  console.log(scope);
}

function executeQueue({ executionQueue }) {
  console.log("Executing functions: ");

  while (executionQueue.length) {
    let fn = executionQueue.shift();
    let subInstructions = instructions.slice(fn.start, fn.end + 1);
    let newScope = new Scope(fn.name);
    buildScope(newScope, subInstructions);
    totalScopeFrames.push(newScope);
  }

  console.log(totalScopeFrames);
}

// function createFrames() {
//   totalFrames = [];
//   globalFrame = new Frame("Global");
//   let startReadingFrom = 0;
//   globalFrame = fillFrame(globalFrame, startReadingFrom);
// }

// function fillFrame(frame, startReadingFrom) {
//   // Where does global frame get pushed to frames?

//   let variableKeywords = ["var", "let", "const"];

//   for (let i = startReadingFrom; i < instructions.length; i++) {
//     // Return Global frame
//     if (i == instructions.length - 1) return frame;

//     // Continue if semicolon ;
//     if (instructions[i] == ";") {
//       i++;
//     }

//     // Push frame at closing brace }
//     if (instructions[i] == "}") {
//       totalFrames.push(frame);
//       return frame;
//     }

//     // Parse Variable Declarations
//     if (variableKeywords.includes(instructions[i])) {
//       let newVariable = new Variable(instructions[i]);
//       i++;
//       newVariable.name = instructions[i];
//       i++;
//       if (instructions[i] == "=") i++;
//       else {
//         console.log("Expected assignment");
//         return;
//       }
//       newVariable.value = instructions[i];
//       frame.variables.push(newVariable);
//     }

//     // Parse Function Declarations
//     if (instructions[i] == "function") {
//       // Get function name
//       i++;
//       let functionName = instructions[i];
//       i++;

//       // Check for parameters
//       let inputParameters = [];
//       if (instructions[i] == "(") i++;
//       while (instructions[i] != ")") {
//         inputParameters.push(instructions[i]);
//         i++;
//         if (instructions[i] == ",") i++;
//       }

//       if (instructions[i] == ")") i++;

//       // Create new frame
//       if (instructions[i] == "{") {
//         let childFrame = new Frame(functionName);
//         childFrame.parent = frame;
//         if (inputParameters) {
//           childFrame.inputParameters = inputParameters;
//         }
//         i++;
//         frame.children.push(fillFrame(childFrame, i));
//         // Increment i until closing bracket, to finish building current frame
//         let leftTracker = 1;
//         let rightTracker = 0;

//         while (leftTracker > rightTracker && i < instructions.length) {
//           if (instructions[i] == "{") leftTracker++;
//           if (instructions[i] == "}") rightTracker++;
//           i++;
//         }
//       }
//     }

//     // Check Variable Call
//     if (frame.variables.includes(instructions[i])) {
//       console.log(instructions[i]);
//     } else if (frame.parent) {
//       if (frame.parent.variables.includes(instructions[i])) {
//         console.log(instructions[i]);
//       }
//     }

//     // Check Function Call

//     // Create frame upon function call
//   }
// }

class Variable {
  type;
  name;
  value;

  constructor(type) {
    this.type = type;
  }
}

// Function class
// Name
// StartLine
// Parent

class Function {
  name;
  inputParameters = [];
  scope;
  start;
  end;

  constructor(name) {
    this.name = name;
  }
}

class Scope {
  name;
  inputParameters = [];
  parent;
  variables = [];
  functions = [];
  executionQueue = [];

  constructor(name) {
    this.name = name;
  }
}

// function displayFrames() {
//   outputSection.innerHTML = "";

//   globalSummary = createSummary(globalFrame);
//   globalSummary.open = true;
//   outputSection.appendChild(globalSummary);

//   // Display to console
//   //console.clear();
//   //console.log(instructions);
//   //console.log(globalFrame);
//   //console.log(totalFrames);
//   //console.log(callStack);

//   function createSummary(frame) {
//     let details = document.createElement("details");
//     let summary = document.createElement("summary");
//     let content = document.createElement("div");

//     // ID
//     summary.innerHTML = frame.name;
//     details.appendChild(summary);

//     // Parent
//     let parent = document.createElement("div");
//     if (frame.name == "Global") parent.innerHTML = "Parent: undefined";
//     else parent.innerHTML = "Parent: " + frame.parent.name;
//     content.appendChild(parent);

//     // Variables
//     let localVariables = document.createElement("div");

//     let variablesTitle = document.createElement("div");
//     variablesTitle.innerHTML = "Variables: ";
//     localVariables.appendChild(variablesTitle);

//     frame.variables.forEach((variable) => {
//       let variableSummary = document.createElement("ul");
//       let li = document.createElement("li");

//       li.innerHTML =
//         "Type: " +
//         variable.type +
//         " Name: " +
//         variable.name +
//         " Value: " +
//         variable.value;

//       variableSummary.appendChild(li);

//       localVariables.appendChild(variableSummary);
//     });

//     content.appendChild(localVariables);

//     // Children
//     let frameChildren = document.createElement("div");

//     let childrenTitle = document.createElement("div");
//     childrenTitle.innerHTML = "Children: ";
//     frameChildren.appendChild(childrenTitle);

//     frame.children.forEach((child) => {
//       frameChildren.appendChild(createSummary(child));
//     });

//     content.appendChild(frameChildren);

//     // Set style
//     content.style.padding = "5px 20px";
//     details.style.padding = "0px 10px";
//     details.appendChild(content);

//     return details;
//   }
// }
