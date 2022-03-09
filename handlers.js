function functionDeclaredHandler(index, array, Frame){
  var start = index;
  var end = findEOFLine(array, index);
  
  var element = document.getElementById(Frame.id + Frame.fIndex + "FunctionDef");
  var newFunctionDeclarationElement = document.createElement("p");
  newFunctionDeclarationElement.innerText = "FUNCTIONDEF: " + array[index+1] + "  { start: " + (start+2) + "; end: " + end + " }";
  element.appendChild(newFunctionDeclarationElement);
  element.classList.remove("hide");
  element.classList.add("show");
  
  var newFunction = new functionDEF(array[index+ 1], start+2, end);
  //console.log(newFunction);
  Frame.addFunctionDefinition(newFunction);
  return end;
}
function variableDeclarationHandler(index, array, Frame){
  if(new RegExp("=").test(array[index+1]) && !(new RegExp(/([0-9])+([ ]*)+([=])/gm)).test(array[index + 1])){
    var keyValuePair = array[index+1].split("=");
    keyValuePair[0] = keyValuePair[0].trim();
    var variableName = keyValuePair[0];
    var expression = keyValuePair[1];
    expression = expression.split(";");
    expression = evalExpression(expression[0], Frame, index);
    var newVarible = new variable(keyValuePair[0], eval(expression)); //cheater!
    Frame.addVariables(newVarible);
  }else if(!(new RegExp(/([0-9])+([ ]*)+([;])/gm)).test(array[index+1])){
    var keyValuePair = array[index+1].split(";");
    keyValuePair[0] = keyValuePair[0].trim();
    var newVarible = new variable(keyValuePair[0], null); //cheater!
    Frame.addVariables(newVarible);
  }
  appendVariablesToVisulizer(Frame);
  index++;
  return index;
}
function variableReassignmentHandler(index, array, Frame){
  var tempArray = array[index].split("=");
  var variableName = tempArray[0].trim();
  var expression = tempArray[1].split(";");

  expression = evalExpression(expression[0], Frame, index);

  var newFrame = returnFrameContainingVariable(Frame, variableName);
  newFrame.variables.set(variableName, eval(expression));
  appendVariablesToVisulizer(newFrame);
}

function evalExpression(string, Frame, index){ //in the format of 2 + 2 + a for example..
  var newArray = breakExpressionIntoComponents(string);
  console.log(newArray);
  for(var index = 0; index < newArray.length; index++){
    if((new RegExp(/(^[a-zA-Z][a-zA-Z]*[0-9]*)/gm)).test(newArray[index])){
      var newFrame = returnFrameContainingVariable(Frame, newArray[index]);
      newArray[index] = newFrame.variables.get(newArray[index]);
      if(typeof(newArray[index]) === "undefined"){
        newArray = "error";
      }
    }
  }
  return newArray.join("");
}
function breakExpressionIntoComponents(expression){ //expression should be a string.
  const basicArithmatics =  new RegExp(/([+|\-|*|/|(|)])/gm);
  var newComponentsArray = expression.split(basicArithmatics);
  newComponentsArray = removeEmptyIndices(newComponentsArray);
  newComponentsArray = trimStringInArray(newComponentsArray);
  return newComponentsArray;
}