function getInputString() {}

function breakIntoComponents(inputString) {
  //this needs more work
  //first, we must first remove all line breaks and whitespace. we also assume that user writes javascript with the use of semi colons...
  inputString = inputString.replace(/\n/g, " ");
  inputString = inputString.split(/(;)/g);
  // inputString.match(/[^\;]+\;?|\;/g);
  var outputArray = new Array();

  for (x = 0; x < inputString.length; x++) {
    var temp = inputString[x].split(/([}{])/g);
    for (index = 0; index < temp.length; index++) {
      outputArray.push(temp[index]);
    }
  }
  //we need to do all of this because im terrible with regex.
  outputArray = trimStringInArray(outputArray);
  outputArray = removeEmptyIndices(outputArray);
  outputArray = combineSemiColonsWithPreviousLines(outputArray);
  outputArray = splitIntoTokens(outputArray);
  outputArray = removeEmptyIndices(outputArray);
  return outputArray;
}
function splitIntoTokens(array) { //ONLY USE THIS AFTER INPUT STRING IS COMPLETELY BROKEN DOWN AND CLEANSED.
  var newArray = new Array();
  for (var index = 0; index < array.length; index++) {
    //FOR FUNCTION DECLARATIONS
    if (array[index].match(/(function[ ])/gm)) {
      var temp = array[index].split(/(function[ ]*)/gm);
      for (var x = 0; x < temp.length; x++) {
        newArray.push(temp[x]);
      }
    }
    //FOR VARIABLE DECLARATIONS
    else if (array[index].match(/(var[ ])/gm)) {
      var temp = array[index].split(/(var)[ ]*/gm);
      for (var x = 0; x < temp.length; x++) {
        newArray.push(temp[x]);
      }
    } else { //EVERYTHING ELSE SHOULD JUST BE REGULAR STATEMENTS, ei variable declare / redeclaration, function calls,  in theory this method should allow for the addition of if's loops etc...
      newArray.push(array[index]);
    }
  }
  return newArray;
}
function combineSemiColonsWithPreviousLines(array) { //cause i cant figure out how to split by semi colons on the 
  var newArray = new Array();                       //same line. whelps
  for (index = 0; index < array.length; index++) { 
    if (array[index].match(";")) {
      var temp = array[index - 1] + array[index];
      newArray.push(temp);
    } else if (!array[index + 1].match(";")) {
      newArray.push(array[index]);
    }
  }
  return newArray;
}
function trimStringInArray(array) {
  for (index = 0; index < array.length; index++) {
    array[index] = array[index].trim();
  }
  return array;
}
function removeEmptyIndices(array) {
  //clean array if nothing is detected on indexes
  var newArray = new Array();
  for (index = 0; index < array.length; index++) {
    if (!(array[index].trim().length === 0)) {
      newArray.push(array[index]);
    }
  }
  return newArray;
}
function findEOFLine(array, start) {
  //raw string -> breakIntoComponents() first. start is the index of the array where a function declartion is detected.
  var count = 0;
  var endLine = -1;
  for (index = start; index < array.length; index++) {
    if (array[index].search("{") > -1) {
      count = count + 1;
    }
    if (array[index].search("}") > -1) {
      count = count - 1;
    }
    if (count === 0 && array[index].search("}") > -1) {
      endLine = index;
      break;
    }
    // console.log(count);
  }
  return endLine;
}
function returnFunctionStack(array, start, end){ //returns a stack of statements as an array
  var newArray = new Array();
  for(index = start; index <= end; index++){
    newArray.push(array[index]);
  }
  return newArray;
}
function returnFrameContainingVariable(newFrame, variableName){
  while (!newFrame.variables.has(variableName) && typeof (newFrame.returnParentFrame()) !== "undefined") {
    newFrame = newFrame.returnParentFrame();
  }
  return newFrame;
}
function returnFrameContainingFunctionDEF(newFrame, functionName){
  while (!newFrame.returnFunctionDefinitions(functionName) && typeof (newFrame.returnParentFrame()) !== "undefined") {
    newFrame = newFrame.returnParentFrame();
  }
  return newFrame;
}
function outPutCallStacktoCodeEditor(CallStack){
  var newString = "";
  for(var index = 0; index < CallStack.length; index++){
    newString = newString + CallStack[index] + "\n";
  }
  outPutEditor.getDoc().setValue(newString);
}
function createNewFrameElements(elementFrame, Frame){
  var newScopeFrame = document.createElement("div");
  newScopeFrame.id = Frame.id + Frame.fIndex;
  newScopeFrame.classList.add("frameContainer", "scopeColors");
  newScopeFrame.innerHTML = "<p>Scope ID : " + Frame.id + "</p>";

  var newVariableFrames = document.createElement("div");
  newVariableFrames.id = Frame.id + Frame.fIndex + "variables";
  newVariableFrames.classList.add("frameContainer", "variableColors", "hide");
  // newVariableFrames.innerHTML = "<p>Active Variables : </p>";

  var newFunctionDefContainer = document.createElement("div");
  newFunctionDefContainer.id = Frame.id + Frame.fIndex + "FunctionDef";
  newFunctionDefContainer.classList.add("frameContainer", "functDEF", "hide");
  // newFunctionDefContainer.innerHTML = "<p>Function Definitions : </p>";

  var newFramesContainer = document.createElement("div");
  newFramesContainer.id = Frame.id + Frame.fIndex + "ChildrenFrames";
  newFramesContainer.classList.add("frameContainer",  "activeFrames", "hide");
  newFramesContainer.innerHTML = "<p>Active Frames : </p>";

  newScopeFrame.appendChild(newVariableFrames);
  newScopeFrame.appendChild(newFunctionDefContainer);
  newScopeFrame.appendChild(newFramesContainer);
  elementFrame.appendChild(newScopeFrame);
}
function appendVariablesToVisulizer(Frame){
  var frameVariables = Frame.variables;
  var element = document.getElementById(Frame.id + Frame.fIndex + "variables");
  element.innerHTML = "";
  if(element.classList.contains("hide")){
    setTimeout(() => {
      element.classList.remove("hide");
      element.classList.add("show", "fade-in");
    }, count * defaultDelay);
  }
  count++;

  var newElementChild = document.createElement("p");
  newElementChild.innerHTML = "Active Variables :";

  element.appendChild(newElementChild);
  for (const [key, value] of frameVariables.entries()) {
    var newElementChild = document.createElement("p");
    newElementChild.innerHTML = "{ name: " + key + "; value: " + value + " }";
    element.appendChild(newElementChild);
  }
}
function evalExpression(string, Frame, line, array){ //in the format of 2 + 2 + a for example..
  var newArray = breakExpressionIntoComponents(string);
  for(var index = 0; index < newArray.length; index++){
    if(detectFunctionCalls(newArray[index])){
      var functionCallBreakdown = extractFunctionParameters(newArray[index]);
      var originFrame = returnFrameContainingFunctionDEF(Frame, functionCallBreakdown[0]);
      if(originFrame.returnFunctionDefinitions(functionCallBreakdown[0])){
        var newFunctionDef = originFrame.returnFunctionDefinitions(functionCallBreakdown[0]);
        var newFrame = new frame(newFunctionDef, line, count);
        if(newFunctionDef.inputParamenters != ''){
          for(var i = 0; i < newFunctionDef.inputParamenters.length; i++){
            functionCallBreakdown[1][i] = eval(evalExpression(functionCallBreakdown[1][i], Frame, line));
            newFrame.variables.set(newFunctionDef.inputParamenters[i], functionCallBreakdown[1][i]);
          }
        }
        newFrame.previousNodeFrame = originFrame;
        originFrame.addChildFrame(newFrame);
        newArray[index] =  interpretCallStack(array, newFrame);
      }
      else{
        addConsoleLine("error: on line " + index + " function definition doesn't exist!");
        errorDetected = true;
        return;
      }
    }
    else if((new RegExp(/(^[a-zA-Z][a-zA-Z]*[0-9]*)/gm)).test(newArray[index])){
      var newFrame = returnFrameContainingVariable(Frame, newArray[index]);
      newArray[index] = newFrame.variables.get(newArray[index]);
      // console.log("frame: ", Frame, "line: ", line, "array.index = ", newArray[index]);
      if(typeof(newArray[index]) === "undefined"){
        addConsoleLine("error: variable undefined on line: " + line);
        errorDetected = true;
        return;
      }
      if((new RegExp(/((^[a-zA-Z][a-zA-Z]*[0-9]*))/gm)).test(newArray[index]) && typeof(newArray[index]) !== "undefined"){
        newArray[index] = '"' + newArray[index] + '"';
      }
    }
  }
  var expression = newArray.join("");

  try{
    eval(expression);
  }catch{
    addConsoleLine("error evaluating expression on line: " + line);
    errorDetected = true;
    return;
  }
  
  return expression;
}
function breakExpressionIntoComponents(expression){ //expression should be a string.
  const basicArithmatics =  new RegExp(/([+|\-|*|/])(?![^(]*\))/gm);
  var newComponentsArray = expression.split(basicArithmatics);
  newComponentsArray = removeEmptyIndices(newComponentsArray);
  newComponentsArray = trimStringInArray(newComponentsArray);
  return newComponentsArray;
}
function addConsoleLine(string){
  setTimeout(() => {
    var element = document.getElementById("console");
    var newConsoleLine = document.createElement("p");
    newConsoleLine.classList.add("slideIn");
    newConsoleLine.innerText = string;
    element.appendChild(newConsoleLine);
  }, consoleline * defaultDelay/3);
   consoleline = consoleline+1;
}
function runButton(){
  initParse();
}
function showHide(){
  var element = document.getElementById("mainFrameContainer");
  if(element.classList.contains("hide")){
    element.classList.remove("hide");
    element.classList.add("show", "fade-in");
  }
  else{
    element.classList.remove("show");
    element.classList.add("hide");
  }
}