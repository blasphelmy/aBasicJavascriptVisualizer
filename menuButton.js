function menuBarClick(){
  var element = document.getElementById("menuScreen");
  var navBar = document.getElementById("navbar");
  var menuButton = document.getElementById("menuButton");
  var menuButtContainer = document.getElementById("menuButtonContainer");
  if(element.classList.contains("hide")){
      element.classList.remove("hide");
      element.classList.add("show");
      // navBar.classList.add("blur");
      menuButtContainer.classList.add("clickedBG");
  }else{
    element.classList.remove("show");
      element.classList.add("hide");
      // navBar.classList.remove("blur");
      setTimeout(() => {
        menuButtContainer.classList.remove("clickedBG");
      }, 100);
  }
  var id = null;
  var initRotation = 0;
  clearInterval(id);
  id = setInterval(function(){
    if(initRotation >= 180){
      // menuButton.style.setProperty("transform", "rotate("+90+"deg)");
      clearInterval(id);
    }else{
      initRotation = initRotation + 5;
      menuButton.style.setProperty("transform", "rotate("+initRotation+"deg)");
    }
  }, 8);
}