window.addEventListener("load", () => {
  initElements();
});

let runBtn;
let codeEditor;
let exampleInput;
let inputSection;
let inputString;
let frameOutput;
let instructions;
let globalFrame;
let totalFrames = [];

function initElements() {
  // Set elements
  runBtn = document.getElementById("runBtn");
  codeEditor = CodeMirror(document.getElementById("codeEditor"), {
    mode: "javascript",
    theme: "abcdef",
    tabSize: "2",
    lineNumbers: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
    lineWrapping: true,
    lineWiseCutCopy: true,
    autofocus: true,
  });
  exampleInput =
    "var global0 = 0;\nvar global1 = 0;\nvar global2 = 0;\n\nfunction changeGlobal() {\n\tglobal0 = 10;\n}\n\nfunction innerReassignment() {\n\tvar twoNum = 0;\n\ttwoNum = 2;\n}\n\nfunction containedScope() {\n\tvar containedNum = 0;\n\n\tfunction innerChangeGlobal() {\n\t\tglobal1 = 15;\n\t}\n\n\tinnerChangeGlobal();\n}\n\nglobal1 = 5;\nchangeGlobal();\ninnerReassignment();\ncontainedScope();";
  // Possible to use back tics for example input?
  codeEditor.doc.setValue(exampleInput);
  frameOutput = document.getElementById("frameOutput");

  // Add listeners
  runBtn.addEventListener("click", run, false);
}

function run() {
  totalFrames = [];
  inputString = codeEditor.getValue();
  instructions = parseInstructions(inputString);
  globalFrame = new Frame("Global");
  totalFrames.push(globalFrame);
  let startReadingFrom = 0;
  let endReadingAt = instructions.length;
  buildFrames(globalFrame, startReadingFrom, endReadingAt);
  display(totalFrames);
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

function buildFrames(frame, startReadingFrom, endReadingAt) {
  let variableKeywords = ["var", "let", "const"];

  readInstructionsLoop: for (let i = startReadingFrom; i < endReadingAt; i++) {
    // Case: Semicolon
    if (instructions[i] == ";") {
      continue;
    }

    // Case: Variable Declarations
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
      frame.variables.push(newVariable);
      continue;
    }

    // Case: Function Declarations
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
        newFunction.scope = frame;
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
        newFunction.end = i - 1;
        frame.functions.push(newFunction);
      }
      continue;
    }

    // Case: Variable Reassignment in Local Scope
    if (frame.variables) {
      let variableReassigned = false;
      frame.variables.forEach((variable) => {
        if (instructions[i] == variable.name) {
          // Reassign Variable Value
          i++;
          if (instructions[i] == "=") i++;
          variable.value = instructions[i];
          variableReassigned = true;
        }
      });
      if (variableReassigned) continue;
    }

    // Case: Variable Reassignment in Parent Scope - Look to Parent for Variable
    let parentFrame = frame.parent;
    if (parentFrame) {
      let variableAssigned = false;
      while (parentFrame && !variableAssigned) {
        if (parentFrame.variables) {
          parentFrame.variables.forEach((variable) => {
            if (instructions[i] == variable.name) {
              // Reassign Variable Value
              i++;
              if (instructions[i] == "=") i++;
              variable.value = instructions[i];
              variableAssigned = true;
            }
          });
          parentFrame = parentFrame.parent;
        }
      }

      if (!variableAssigned) {
        let newVariable = new Variable("var");
        if (instructions[i + 1] == "=") {
          newVariable.name = instructions[i];
          i++;
          i++;
          newVariable.value = instructions[i];
          globalFrame.variables.push(newVariable);
          variableAssigned = true;
        }
      }

      if (variableAssigned) continue;
    }

    // Case: Function Call in Local Scope - Build new frame
    if (frame.functions) {
      let functionCalled = false;
      frame.functions.forEach((fn) => {
        if (functionCalled) {
          return;
        }
        if (instructions[i] == fn.name) {
          //Must execute fn.name
          let newFrame = new Frame(fn.name + ": " + fn.numberOfCalls++);
          i++;
          // Check for parameters
          let inputParameters = [];
          if (instructions[i] == "(") i++;
          while (instructions[i] != ")") {
            inputParameters.push(instructions[i]);
            i++;
            if (instructions[i] == ",") i++;
          }

          newFrame.parent = frame;
          buildFrames(newFrame, fn.start, fn.end);
          totalFrames.push(newFrame);
          functionCalled = true;
        }
      });
      if (functionCalled) continue;
    }

    // Case: Function Call in Parent Scope - Build new frame
    parentFrame = frame.parent;
    let functionCalled = false;
    while (parentFrame && !functionCalled) {
      if (parentFrame.functions) {
        parentFrame.functions.forEach((fn) => {
          if (instructions[i] == fn.name) {
            //Must execute fn.name
            let newFrame = new Frame(fn.name + ": " + fn.numberOfCalls++);
            i++;
            // Check for parameters
            let inputParameters = [];
            if (instructions[i] == "(") i++;
            while (instructions[i] != ")") {
              inputParameters.push(instructions[i]);
              i++;
              if (instructions[i] == ",") i++;
            }

            newFrame.parent = frame;
            buildFrames(newFrame, fn.start, fn.end);
            totalFrames.push(newFrame);
            functionCalled = true;
          }
        });
        parentFrame = parentFrame.parent;
      }
      if (functionCalled) continue;
    }
  }
}

class Variable {
  type;
  name;
  value;

  constructor(type) {
    this.type = type;
  }
}

class Function {
  name;
  inputParameters = [];
  scope;
  start;
  end;
  numberOfCalls = 0;

  constructor(name) {
    this.name = name;
  }
}

class Frame {
  name;
  parent;
  variables = [];
  functions = [];

  constructor(name) {
    this.name = name;
  }
}

function display(frames) {
  frameOutput.innerHTML = "";

  if (frames) {
    frames.forEach((frame) => {
      frameOutput.appendChild(createSummary(frame));
    });
  }

  function createSummary(frame) {
    let details = document.createElement("details");
    let summary = document.createElement("summary");
    let content = document.createElement("div");

    // ID
    summary.innerHTML = frame.name;
    details.appendChild(summary);

    // Parent
    let frameParent = document.createElement("div");
    if (frame.parent) frameParent.innerHTML = "Parent: " + frame.parent.name;
    else frameParent.innerHTML = "Parent: Undefined";
    content.appendChild(frameParent);

    // Variables
    let localVariables = document.createElement("div");

    let variablesTitle = document.createElement("div");
    variablesTitle.innerHTML = "Variables: ";
    localVariables.appendChild(variablesTitle);
    let variableSummary = document.createElement("ul");

    if (frame.variables) {
      frame.variables.forEach((variable) => {
        let li = document.createElement("li");

        li.innerHTML =
          variable.type + " " + variable.name + ": " + variable.value;

        variableSummary.appendChild(li);

        localVariables.appendChild(variableSummary);
      });
    }

    content.appendChild(localVariables);

    // Functions
    let frameFunctions = document.createElement("div");

    let functionTitle = document.createElement("div");
    functionTitle.innerHTML = "Functions: ";
    frameFunctions.appendChild(functionTitle);

    let functionsSummary = document.createElement("ul");

    if (frame.functions) {
      frame.functions.forEach((fn) => {
        let functionName = document.createElement("li");
        functionName.innerHTML = fn.name;
        functionsSummary.appendChild(functionName);
      });
    }
    frameFunctions.appendChild(functionsSummary);
    content.appendChild(frameFunctions);

    // Set style
    content.style.padding = "5px 20px";
    details.style.padding = "0px 10px";
    details.appendChild(content);

    return details;
  }
}
