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
let globalFrame;
let totalFrames;
let callStack = [];

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
    "var globalNum0 = 0;\nvar globalNum1 = 0;\n\nfunction fn1 (param1) {\n\tvar oneDeepNum0 = 1;\n}\n\nfunction fn2 () {\n\tvar oneDeepNum1 = 1;\n\tfunction fn3 () {\n\t\tvar twoDeepNum0 = 2;\n\t}\n}\n\nglobalNum1 = 5;\n\noneLvlFunc0();\noneLvlFunc1();";
  // Back tics
  codeEditor.doc.setValue(exampleInput);
  outputSection = document.getElementById("outputSection");

  // Add listeners
  runBtn.addEventListener("click", run, false);
}

function run() {
  inputString = codeEditor.getValue();
  instructions = parseInstructions(inputString);
  createFrames();
  displayFrames();
  console.log(instructions);
  console.log(globalFrame);
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

function createFrames() {
  totalFrames = [];
  globalFrame = new Frame("Global");
  let startReadingFrom = 0;
  globalFrame = fillFrame(globalFrame, startReadingFrom);
}

function fillFrame(frame, startReadingFrom) {
  // Where does global frame get pushed to frames?

  let variableKeywords = ["var", "let", "const"];

  for (let i = startReadingFrom; i < instructions.length; i++) {
    // Return Global frame
    if (i == instructions.length - 1) return frame;

    // Continue if semicolon ;
    if (instructions[i] == ";") {
      i++;
    }

    // Push frame at closing brace }
    // Currently is pushing global frame before reaching end of instructions
    if (instructions[i] == "}") {
      totalFrames.push(frame);
      return frame;
    }

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
      frame.variables.push(newVariable);
      i++;
    }

    // Parse Function Declarations
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

      // Create new frame
      if (instructions[i] == "{") {
        let childFrame = new Frame(functionName);
        childFrame.parent = frame;
        if (inputParameters) {
          childFrame.inputParameters = inputParameters;
        }
        i++;
        frame.children.push(fillFrame(childFrame, i));
        // Increment i until closing bracket, to finish building current frame
        while (instructions[i] != "}" && i < instructions.length) {
          i++;
        }
      }
    }

    // Check Variable Call
    if (frame.variables.includes(instructions[i])) {
      console.log(instructions[i]);
    } else if (frame.parent) {
      if (frame.parent.variables.includes(instructions[i])) {
        console.log(instructions[i]);
      }
    }

    // Check Function Call

    // Create frame upon function call
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

// Function class
// Name
// StartLine
// Parent

class Frame {
  name;
  inputParameters = [];
  parent;
  variables = [];
  // functions
  children = [];

  constructor(name) {
    this.name = name;
  }
}

function displayFrames() {
  outputSection.innerHTML = "";

  globalSummary = createSummary(globalFrame);
  globalSummary.open = true;
  outputSection.appendChild(globalSummary);

  // Display to console
  //console.clear();
  //console.log(instructions);
  //console.log(globalFrame);
  //console.log(totalFrames);
  //console.log(callStack);

  function createSummary(frame) {
    let details = document.createElement("details");
    let summary = document.createElement("summary");
    let content = document.createElement("div");

    // ID
    summary.innerHTML = frame.name;
    details.appendChild(summary);

    // Parent
    let parent = document.createElement("div");
    if (frame.name == "Global") parent.innerHTML = "Parent: undefined";
    else parent.innerHTML = "Parent: " + frame.parent.name;
    content.appendChild(parent);

    // Variables
    let localVariables = document.createElement("div");

    let variablesTitle = document.createElement("div");
    variablesTitle.innerHTML = "Variables: ";
    localVariables.appendChild(variablesTitle);

    frame.variables.forEach((variable) => {
      let variableSummary = document.createElement("ul");
      let li = document.createElement("li");

      li.innerHTML =
        "Type: " +
        variable.type +
        " Name: " +
        variable.name +
        " Value: " +
        variable.value;

      variableSummary.appendChild(li);

      localVariables.appendChild(variableSummary);
    });

    content.appendChild(localVariables);

    // Children
    let frameChildren = document.createElement("div");

    let childrenTitle = document.createElement("div");
    childrenTitle.innerHTML = "Children: ";
    frameChildren.appendChild(childrenTitle);

    frame.children.forEach((child) => {
      frameChildren.appendChild(createSummary(child));
    });

    content.appendChild(frameChildren);

    // Set style
    content.style.padding = "5px 20px";
    details.style.padding = "0px 10px";
    details.appendChild(content);

    return details;
  }
}
