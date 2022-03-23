function functionDeclaredHandler(index, array, Frame){
  var start = index;
  var end = findMatching(array, index, "{");

  //console.log(array[index+1]);
  var newFunctionDefArray = extractFunctionParameters(array[index+1]);
  
  var element = document.getElementById(Frame.id + Frame.fIndex + "FunctionDef");
  var newFunctionDeclarationElement = document.createElement("p");
  newFunctionDeclarationElement.classList.add("fade-in-no-bounce");
  newFunctionDeclarationElement.innerText = "FUNCTIONDEF: " + array[index+1] + "  { start: " + (start+2) + "; end: " + end + " }";
  if(element.classList.contains("hide")){
    setTimeout(() => {
      element.classList.remove("hide");
      element.classList.add("show", "fade-in");
    }, count*defaultDelay);
    count++;
  }
  setTimeout(() => {
    element.appendChild(newFunctionDeclarationElement);
  }, count * defaultDelay);
  count++;
  
  var newFunction = new functionDEF(newFunctionDefArray, start+2, end);
  //console.log(newFunction);
  Frame.addFunctionDefinition(newFunction);
  return end;
}
function variableDeclarationHandler(index, array, Frame){
  if(new RegExp("=").test(array[index+1]) && (new RegExp(/(^[a-zA-Z0-9]*)+([ ]*)+([=])/gm)).test(array[index + 1])){
    var keyValuePair = array[index+1].split(/=(.*)/s);
    keyValuePair[0] = keyValuePair[0].trim();
    if(new RegExp(/\s/gm).test(keyValuePair[0])){
      addConsoleLine("variable declaration error on line: " + index + 1);
      errorDetected = true;
      return;
    }
    var variableName = keyValuePair[0];
    var expression = keyValuePair[1];
    expression = expression.split(";");
    expression = evalExpression(expression[0], Frame, index+1, array);
    var newVarible = new variable(keyValuePair[0], eval(expression)); //cheater!
    Frame.addVariables(newVarible);
  }else if(!(new RegExp(/([0-9])+([ ]*)+([;])/gm)).test(array[index+1])){
    var keyValuePair = array[index+1].split(";");
    keyValuePair[0] = keyValuePair[0].trim();
    if(new RegExp(/\s/gm).test(keyValuePair[0])){
      addConsoleLine("variable declaration error on line: " + (index + 1));
      errorDetected = true;
      return;
    }
    var newVarible = new variable(keyValuePair[0], null); //cheater!
    Frame.addVariables(newVarible);
  }else{
    addConsoleLine("error on line: " + (index + 1));
    errorDetected = true;
    return;
  }
    appendVariablesToVisulizer(Frame);
  index++;
  return index;
}
function variableReassignmentHandler(index, array, Frame){
  var tempArray = array[index].split(/=(.*)/s);
  var variableName = tempArray[0].trim();
  var expression = tempArray[1].split(";");
  if(new RegExp(/\s/gm).test(variableName)){
    errorDetected = true;
    addConsoleLine("variable error on line: " + (index + 1));
    return;
  }
  expression = evalExpression(expression[0], Frame, index, array);

  var newFrame = returnFrameContainingVariable(Frame, variableName);
  newFrame.variables.set(variableName, eval(expression));
    appendVariablesToVisulizer(newFrame);
}
function consoleLoghandler(index, array, Frame){
  var newExpression = array[index].split(/^([ ]*)+(?:[console])+([ ]*)+([.])+([ ]*)+(?:log)/gm);
  expression = evalExpression(newExpression[5], Frame, index, array);
  addConsoleLine(index + "> " + eval(expression));
}
function functionCallHandler(array, index, Frame){
  var functionCallBreakdown = extractFunctionParameters(array[index]);
  var originFrame = returnFrameContainingFunctionDEF(Frame, functionCallBreakdown[0]);
  if(originFrame.returnFunctionDefinitions(functionCallBreakdown[0])){
    var newFunctionDef = originFrame.returnFunctionDefinitions(functionCallBreakdown[0]);
    var newFrame = new frame(newFunctionDef, index, count);
    if(newFunctionDef.inputParamenters != ''){
      for(var i = 0; i < newFunctionDef.inputParamenters.length; i++){
        functionCallBreakdown[1][i] = eval(evalExpression(functionCallBreakdown[1][i], Frame, index));
        newFrame.variables.set(newFunctionDef.inputParamenters[i], functionCallBreakdown[1][i]);
      }
    }
    newFrame.previousNodeFrame = originFrame;
    originFrame.addChildFrame(newFrame);
    interpretCallStack(array, newFrame);
  }
  else{
    addConsoleLine("error: on line " + index + " function definition doesn't exist!");
    errorDetected = true;
    return;
  }
}
function returnHandler(array, index, Frame){
  var newArray = array[index].split(/(return+[ ]+)/);
  newArray = removeEmptyIndices(newArray);
  newArray = trimStringInArray(newArray);
  
  var expression = newArray[1].split(";");
  var expression = evalExpression(expression[0], Frame, index, array);
  return eval(expression);

}
