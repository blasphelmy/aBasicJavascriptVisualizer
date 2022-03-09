function detectFunctionCalls(string){
    const detectFunctCalls = new RegExp(/(^[a-z,A-Z,0-9]*)+([ ]*)+([(])+([a-z,A-Z,0-9]*)+([)])+([;])/gm);
    //make improvements here https://regex101.com/r/MqSsCA/1
    if(detectFunctCalls.test(string)){
      return true;
    }
    else{
      return false;
    }
  }
  function isFunctionDeclarion(string) {
    var isFunctionDeclartion = new RegExp(/((function) +[a-z,A-Z,0-9]*)/gim);
    //make improvements to this regexp here : https://regex101.com/r/9IiFmz/1
    return isFunctionDeclartion.test(string);
  }
  function detectStatementVariableReassignment(string){
    const detectVarReassignStatement = new RegExp(/^([a-zA-Z0-9]*[ ]*[=][ , a-zA-Z, 0-9, *, /, +, -, ;]*)/gm);
    //improve this regex here: https://regex101.com/r/Gp6J3c/1
    return detectVarReassignStatement.test(string);
  }
  function isVarDeclartion(string){
    var isVar = new RegExp(/var/gim);
    //make improvements to this regexp here : https://regex101.com/r/9IiFmz/1
    return isVar.test(string);
  }
  function typeOfVariabe(string) {
    //-1 for false, 0 var declared w/o assignment, 1 var declared /w assignment
    const isVariableDeclartionWithAssignment = new RegExp(
      /(var[ ]*[a-z, A-Z, 0-9]*[=][ ]*[a-z, A-Z, 0-9,+,-,*,/,",']*[;])/gm
    );
    //improve this regexp here https://regex101.com/r/FjoVKw/1
    const isVarDeclarNoAssignment = new RegExp(
      /(var[ ]*[a-z, A-Z, 0-9]*[;])/gm
    );
    //improve this regexp here https://regex101.com/r/T97bkY/1 //please add onto links. dont delete any previous if youre making changes.
    //console.log(isVarDeclarNoAssignment.test(string), string);
    if (isVarDeclarNoAssignment.test(string)) {
      return "isNullValue";
    }
    if (isVariableDeclartionWithAssignment.test(string) == true) {
      return "hasValue";
    }
  }
  function detectConsoleLog(string){
    var detectConsole = new RegExp(/([ ]*)+([a-zA-Z])+([ ]*)+([.])+([ ]*)+(?:log)/gm);
    return detectConsole.test(string);
  }