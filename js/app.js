window.addEventListener("load", () => {
  appMain();
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

function appMain() {
  initElements();
  run();

  console.log(instructions);
  console.log(globalFrame);
  console.log(totalFrames);
  console.log(callStack);
}

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
    "var globalNum0 = 0;\nvar globalNum1 = 0;\n\nfunction oneLvlFunc0 () {\n\tvar oneDeepNum0 = 1;\n}\n\nfunction oneLvlFunc1 () {\n\tvar oneDeepNum1 = 1;\n\tfunction twoLvlFunc0 () {\n\t\tvar twoDeepNum0 = 2;\n\t}\n}\n\noneLvlFunc0();\noneLvlFunc1();";
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
      if (
        delimiters.includes(line[i]) ||
        (i == line.length && delimiters.includes(line[foot]))
      ) {
        let word = line.slice(foot, i);
        if (word != " ") words.push(word.trim());
        foot = i;
      }

      // Note: 'i' will go past last index
      // Second if() condition will recognize this situation
      // .slice() will capture the last char if it is a delimiter.
      // Example: slice(16, 17) captures last char of 16 index long line.
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
    if (instructions[i] == "}") {
      totalFrames.push(frame);
      return frame;
    }

    // Parse Variable (In local scope)
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
    }

    // Parse Function
    if (instructions[i] == "function") {
      // Get function name
      i++;
      let functionName = instructions[i];
      i++;

      // Check for parameters
      if (instructions[i] == "(") i++;
      let parameters = [];
      while (instructions[i] != ")") {
        parameters.push(instructions[i]);
        i++;
        if (instructions[i] == ",") i++;
      }

      if (instructions[i] == ")") i++;

      // Function declaration - Create new frame
      if (instructions[i] == "{") {
        let childFrame = new Frame(functionName); // Id = function name
        childFrame.parent = frame;
        i++;
        frame.children.push(fillFrame(childFrame, i));
        // Increment i until closing bracket, to finish building current frame
        while (instructions[i] != "}" && i < instructions.length) {
          i++;
        }
      }
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

class Frame {
  name;
  parent;
  variables;
  children;
  callStack;

  constructor(name) {
    this.name = name;
    this.variables = [];
    this.children = [];
  }
}

function displayFrames() {
  outputSection.innerHTML = "";

  globalSummary = createSummary(globalFrame);
  globalSummary.open = true;
  outputSection.appendChild(globalSummary);

  function createSummary(frame) {
    let details = document.createElement("details");
    let summary = document.createElement("summary");

    // ID
    summary.innerHTML = frame.name;
    details.appendChild(summary);

    // Parent
    let parent = document.createElement("div");
    if (frame.name == "Global") parent.innerHTML = "Parent: undefined";
    else parent.innerHTML = "Parent: " + frame.parent.id;
    details.appendChild(parent);

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

    details.appendChild(localVariables);

    // Children
    let frameChildren = document.createElement("div");

    let childrenTitle = document.createElement("div");
    childrenTitle.innerHTML = "Children: ";
    frameChildren.appendChild(childrenTitle);

    frame.children.forEach((child) => {
      frameChildren.appendChild(createSummary(child));
    });

    details.appendChild(frameChildren);

    return details;
  }
}
