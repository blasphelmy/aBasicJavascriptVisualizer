function functionDeclaredHandler(index, array, Frame){
  var start = index;
  var end = findEOFLine(array, index);
  var newFunction = new functionDEF(array[index+ 1], start+2, end);
  //console.log(newFunction);
  Frame.addFunctionDefinition(newFunction);
  return end;
}
function variableDeclarationHandler(index, array, Frame){
  //console.log("is variable declartion at index: " + index);
  var keyValuePair = array[index+1].split("=");
  keyValuePair[0] = keyValuePair[0].trim();
  
  var variableName = keyValuePair[0];
  var expression = keyValuePair[1];
  console.log(keyValuePair);
  expression = breakExpressionIntoComponents(expression);
  // console.log(expression);
  var newVarible = new variable(keyValuePair[0], eval(keyValuePair[1])); //cheater!
  Frame.addVariables(newVarible);
  index++;
  return index;
}