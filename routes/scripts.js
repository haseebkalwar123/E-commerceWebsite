const router = require('express').Router();
(function(){

 var preload = document.getElementById("preload");
 var loading = 0;
 var id = setInterval(frame, 64);

 function frame(){
  if(loading == 100) {
   clearInterval(id);
   
   // router.get("/",function(req,res){
   //  res.render('main/home')
   // });
   window.open("main/home","_self");
  }
  else {
   loading = loading + 1;
   if(loading == 90) {
    preload.style.animation = "fadeout 1s ease";
   }
  }
 }


})();
